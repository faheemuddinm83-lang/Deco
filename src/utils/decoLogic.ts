import type { DecoUnit } from '../types/deco';

export const DEFAULT_DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/1rxJWLRAwaXvAfBOgxR_HSkp6vcUTN5O6?usp=drive_link';

export const LINE_DIVIDER =
  '------------------------------------------------------------------------';

export function extractDriveFolderId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
  if (folderMatch?.[1]) {
    return folderMatch[1];
  }

  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (idParamMatch?.[1]) {
    return idParamMatch[1];
  }

  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed) && !trimmed.includes('http')) {
    return trimmed;
  }

  return null;
}

export function formatUnitsWithLineSeparators(
  units: DecoUnit[],
  mode: 'full' | 'important-only' = 'full',
): string {
  const blocks: string[] = [];

  for (const unit of units) {
    const lines: string[] = [];
    lines.push(`UNIT ${unit.unitNumber}: ${unit.title.toUpperCase()}`);
    lines.push(`${unit.subtitle} | Study Target: ${unit.estimatedHours}`);
    lines.push(LINE_DIVIDER);

    if (mode === 'full') {
      lines.push(`PART A — UNIT ${unit.unitNumber} NOTES`);
      lines.push('');
      for (const section of unit.notes) {
        lines.push(`• ${section.heading}`);
        lines.push(`  ${section.summary}`);
        for (const pt of section.keyPoints) {
          lines.push(`  - ${pt}`);
        }
        if (section.formulasOrTables && section.formulasOrTables.length > 0) {
          lines.push(`  Key Formulas / Syntax:`);
          for (const f of section.formulasOrTables) {
            lines.push(`    * ${f}`);
          }
        }
        if (section.workedExample) {
          lines.push(`  Solved Example: ${section.workedExample.problem}`);
          section.workedExample.solutionSteps.forEach((step, idx) => {
            lines.push(`    ${idx + 1}. ${step}`);
          });
        }
        lines.push('');
      }
      lines.push(LINE_DIVIDER);
    }

    lines.push(`PART B — UNIT ${unit.unitNumber} IMPORTANT EXAM TOPICS`);
    lines.push('');
    unit.importantTopics.forEach((topic, idx) => {
      lines.push(
        `${idx + 1}. ${topic.title} [${topic.priority} · ${topic.examMarks}]`,
      );
      lines.push(`   Likely Exam Question: ${topic.expectedQuestion}`);
      for (const outline of topic.answerOutline) {
        lines.push(`   - ${outline}`);
      }
      lines.push('');
    });

    lines.push(LINE_DIVIDER);
    blocks.push(lines.join('\n'));
  }

  return blocks.join('\n');
}

export interface TwoComplementResult {
  valid: boolean;
  overflow: boolean;
  decimal: number;
  binary8: string;
  onesComplement: string;
  twosComplement: string;
  hex: string;
}

export function computeTwoComplement8Bit(decimal: number): TwoComplementResult {
  if (!Number.isInteger(decimal) || Number.isNaN(decimal)) {
    return {
      valid: false,
      overflow: false,
      decimal: 0,
      binary8: '00000000',
      onesComplement: '11111111',
      twosComplement: '00000000',
      hex: '0x00',
    };
  }

  const overflow = decimal < -128 || decimal > 127;
  const masked = ((decimal % 256) + 256) % 256;
  const twosComplement = masked.toString(2).padStart(8, '0');
  const absVal = Math.min(127, Math.abs(decimal));
  const binary8 = absVal.toString(2).padStart(8, '0');
  const onesComplement = twosComplement
    .split('')
    .map((b) => (b === '0' ? '1' : '0'))
    .join('');
  const hex = `0x${masked.toString(16).toUpperCase().padStart(2, '0')}`;

  return {
    valid: true,
    overflow,
    decimal,
    binary8,
    onesComplement,
    twosComplement,
    hex,
  };
}

