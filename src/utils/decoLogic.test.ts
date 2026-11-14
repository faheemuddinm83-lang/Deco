import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DRIVE_FOLDER_URL,
  LINE_DIVIDER,
  calculateCacheAddressBits,
  calculateMasteryProgress,
  computeFullAdder,
  computeTwoComplement8Bit,
  extractDriveFolderId,
  formatUnitsWithLineSeparators,
} from './decoLogic';
import type { DecoUnit } from '../types/deco';

test('extractDriveFolderId parses standard folder URLs and raw IDs', () => {
  assert.equal(
    extractDriveFolderId(DEFAULT_DRIVE_FOLDER_URL),
    '1rxJWLRAwaXvAfBOgxR_HSkp6vcUTN5O6',
  );
  assert.equal(
    extractDriveFolderId(
      'https://drive.google.com/drive/u/1/folders/abcDEF_1234567890',
    ),
    'abcDEF_1234567890',
  );
  assert.equal(
    extractDriveFolderId('https://drive.google.com/open?id=xyz9876543210'),
    'xyz9876543210',
  );
  assert.equal(
    extractDriveFolderId('1rxJWLRAwaXvAfBOgxR_HSkp6vcUTN5O6'),
    '1rxJWLRAwaXvAfBOgxR_HSkp6vcUTN5O6',
  );
  assert.equal(extractDriveFolderId('https://example.com/nope'), null);
  assert.equal(extractDriveFolderId('   '), null);
});

test('computeTwoComplement8Bit calculates signed 8-bit values and overflow', () => {
  const pos = computeTwoComplement8Bit(25);
  assert.equal(pos.valid, true);
  assert.equal(pos.overflow, false);
  assert.equal(pos.twosComplement, '00011001');
  assert.equal(pos.hex, '0x19');

  const neg = computeTwoComplement8Bit(-5);
  assert.equal(neg.valid, true);
  assert.equal(neg.overflow, false);
  assert.equal(neg.twosComplement, '11111011');
  assert.equal(neg.hex, '0xFB');

  const over = computeTwoComplement8Bit(200);
  assert.equal(over.overflow, true);
});

test('computeFullAdder evaluates sum, carry, and basic gates', () => {
  assert.deepEqual(computeFullAdder(1, 1, 1), {
    sum: 1,
    cout: 1,
    andOut: 1,
    orOut: 1,
    xorOut: 0,
    nandOut: 0,
    norOut: 0,
  });
  assert.deepEqual(computeFullAdder(1, 0, 0), {
    sum: 1,
    cout: 0,
    andOut: 0,
    orOut: 1,
    xorOut: 1,
    nandOut: 1,
    norOut: 0,
  });
});

test('calculateCacheAddressBits splits Tag, Index, and Block Offset accurately', () => {
  // 1024 KB = 1 MB (20-bit address), 16 KB cache, 64 B block, 4-way set associative
  // Offset = log2(64) = 6 bits; Lines = 16384/64 = 256; Sets = 256/4 = 64 -> Index = 6 bits; Tag = 20 - 6 - 6 = 8 bits
  const res = calculateCacheAddressBits(1024, 16, 64, 4);
  assert.equal(res.valid, true);
  assert.equal(res.addressBits, 20);
  assert.equal(res.offsetBits, 6);
  assert.equal(res.indexBits, 6);
  assert.equal(res.tagBits, 8);
  assert.equal(res.totalLines, 256);
  assert.equal(res.totalSets, 64);

  const invalid = calculateCacheAddressBits(1000, 16, 64, 4);
  assert.equal(invalid.valid, false);
});

test('formatUnitsWithLineSeparators separates Notes and Important Topics with explicit lines', () => {
  const sampleUnits: DecoUnit[] = [
    {
      unitNumber: 1,
      title: 'Number Systems',
      subtitle: 'Base conversions & Boolean laws',
      estimatedHours: '4 hrs',
      notes: [
        {
          id: 'u1-n1',
          heading: '2s Complement',
          summary: 'Signed arithmetic representation.',
          keyPoints: ['Invert bits and add 1'],
        },
      ],
      importantTopics: [
        {
          id: 'u1-t1',
          title: 'K-Map Minimization',
          examMarks: '10 Marks',
          priority: 'Must Revise',
          expectedQuestion: 'Minimize F(A,B,C,D)',
          answerOutline: ['Group octets, quads, pairs'],
        },
      ],
      practiceQuestions: [],
    },
  ];

  const fullText = formatUnitsWithLineSeparators(sampleUnits, 'full');
  assert.ok(fullText.includes('PART A — UNIT 1 NOTES'));
  assert.ok(fullText.includes('PART B — UNIT 1 IMPORTANT EXAM TOPICS'));
  assert.ok(fullText.includes(LINE_DIVIDER));

  const importantText = formatUnitsWithLineSeparators(
    sampleUnits,
    'important-only',
  );
  assert.equal(importantText.includes('PART A — UNIT 1 NOTES'), false);
  assert.ok(importantText.includes('K-Map Minimization'));
});

test('calculateMasteryProgress computes unit and total percentages', () => {
  const units: DecoUnit[] = [
    {
      unitNumber: 1,
      title: 'U1',
      subtitle: '',
      estimatedHours: '2h',
      notes: [],
      importantTopics: [
        {
          id: 'a',
          title: 'A',
          examMarks: '5M',
          priority: 'Must Revise',
          expectedQuestion: 'Q',
          answerOutline: [],
        },
        {
          id: 'b',
          title: 'B',
          examMarks: '5M',
          priority: 'High Yield',
          expectedQuestion: 'Q',
          answerOutline: [],
        },
      ],
      practiceQuestions: [],
    },
  ];

  const stats = calculateMasteryProgress(units, new Set(['a']));
  assert.equal(stats.completedTopics, 1);
  assert.equal(stats.totalTopics, 2);
  assert.equal(stats.percent, 50);
  assert.equal(stats.byUnit[1].percent, 50);
});
