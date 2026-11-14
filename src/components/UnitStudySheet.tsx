import { useState } from 'react';
import { CheckSquare, Square, ChevronDown, ChevronUp } from 'lucide-react';
import type { DecoUnit, StudyViewMode } from '../types/deco';

interface UnitStudySheetProps {
  unit: DecoUnit;
  viewMode: StudyViewMode;
  completedTopicIds: Set<string>;
  onToggleTopicComplete: (topicId: string) => void;
}

export function UnitStudySheet({
  unit,
  viewMode,
  completedTopicIds,
  onToggleTopicComplete,
}: UnitStudySheetProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    {},
  );
  const [expandedExamples, setExpandedExamples] = useState<
    Record<string, boolean>
  >({});

  const unitCompletedCount = unit.importantTopics.filter((t) =>
    completedTopicIds.has(t.id),
  ).length;

  const toggleExample = (sectionId: string) => {
    setExpandedExamples((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === undefined ? false : !prev[sectionId],
    }));
  };

  const showNotes = viewMode === 'split-line' || viewMode === 'notes-only';
  const showImportant =
    viewMode === 'split-line' || viewMode === 'important-only';

  return (
    <article
      aria-labelledby={`unit-${unit.unitNumber}-heading`}
      className="border border-slate-200 bg-white rounded-xl p-6 sm:p-8"
    >
      {/* Unit Header */}
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-medium text-slate-500">
          <span className="font-mono text-sky-800 font-semibold">
            UNIT 0{unit.unitNumber} OF 05
          </span>
          <div className="flex items-center gap-2 tabular-nums">
            <span>Est. {unit.estimatedHours}</span>
            <span aria-hidden="true">·</span>
            <span>
              {unitCompletedCount}/{unit.importantTopics.length} Important Topics Revised
            </span>
          </div>
        </div>

        <h2
          id={`unit-${unit.unitNumber}-heading`}
          className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-balance"
        >
          {unit.title}
        </h2>
        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {unit.subtitle}
        </p>
      </header>

      <hr className="my-6 border-t border-slate-200" />

      {/* PART A: UNIT NOTES */}
      {showNotes && (
        <section
          id={`unit-${unit.unitNumber}-notes`}
          aria-label={`Unit ${unit.unitNumber} Notes`}
          className="space-y-8"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Unit {unit.unitNumber} Study Notes
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {unit.notes.length} Core Sections
            </span>
          </div>

          <div className="space-y-8">
            {unit.notes.map((section, idx) => {
              const isExampleOpen = expandedExamples[section.id] !== false;
              return (
                <div key={section.id} className="space-y-3">
                  {idx > 0 && <hr className="border-t border-slate-100 mb-6" />}

                  <h4 className="font-display text-base sm:text-lg font-semibold text-slate-900">
                    {section.heading}
                  </h4>
                  <p className="text-sm sm:text-[15px] text-slate-700 leading-relaxed max-w-[72ch]">
                    {section.summary}
                  </p>

                  <ul className="space-y-2 pl-5 list-disc text-sm sm:text-[15px] text-slate-700 leading-relaxed max-w-[72ch]">
                    {section.keyPoints.map((pt, pIdx) => (
                      <li key={pIdx}>{pt}</li>
                    ))}
                  </ul>

                  {section.formulasOrTables &&
                    section.formulasOrTables.length > 0 && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-4 font-mono text-xs sm:text-[13px] text-slate-800 space-y-1.5">
                        <div className="font-sans text-xs font-semibold text-slate-500 mb-2">
                          Formulas &amp; Rules to Memorize
                        </div>
                        {section.formulasOrTables.map((item, fIdx) => (
                          <div key={fIdx} className="leading-relaxed">
                            {item}
                          </div>
                        ))}
                      </div>
                    )}

                  {section.workedExample && (
                    <div className="mt-3 rounded-lg bg-sky-50/60 p-4">
                      <button
                        type="button"
                        onClick={() => toggleExample(section.id)}
                        aria-expanded={isExampleOpen}
                        className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-sky-950 cursor-pointer"
                      >
                        <span>
                          Solved Exam Example: {section.workedExample.problem}
                        </span>
                        {isExampleOpen ? (
                          <ChevronUp
                            className="h-4 w-4 shrink-0 text-sky-800"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronDown
                            className="h-4 w-4 shrink-0 text-sky-800"
                            aria-hidden="true"
                          />
                        )}
                      </button>

                      {isExampleOpen && (
                        <ol className="mt-3 space-y-1.5 pl-5 list-decimal text-sm font-mono text-slate-800">
                          {section.workedExample.solutionSteps.map(
                            (step, sIdx) => (
                              <li key={sIdx} className="leading-relaxed">
                                {step}
                              </li>
                            ),
                          )}
                        </ol>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* EXPLICIT LINE SEPARATOR BETWEEN NOTES AND IMPORTANT TOPICS */}
      {viewMode === 'split-line' && (
        <div
          className="my-10 flex items-center gap-4"
          role="separator"
          aria-label={`Line separator between Unit ${unit.unitNumber} notes and important topics`}
        >
          <hr className="flex-1 border-t-2 border-slate-900" />
          <span className="font-mono text-xs font-semibold tracking-wider text-slate-900 whitespace-nowrap">
            IMPORTANT EXAM TOPICS · UNIT {unit.unitNumber}
          </span>
          <hr className="flex-1 border-t-2 border-slate-900" />
        </div>
      )}

      {/* PART B: SEPARATED IMPORTANT EXAM TOPICS */}
      {showImportant && (
        <section
          id={`unit-${unit.unitNumber}-important`}
          aria-label={`Unit ${unit.unitNumber} Important Exam Topics`}
          className="space-y-6"
        >
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              Unit {unit.unitNumber} Important Topics for Exam
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {unit.importantTopics.length} High-Yield Topics
            </span>
          </div>

          <div className="divide-y divide-slate-200">
            {unit.importantTopics.map((topic, tIdx) => {
              const isDone = completedTopicIds.has(topic.id);
              const isMustRevise = topic.priority === 'Must Revise';
              return (
                <div
                  key={topic.id}
                  className={`py-5 first:pt-2 last:pb-2 transition-opacity ${
                    isDone ? 'opacity-75' : 'opacity-100'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                        <span className="font-mono text-slate-500">
                          Topic {tIdx + 1}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span
                          className={
                            isMustRevise
                              ? 'font-semibold text-amber-800'
                              : 'text-sky-800 font-semibold'
                          }
                        >
                          {topic.priority}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">
                          ·
                        </span>
                        <span className="font-mono text-slate-700">
                          {topic.examMarks}
                        </span>
                      </div>

                      <h4 className="font-display text-base font-bold text-slate-900">
                        {topic.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleTopicComplete(topic.id)}
                      aria-pressed={isDone}
                      aria-label={`Mark "${topic.title}" as revised`}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isDone ? (
                        <CheckSquare className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      )}
                      <span>{isDone ? 'Revised' : 'Mark Revised'}</span>
                    </button>
                  </div>

                  <p className="mt-2.5 text-sm font-medium text-slate-800">
                    Likely Question: {topic.expectedQuestion}
                  </p>

                  <ul className="mt-2 space-y-1 pl-5 list-disc text-sm text-slate-600 leading-relaxed">
                    {topic.answerOutline.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* QUICK PRACTICE CHECK */}
      {unit.practiceQuestions.length > 0 && (
        <>
          <hr className="my-8 border-t border-slate-200" />
          <section
            aria-label={`Unit ${unit.unitNumber} Quick Self-Check`}
            className="no-print space-y-5"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-display text-base font-bold text-slate-900">
                Quick Self-Check · Unit {unit.unitNumber}
              </h3>
              <span className="text-xs font-mono text-slate-500">
                Instant Answer Verification
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {unit.practiceQuestions.map((q, qIdx) => {
                const chosen = selectedAnswers[q.id];
                const isAnswered = chosen !== undefined;
                const isCorrect = chosen === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className="rounded-lg bg-slate-50 p-4 space-y-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      Q{qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-1.5">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = chosen === oIdx;
                        const isRightOpt = oIdx === q.correctIndex;
                        let btnStyle =
                          'bg-white border-slate-200 text-slate-800 hover:bg-slate-100';
                        if (isAnswered) {
                          if (isRightOpt) {
                            btnStyle =
                              'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold';
                          } else if (isSelected) {
                            btnStyle =
                              'bg-red-50 border-red-300 text-red-900';
                          }
                        }
                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() =>
                              setSelectedAnswers((prev) => ({
                                ...prev,
                                [q.id]: oIdx,
                              }))
                            }
                            className={`w-full text-left rounded-md border px-3 py-2 text-xs sm:text-sm transition-colors cursor-pointer ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <p
                        className={`text-xs leading-relaxed ${
                          isCorrect ? 'text-emerald-800' : 'text-slate-700'
                        }`}
                      >
                        <strong>{isCorrect ? 'Correct:' : 'Explanation:'}</strong>{' '}
                        {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </article>
  );
}