export interface FullAdderResult {
  sum: 0 | 1;
  cout: 0 | 1;
  andOut: 0 | 1;
  orOut: 0 | 1;
  xorOut: 0 | 1;
  nandOut: 0 | 1;
  norOut: 0 | 1;
}

export function computeFullAdder(
  a: 0 | 1,
  b: 0 | 1,
  cin: 0 | 1,
): FullAdderResult {
  const xorOut = (a ^ b) as 0 | 1;
  const sum = (xorOut ^ cin) as 0 | 1;
  const cout = ((a & b) | (cin & xorOut)) as 0 | 1;
  const andOut = (a & b) as 0 | 1;
  const orOut = (a | b) as 0 | 1;
  const nandOut = (andOut ? 0 : 1) as 0 | 1;
  const norOut = (orOut ? 0 : 1) as 0 | 1;

  return {
    sum,
    cout,
    andOut,
    orOut,
    xorOut,
    nandOut,
    norOut,
  };
}

export interface CacheBitSplitResult {
  valid: boolean;
  error?: string;
  addressBits: number;
  offsetBits: number;
  indexBits: number;
  tagBits: number;
  totalLines: number;
  totalSets: number;
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0;
}

export function calculateCacheAddressBits(
  memoryKB: number,
  cacheKB: number,
  blockBytes: number,
  associativity: number,
): CacheBitSplitResult {
  if (
    memoryKB <= 0 ||
    cacheKB <= 0 ||
    blockBytes <= 0 ||
    associativity <= 0 ||
    !isPowerOfTwo(memoryKB) ||
    !isPowerOfTwo(cacheKB) ||
    !isPowerOfTwo(blockBytes) ||
    !isPowerOfTwo(associativity)
  ) {
    return {
      valid: false,
      error: 'All sizes and associativity must be positive powers of 2.',
      addressBits: 0,
      offsetBits: 0,
      indexBits: 0,
      tagBits: 0,
      totalLines: 0,
      totalSets: 0,
    };
  }

  const memoryBytes = memoryKB * 1024;
  const cacheBytes = cacheKB * 1024;

  if (cacheBytes >= memoryBytes) {
    return {
      valid: false,
      error: 'Cache size must be smaller than main memory size.',
      addressBits: 0,
      offsetBits: 0,
      indexBits: 0,
      tagBits: 0,
      totalLines: 0,
      totalSets: 0,
    };
  }

  const totalLines = cacheBytes / blockBytes;
  if (associativity > totalLines) {
    return {
      valid: false,
      error: 'Associativity cannot exceed total cache lines.',
      addressBits: 0,
      offsetBits: 0,
      indexBits: 0,
      tagBits: 0,
      totalLines: 0,
      totalSets: 0,
    };
  }

  const totalSets = totalLines / associativity;
  const addressBits = Math.log2(memoryBytes);
  const offsetBits = Math.log2(blockBytes);
  const indexBits = Math.log2(totalSets);
  const tagBits = addressBits - indexBits - offsetBits;

  return {
    valid: true,
    addressBits,
    offsetBits,
    indexBits,
    tagBits,
    totalLines,
    totalSets,
  };
}

export interface MasteryStats {
  totalTopics: number;
  completedTopics: number;
  percent: number;
  byUnit: Record<number, { total: number; completed: number; percent: number }>;
}

export function calculateMasteryProgress(
  units: DecoUnit[],
  completedIds: Set<string>,
): MasteryStats {
  let totalTopics = 0;
  let completedTopics = 0;
  const byUnit: Record<
    number,
    { total: number; completed: number; percent: number }
  > = {};

  for (const unit of units) {
    const total = unit.importantTopics.length;
    const completed = unit.importantTopics.filter((t) =>
      completedIds.has(t.id),
    ).length;
    totalTopics += total;
    completedTopics += completed;
    byUnit[unit.unitNumber] = {
      total,
      completed,
      percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }

  return {
    totalTopics,
    completedTopics,
    percent:
      totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100),
    byUnit,
  };
}
