import { useState } from 'react';
import { Check, Copy, Download, Printer, X } from 'lucide-react';
import type { DecoUnit } from '../types/deco';
import { formatUnitsWithLineSeparators } from '../utils/decoLogic';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: DecoUnit[];
}

export function ExportModal({ isOpen, onClose, units }: ExportModalProps) {
  const [exportMode, setExportMode] = useState<'full' | 'important-only'>(
    'full',
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formattedText = formatUnitsWithLineSeparators(units, exportMode);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download =
      exportMode === 'full'
        ? 'DECO-5-Unit-Notes-and-Important-Topics.md'
        : 'DECO-5-Unit-Important-Topics.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
      className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
    >
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <h2
              id="export-dialog-title"
              className="font-display text-lg font-bold text-slate-900"
            >
              Export Line-Separated DECO Study Sheet
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes horizontal divider lines separating Unit Notes and Important Exam Topics.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div className="inline-flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() => setExportMode('full')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                exportMode === 'full'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Units + Important Topics
            </button>
            <button
              type="button"
              onClick={() => setExportMode('important-only')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                exportMode === 'important-only'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Important Topics Only
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Download .md</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-800 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Print Sheet</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800">
            {formattedText}
          </pre>
        </div>
      </div>
    </div>
  );
}
