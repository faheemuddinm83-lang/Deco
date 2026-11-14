import { useState, useEffect, type ChangeEvent } from 'react';
import type { User } from 'firebase/auth';
import {
  FolderOpen,
  RefreshCw,
  FileText,
  Sparkles,
  LogOut,
  Upload,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { DecoUnit, DriveFileItem } from '../types/deco';
import {
  DEFAULT_DRIVE_FOLDER_URL,
  extractDriveFolderId,
} from '../utils/decoLogic';
import {
  getAccessToken,
  googleSignIn,
  initAuth,
  logout,
} from '../services/driveAuth';
import {
  fetchDriveFileContent,
  listDriveFolderFiles,
  type DriveFilePayload,
} from '../services/driveApi';

interface DriveSyncPanelProps {
  onUnitsSynthesized: (units: DecoUnit[], sourceLabel: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function DriveSyncPanel({
  onUnitsSynthesized,
  isExpanded,
  onToggleExpand,
}: DriveSyncPanelProps) {
  const [sourceTab, setSourceTab] = useState<'drive' | 'paste'>('drive');
  const [folderUrl, setFolderUrl] = useState(DEFAULT_DRIVE_FOLDER_URL);
  const [examPattern, setExamPattern] = useState(
    'UG University Semester Exam (2-mark short & 8-10 mark long questions)',
  );

  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [folderName, setFolderName] = useState<string>('');
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set(),
  );
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const [pastedSyllabus, setPastedSyllabus] = useState('');
  const [localFiles, setLocalFiles] = useState<DriveFilePayload[]>([]);

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser) => {
        setUser(authedUser);
        setNeedsAuth(false);
      },
      (signedOutOrNoTokenUser) => {
        setUser(signedOutOrNoTokenUser);
        setNeedsAuth(true);
      },
    );
    return unsubscribe;
  }, []);

  const handleLoadFolder = async (tokenOverride?: string) => {
    const folderId = extractDriveFolderId(folderUrl);
    if (!folderId) {
      setErrorMsg(
        'Enter a valid Google Drive folder URL or folder ID (e.g. https://drive.google.com/drive/folders/...).',
      );
      return;
    }

    const token = tokenOverride ?? getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      setErrorMsg('Please sign in with Google to access your Drive folder.');
      return;
    }

    setErrorMsg(null);
    setStatusMsg(null);
    setIsLoadingFiles(true);
    try {
      const result = await listDriveFolderFiles(folderId, token);
      setFolderName(result.folderName);
      setDriveFiles(result.files);
      const selectable = result.files.filter(
        (f) => f.mimeType !== 'application/vnd.google-apps.folder',
      );
      setSelectedFileIds(new Set(selectable.slice(0, 6).map((f) => f.id)));
      if (result.files.length === 0) {
        setStatusMsg(
          'This Google Drive folder is empty. Try pasting syllabus text or uploading files directly.',
        );
      } else {
        setStatusMsg(
          `Loaded ${result.files.length} item(s) from "${result.folderName}".`,
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to read Google Drive folder.';
      setErrorMsg(msg);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setNeedsAuth(false);
        await handleLoadFolder(res.accessToken);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Google Sign-In failed.';
      setErrorMsg(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
    setDriveFiles([]);
    setSelectedFileIds(new Set());
    setFolderName('');
    setStatusMsg('Signed out from Google Drive.');
  };

  const toggleFileSelection = (id: string) => {
    setSelectedFileIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSynthesizeFromDrive = async () => {
    const token = getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      setErrorMsg('Session token expired. Please sign in with Google again.');
      return;
    }

    const chosen = driveFiles.filter((f) => selectedFileIds.has(f.id));
    if (chosen.length === 0) {
      setErrorMsg('Select at least one file from the Drive folder first.');
      return;
    }

    setErrorMsg(null);
    setStatusMsg('Reading selected Drive files and generating 5-unit notes...');
    setIsSynthesizing(true);

    try {
      const payloads: DriveFilePayload[] = [];
      for (const file of chosen.slice(0, 6)) {
        const content = await fetchDriveFileContent(file, token);
        payloads.push(content);
      }

      const apiRes = await fetch('/api/deco/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderName: folderName || 'Google Drive DECO Folder',
          files: payloads,
          focusExamPattern: examPattern,
        }),
      });

      const data = (await apiRes.json()) as {
        units?: DecoUnit[];
        error?: string;
      };

      if (!apiRes.ok || !data.units) {
        throw new Error(data.error || 'Failed to synthesize notes from Drive files.');
      }

      onUnitsSynthesized(
        data.units,
        `Synthesized from ${payloads.length} file(s) in "${folderName || 'Drive Folder'}"`,
      );
      setStatusMsg(
        `Generated custom 5-unit DECO notes and separated important topics from ${payloads.length} Drive file(s).`,
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Synthesis failed. Please retry.';
      setErrorMsg(msg);
      setStatusMsg(null);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleLocalFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setErrorMsg(null);

    const loaded: DriveFilePayload[] = [];
    for (const file of Array.from(fileList).slice(0, 5)) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(`"${file.name}" exceeds 10 MB limit.`);
        continue;
      }
      if (
        file.type.startsWith('text/') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.md')
      ) {
        const text = await file.text();
        loaded.push({
          id: `local-${file.name}`,
          name: file.name,
          mimeType: 'text/plain',
          textContent: text,
        });
      } else if (
        file.type === 'application/pdf' ||
        file.type.startsWith('image/')
      ) {
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        const chunk = 8192;
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        loaded.push({
          id: `local-${file.name}`,
          name: file.name,
          mimeType: file.type,
          base64Data: btoa(binary),
        });
      } else {
        setErrorMsg(`"${file.name}" must be a PDF, TXT, Markdown, or image file.`);
      }
    }
    setLocalFiles(loaded);
  };

  const handleSynthesizeFromInput = async () => {
    if (!pastedSyllabus.trim() && localFiles.length === 0) {
      setErrorMsg(
        'Paste your DECO syllabus/notes or upload at least one PDF/text file.',
      );
      return;
    }

    setErrorMsg(null);
    setStatusMsg('Generating custom 5-unit DECO notes and important topics...');
    setIsSynthesizing(true);

    try {
      const apiRes = await fetch('/api/deco/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folderName: 'Custom DECO Syllabus Upload',
          files: localFiles,
          syllabusText: pastedSyllabus,
          focusExamPattern: examPattern,
        }),
      });

      const data = (await apiRes.json()) as {
        units?: DecoUnit[];
        error?: string;
      };

      if (!apiRes.ok || !data.units) {
        throw new Error(data.error || 'Failed to synthesize notes.');
      }

      onUnitsSynthesized(data.units, 'Synthesized from your custom syllabus & files');
      setStatusMsg(
        'Updated all 5 units with separated notes and important exam topics.',
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to synthesize notes.';
      setErrorMsg(msg);
      setStatusMsg(null);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <section
      id="drive-sync"
      className="no-print border border-slate-200 bg-white rounded-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500">
            <span className="whitespace-nowrap">Google Drive Folder Sync</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono break-all">
              ID: {extractDriveFolderId(folderUrl) ?? 'Custom'}
            </span>
          </div>
          <h2 className="mt-1 font-display text-lg font-bold text-slate-900">
            Import &amp; Synthesize from Your DECO Study Folder
          </h2>
        </div>

        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={isExpanded}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isExpanded ? 'Hide Drive Panel' : 'Open Drive Sync'}
        </button>
      </div>

      {isExpanded && (
        <div className="border-t border-slate-200 px-5 py-5 sm:px-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Study material source"
              className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-full"
            >
              <button
                type="button"
                role="tab"
                aria-selected={sourceTab === 'drive'}
                onClick={() => setSourceTab('drive')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  sourceTab === 'drive'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Google Drive Folder
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={sourceTab === 'paste'}
                onClick={() => setSourceTab('paste')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  sourceTab === 'paste'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paste Syllabus / Upload Files
              </button>
            </div>

            {user && !needsAuth && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span>Signed in as {user.email || user.displayName}</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium underline underline-offset-4 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>

          {sourceTab === 'drive' ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                <div>
                  <label
                    htmlFor="drive-folder-url"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Google Drive Folder Link or ID
                  </label>
                  <input
                    id="drive-folder-url"
                    type="url"
                    value={folderUrl}
                    onChange={(e) => setFolderUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                  />
                </div>

                <div className="flex items-end gap-3">
                  {needsAuth ? (
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoggingIn}
                      className="gsi-material-button"
                    >
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            style={{ display: 'block' }}
                          >
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <path
                              fill="#34A853"
                              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">
                          {isLoggingIn
                            ? 'Signing in...'
                            : 'Sign in with Google'}
                        </span>
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleLoadFolder()}
                      disabled={isLoadingFiles}
                      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${isLoadingFiles ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                      />
                      <span>
                        {isLoadingFiles ? 'Loading Folder...' : 'Load Folder Files'}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {driveFiles.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">
                      Files in {folderName || 'Drive Folder'} ({selectedFileIds.size}{' '}
                      selected)
                    </p>
                    <button
                      type="button"
                      onClick={handleSynthesizeFromDrive}
                      disabled={isSynthesizing || selectedFileIds.size === 0}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      <span>
                        {isSynthesizing
                          ? 'Synthesizing 5 Units...'
                          : 'Generate 5-Unit Notes from Selected'}
                      </span>
                    </button>
                  </div>

                  <ul className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-slate-50/50 max-h-60 overflow-y-auto">
                    {driveFiles.map((file) => {
                      const isFolder =
                        file.mimeType === 'application/vnd.google-apps.folder';
                      const checked = selectedFileIds.has(file.id);
                      return (
                        <li
                          key={file.id}
                          className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm"
                        >
                          <label className="flex items-center gap-3 min-w-0 cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={isFolder}
                              checked={checked}
                              onChange={() => toggleFileSelection(file.id)}
                              className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                            />
                            {isFolder ? (
                              <FolderOpen
                                className="h-4 w-4 text-amber-600 shrink-0"
                                aria-hidden="true"
                              />
                            ) : (
                              <FileText
                                className="h-4 w-4 text-slate-500 shrink-0"
                                aria-hidden="true"
                              />
                            )}
                            <span className="truncate font-medium text-slate-800">
                              {file.name}
                            </span>
                          </label>
                          <span className="text-xs text-slate-500 font-mono shrink-0">
                            {file.mimeType.split('.').pop()}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="exam-pattern-input"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Exam Pattern / Question Paper Style
                </label>
                <input
                  id="exam-pattern-input"
                  type="text"
                  value={examPattern}
                  onChange={(e) => setExamPattern(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                />
              </div>

              <div>
                <label
                  htmlFor="pasted-syllabus"
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                >
                  Paste DECO Syllabus, Unit Topics, or Previous Year Questions
                </label>
                <textarea
                  id="pasted-syllabus"
                  rows={4}
                  value={pastedSyllabus}
                  onChange={(e) => setPastedSyllabus(e.target.value)}
                  placeholder="Paste your university DECO syllabus units or lecture notes here..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-2 focus:outline-sky-600/20"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {localFiles.length > 0
                      ? `${localFiles.length} local file(s) attached`
                      : 'Attach PDF / TXT / MD'}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md,image/*"
                    onChange={handleLocalFileUpload}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSynthesizeFromInput}
                  disabled={isSynthesizing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-700 rounded-lg hover:bg-sky-800 disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {isSynthesizing
                      ? 'Synthesizing 5 Units...'
                      : 'Generate 5-Unit Notes'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            >
              <AlertCircle
                className="h-4 w-4 text-red-700 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>{errorMsg}</span>
            </div>
          )}

          {statusMsg && !errorMsg && (
            <div
              role="status"
              className="flex items-start gap-2.5 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950"
            >
              <CheckCircle2
                className="h-4 w-4 text-sky-700 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
