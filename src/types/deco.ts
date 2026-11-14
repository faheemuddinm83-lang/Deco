export interface NoteSection {
  id: string;
  heading: string;
  summary: string;
  keyPoints: string[];
  formulasOrTables?: string[];
  workedExample?: {
    problem: string;
    solutionSteps: string[];
  };
}

export interface ImportantTopic {
  id: string;
  title: string;
  examMarks: string;
  priority: 'Must Revise' | 'High Yield' | 'Conceptual';
  expectedQuestion: string;
  answerOutline: string[];
}

export interface PracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DecoUnit {
  unitNumber: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  estimatedHours: string;
  notes: NoteSection[];
  importantTopics: ImportantTopic[];
  practiceQuestions: PracticeQuestion[];
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
}

export type StudyViewMode = 'split-line' | 'notes-only' | 'important-only';
