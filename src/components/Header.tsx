interface HeaderProps {
  onOpenExport: () => void;
  onNavigate: (sectionId: string) => void;
}

export function Header({ onOpenExport, onNavigate }: HeaderProps) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-600"
        >
          DECO Exam Studio
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#unit-notes"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('unit-notes');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Unit Notes
          </a>
          <a
            href="#important-topics"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('important-topics');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Important Topics
          </a>
          <a
            href="#drive-sync"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('drive-sync');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Drive Sync
          </a>
          <a
            href="#lab-simulators"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('lab-simulators');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Lab Simulators
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenExport}
            className="px-4 py-2 text-sm font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 cursor-pointer"
          >
            Export Notes
          </button>
        </div>
      </div>
    </header>
  );
}
