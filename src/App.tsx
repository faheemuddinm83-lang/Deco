import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_DECO_UNITS } from './data/defaultDecoUnits';
import type { DecoUnit, StudyViewMode } from './types/deco';
import { calculateMasteryProgress } from './utils/decoLogic';
import { Header } from './components/Header';
import { DriveSyncPanel } from './components/DriveSyncPanel';
import { UnitStudySheet } from './components/UnitStudySheet';
import { DecoLabSimulators } from './components/DecoLabSimulators';
import { ExportModal } from './components/ExportModal';

const STORAGE_COMPLETED_KEY = 'deco_revised_topics_v1';
const STORAGE_CUSTOM_UNITS_KEY = 'deco_custom_units_v1';

export default function App() {
  const [units, setUnits] = useState<DecoUnit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_UNITS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as DecoUnit[];
        if (Array.isArray(parsed) && parsed.length === 5) return parsed;
      }
    } catch {
      // Fallback to built-in 5-unit DECO curriculum
    }
    return DEFAULT_DECO_UNITS;
  });

  const [sourceLabel, setSourceLabel] = useState<string>(
    'Standard UG DECO 5-Unit Exam Curriculum',
  );
  const [activeUnitSelection, setActiveUnitSelection] = useState<
    number | 'all'
  >(1);
  const [viewMode, setViewMode] = useState<StudyViewMode>('split-line');
  const [isDriveExpanded, setIsDriveExpanded] = useState<boolean>(true);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(
    () => {
      try {
        const raw = localStorage.getItem(STORAGE_COMPLETED_KEY);
        if (raw) {
          return new Set(JSON.parse(raw) as string[]);
        }
      } catch {
        // Ignore invalid storage
      }
      return new Set();
    },
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_COMPLETED_KEY,
        JSON.stringify(Array.from(completedTopicIds)),
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [completedTopicIds]);

  const handleToggleTopicComplete = (topicId: string) => {
    setCompletedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  };

  const handleUnitsSynthesized = (newUnits: DecoUnit[], label: string) => {
    setUnits(newUnits);
    setSourceLabel(label);
    try {
      localStorage.setItem(STORAGE_CUSTOM_UNITS_KEY, JSON.stringify(newUnits));
    } catch {
      // Ignore storage errors
    }
  };

  const handleResetToDefault = () => {
    setUnits(DEFAULT_DECO_UNITS);
    setSourceLabel('Standard UG DECO 5-Unit Exam Curriculum');
    localStorage.removeItem(STORAGE_CUSTOM_UNITS_KEY);
  };

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'important-topics') {
      setViewMode('split-line');
      const targetId =
        activeUnitSelection === 'all'
          ? 'unit-1-important'
          : `unit-${activeUnitSelection}-important`;
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    if (sectionId === 'drive-sync') {
      setIsDriveExpanded(true);
    }
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const mastery = calculateMasteryProgress(units, completedTopicIds);

  const visibleUnits =
    activeUnitSelection === 'all'
      ? units
      : units.filter((u) => u.unitNumber === activeUnitSelection);

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        onOpenExport={() => setIsExportOpen(true)}
        onNavigate={handleNavigate}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Hero / Overview Band */}
        <section className="no-print flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
              <span>UG Computer Engineering</span>
              <span aria-hidden="true">·</span>
              <span>Digital Electronics &amp; Computer Organization</span>
              <span aria-hidden="true">·</span>
              <span className="text-sky-800 font-semibold">{sourceLabel}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
              5-Unit DECO Exam Notes &amp; Separated Important Topics
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Structured unit-by-unit revision sheets where core theory notes and high-yield exam topics are divided by clear horizontal lines. Connect your Google Drive study folder to synthesize notes directly from your class materials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 min-w-[220px]">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Exam Topic Mastery</span>
                <span className="font-mono font-semibold text-slate-900 tabular-nums">
                  {mastery.completedTopics}/{mastery.totalTopics} ({mastery.percent}%)
                </span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full bg-sky-700 transition-all duration-200"
                  style={{ width: `${mastery.percent}%` }}
                />
              </div>
            </div>

            {sourceLabel !== 'Standard UG DECO 5-Unit Exam Curriculum' && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset Default</span>
              </button>
            )}
          </div>
        </section>

        {/* Google Drive Sync & Custom Syllabus Synthesis */}
        <DriveSyncPanel
          onUnitsSynthesized={handleUnitsSynthesized}
          isExpanded={isDriveExpanded}
          onToggleExpand={() => setIsDriveExpanded((v) => !v)}
        />

        {/* Workspace Toolbar: Line-Separated Layout Mode */}
        <section
          id="unit-notes"
          className="no-print flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-3.5"
        >
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700 max-w-full">
            <span className="shrink-0">View Layout:</span>
            <div
              role="group"
              aria-label="Study view mode"
              className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1 max-w-full"
            >
              <button
                type="button"
                onClick={() => setViewMode('split-line')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'split-line'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Notes + Important (Line Divided)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('notes-only')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'notes-only'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unit Notes Only
              </button>
              <button
                type="button"
                onClick={() => setViewMode('important-only')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  viewMode === 'important-only'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Important Topics Only
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveUnitSelection(
                activeUnitSelection === 'all' ? 1 : 'all',
              )
            }
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {activeUnitSelection === 'all'
              ? 'Switch to Single Unit Focus'
              : 'Show All 5 Units (Line-Separated)'}
          </button>
        </section>

        {/* Main Split Layout: 5-Unit Navigation Rail + Study Sheet */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside
            aria-label="DECO 5-Unit Selector"
            className="no-print lg:w-72 lg:sticky lg:top-20 shrink-0 space-y-2"
          >
            <div className="text-xs font-semibold text-slate-500 px-1 mb-2">
              SYLLABUS UNITS
            </div>

            {units.map((unit) => {
              const isActive = activeUnitSelection === unit.unitNumber;
              const stats = mastery.byUnit[unit.unitNumber];
              return (
                <button
                  key={unit.unitNumber}
                  type="button"
                  onClick={() => setActiveUnitSelection(unit.unitNumber)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full text-left rounded-xl border p-3.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-sky-700 bg-sky-50/70 text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span
                      className={
                        isActive
                          ? 'font-bold text-sky-800'
                          : 'font-semibold text-slate-500'
                      }
                    >
                      UNIT 0{unit.unitNumber}
                    </span>
                    <span className="text-slate-500 tabular-nums">
                      {stats?.completed ?? 0}/{stats?.total ?? 0} done
                    </span>
                  </div>
                  <div className="mt-1 font-display text-sm font-bold text-slate-900 leading-snug">
                    {unit.title}
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setActiveUnitSelection('all')}
              aria-current={activeUnitSelection === 'all' ? 'page' : undefined}
              className={`w-full text-left rounded-xl border p-3.5 transition-colors cursor-pointer ${
                activeUnitSelection === 'all'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
              }`}
            >
              <div className="text-xs font-mono opacity-80">CONTINUOUS SHEET</div>
              <div className="mt-0.5 font-display text-sm font-bold">
                All 5 Units (Line-Separated)
              </div>
            </button>
          </aside>

          {/* Study Sheet Column */}
          <div className="flex-1 min-w-0 space-y-10">
            {visibleUnits.map((unit, idx) => (
              <div key={unit.unitNumber}>
                {idx > 0 && (
                  <div
                    className="my-10 flex items-center gap-4"
                    role="separator"
                    aria-label={`Divider before Unit ${unit.unitNumber}`}
                  >
                    <hr className="flex-1 border-t-2 border-dashed border-slate-400" />
                    <span className="font-mono text-xs font-semibold text-slate-600 whitespace-nowrap">
                      NEXT UNIT · UNIT 0{unit.unitNumber}
                    </span>
                    <hr className="flex-1 border-t-2 border-dashed border-slate-400" />
                  </div>
                )}
                <UnitStudySheet
                  unit={unit}
                  viewMode={viewMode}
                  completedTopicIds={completedTopicIds}
                  onToggleTopicComplete={handleToggleTopicComplete}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Interactive DECO Lab Simulators */}
        <DecoLabSimulators />
      </main>

      <footer className="no-print mt-12 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:px-6 lg:px-8">
          <span>DECO Exam Studio · UG 5-Unit Study Companion</span>
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
          >
            Export Line-Separated Markdown Sheet
          </button>
        </div>
      </footer>

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        units={units}
      />
    </div>
  );
}
