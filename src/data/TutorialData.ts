import { getPossibleValues } from '../utils/SudokuLogic';

export interface TutorialStep {
  message: string;
  board: (number | null)[][];
  candidates?: number[][][]; // 9x9 grid of number arrays
  highlightCells?: { r: number; c: number }[];
  focusCell?: { r: number; c: number };
  action?: { type: 'fill' | 'eliminate'; value: number };
}

export interface TutorialScenario {
  id: string;
  title: string;
  steps: TutorialStep[];
}

// --- Helpers ---

const parseBoard = (str: string): (number | null)[][] => {
  const board: (number | null)[][] = [];
  const rows = str
    .trim()
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // If input is just one long string 81 chars
  if (rows.length === 1 && str.replace(/\s/g, '').length === 81) {
    const cleanStr = str.replace(/\s/g, '');
    for (let r = 0; r < 9; r++) {
      const row: (number | null)[] = [];
      for (let c = 0; c < 9; c++) {
        const char = cleanStr[r * 9 + c];
        row.push(char === '.' || char === '0' ? null : parseInt(char, 10));
      }
      board.push(row);
    }
  } else {
    // Input is 9 rows
    rows.forEach(rowStr => {
      const row: (number | null)[] = [];
      for (let char of rowStr) {
        if (char === '.' || char === '0') row.push(null);
        else if (/[1-9]/.test(char)) row.push(parseInt(char, 10));
      }
      if (row.length === 9) board.push(row);
    });
  }
  return board;
};

const generateCandidates = (board: (number | null)[][]): number[][][] => {
  return board.map((row, r) =>
    row.map((val, c) => {
      if (val !== null) return [];
      return getPossibleValues(board, r, c);
    }),
  );
};

const overrideCandidates = (
  baseCandidates: number[][][],
  overrides: { r: number; c: number; vals: number[] }[],
): number[][][] => {
  const newCands = JSON.parse(JSON.stringify(baseCandidates));
  overrides.forEach(({ r, c, vals }) => {
    newCands[r][c] = vals;
  });
  return newCands;
};

// --- Scenarios ---

// 1. Naked Single
const s1_board = parseBoard(
  `435269781
682571493
197834562
826195347
374682915
951743628
519326874
248957136
76341825.`,
);
const s1_cands = generateCandidates(s1_board);

// 2. Hidden Single
const s2_board = parseBoard(
  `.23456789
4.......1
5.......2
6.......3
......... 
7.......4
8.......5
9.......6
1.......7`,
);
let s2_cands = generateCandidates(s2_board);
// Force the visual for hidden single in (0,0) as '1'
s2_cands = overrideCandidates(s2_cands, [
  { r: 0, c: 0, vals: [1] },
  // Actually standard generation handles this simple case well:
  // If neighbors are 2-9, then 1 is unique.
]);

// 3. Locked Candidates (Pointing)
// Box 0: top row empty, rest blocked.
const s3_board = parseBoard(
  `000100000
000100000
000100000
222000000
333000000
444000000
555000000
666000000
777000000`,
);
// This is too abstract. Let's constructs specific pointing case.
// 1s in Box 0 restricted to Row 0.
// means Row 0 outside box 0 (0,3+) cannot have 1.
let s3_cands = generateCandidates(s3_board);
// Manually set sensible candidates to show "1" is locked in (0,0) and (0,1)
// And show "1" exists in (0,4) for example, which should be eliminated.
s3_cands = overrideCandidates(s3_cands, [
  { r: 0, c: 0, vals: [1, 9] },
  { r: 0, c: 1, vals: [1, 8] },
  { r: 0, c: 2, vals: [9, 8] }, // No 1 here, maybe filled or blocked
  { r: 0, c: 4, vals: [1, 5] }, // Target to eliminate
]);

// 4. Naked Pair
const s4_board = parseBoard(
  `000456789
000000000
000000000
000000000
000000000
000000000
000000000
000000000
000000000`,
);
let s4_cands = generateCandidates(s4_board);
s4_cands = overrideCandidates(s4_cands, [
  { r: 0, c: 0, vals: [1, 2] },
  { r: 0, c: 1, vals: [1, 2] },
  { r: 0, c: 2, vals: [1, 2, 3] }, // Elim target
  { r: 0, c: 3, vals: [3, 4, 5] },
]);

// 5. Hidden Pair
// Base board for 5-10
const base_board = parseBoard(`000000000\n`.repeat(9));
let s5_cands = generateCandidates(base_board);
// Row 0: {8,9} hidden in (0,0) and (0,1)
s5_cands[0][0] = [1, 2, 8, 9];
s5_cands[0][1] = [3, 4, 8, 9];
s5_cands[0][2] = [1, 2, 3, 4];
s5_cands[0][3] = [1, 2];
s5_cands[0][4] = [3, 4];
s5_cands[0][5] = [1, 5];
s5_cands[0][6] = [2, 6];
s5_cands[0][7] = [3, 7];
s5_cands[0][8] = [4, 5];

// 6. Naked Triple
let s6_cands = generateCandidates(base_board);
s6_cands[0][0] = [1, 2];
s6_cands[0][1] = [2, 3];
s6_cands[0][2] = [1, 3];
// These 3 cells hold {1,2,3}.
s6_cands[0][3] = [1, 2, 3, 4]; // Target: eliminate 1,2,3 -> 4
s6_cands[0][4] = [4, 5];

// 7. Hidden Triple
let s7_cands = generateCandidates(base_board);
// 1,2,3 only in col 0,1,2 of Row 0.
s7_cands[0][0] = [1, 2, 4, 5];
s7_cands[0][1] = [2, 3, 4, 5];
s7_cands[0][2] = [1, 3, 6, 7];
// Ensure 1,2,3 NOT elsewhere
for (let i = 3; i < 9; i++) s7_cands[0][i] = [4, 5, 6, 7, 8, 9];

// 8. X-Wing
// Rows 1 and 4. Candidate '7'. Cols 2 and 6.
let s8_cands = generateCandidates(base_board);
// Setup Corners
s8_cands[1][2] = [1, 7];
s8_cands[1][6] = [2, 7];
s8_cands[4][2] = [1, 7];
s8_cands[4][6] = [2, 7];
// Clear '7' from rest of these rows
for (let c = 0; c < 9; c++) {
  if (c !== 2 && c !== 6) {
    s8_cands[1][c] = [1, 2];
    s8_cands[4][c] = [3, 4];
  }
}
// Target: Col 2, Row 0 contains '7', should be removed.
s8_cands[0][2] = [3, 7, 8];

// 9. Y-Wing
let s9_cands = generateCandidates(base_board);
s9_cands[0][0] = [1, 2]; // Pivot
s9_cands[0][5] = [1, 3]; // Pincer A
s9_cands[2][0] = [2, 3]; // Pincer B
s9_cands[2][5] = [3, 4, 5]; // Target (sees both)

// 10. Swordfish (5)
let s10_cands = generateCandidates(base_board);
const rows = [1, 4, 7];
const cols = [2, 5, 8];
// Place valid 5s
rows.forEach(r => cols.forEach(c => (s10_cands[r][c] = [1, 5])));
// Clear 5s from rest of rows
rows.forEach(r => {
  for (let c = 0; c < 9; c++) if (!cols.includes(c)) s10_cands[r][c] = [1, 2];
});
// Target: Row 0, Col 2 has 5
s10_cands[0][2] = [1, 5, 9];

export const TUTORIAL_DATA: { [key: string]: TutorialScenario[] } = {
  '1': [
    {
      id: 'naked-single-1',
      title: 'Naked Single',
      steps: [
        {
          message:
            'In this almost complete board, the last cell in the grid (bottom-right) is empty.',
          board: s1_board,
          candidates: s1_cands,
          highlightCells: [{ r: 8, c: 8 }],
        },
        {
          message:
            "The only missing number is 9. It's a Naked Single. Double-tap to fill.",
          board: s1_board,
          candidates: s1_cands,
          action: { type: 'fill', value: 9 },
        },
      ],
    },
  ],
  '2': [
    {
      id: 'hidden-single-1',
      title: 'Hidden Single',
      steps: [
        {
          message: 'In this row, numbers 2-9 are already placed or blocked.',
          board: s2_board,
          candidates: s2_cands,
          highlightCells: [{ r: 0, c: 0 }],
        },
        {
          message:
            "The first cell is the ONLY spot for '1'. It's a Hidden Single.",
          board: s2_board,
          candidates: s2_cands,
          action: { type: 'fill', value: 1 },
        },
      ],
    },
  ],
  '3': [
    {
      id: 'locked-1',
      title: 'Locked Candidates',
      steps: [
        {
          message:
            "Look at the top-left box. '1' is restricted to the top row.",
          board: s3_board,
          candidates: s3_cands,
          highlightCells: [
            { r: 0, c: 0 },
            { r: 0, c: 1 },
          ],
        },
        {
          message:
            "It cannot appear elsewhere in Row 0. We can eliminate '1' from cell (0,4).",
          board: s3_board,
          candidates: s3_cands,
          highlightCells: [{ r: 0, c: 4 }],
          action: { type: 'eliminate', value: 1 },
        },
      ],
    },
  ],
  '4': [
    {
      id: 'naked-pair-1',
      title: 'Naked Pair',
      steps: [
        {
          message:
            'Check the first two cells. They both contain exactly {1, 2}.',
          board: s4_board,
          candidates: s4_cands,
          highlightCells: [
            { r: 0, c: 0 },
            { r: 0, c: 1 },
          ],
        },
        {
          message: 'This locks 1 and 2 here. Remove them from the third cell.',
          board: s4_board,
          candidates: s4_cands,
          highlightCells: [{ r: 0, c: 2 }],
          action: { type: 'eliminate', value: 1 },
        },
      ],
    },
  ],
  '5': [
    {
      id: 'hidden-pair-1',
      title: 'Hidden Pair',
      steps: [
        {
          message:
            'In Row 0, the numbers 8 and 9 ONLY appear in the first two highlighted cells.',
          board: base_board,
          candidates: s5_cands,
          highlightCells: [
            { r: 0, c: 0 },
            { r: 0, c: 1 },
          ],
        },
        {
          message:
            'Since 8 and 9 must go here, eliminate all other notes (like 1,2,3,4) from these cells.',
          board: base_board,
          candidates: s5_cands,
          action: { type: 'eliminate', value: 1 },
        },
      ],
    },
  ],
  '6': [
    {
      id: 'naked-triple-1',
      title: 'Naked Triple',
      steps: [
        {
          message: 'First three cells have candidates {1,2}, {2,3}, {1,3}.',
          board: base_board,
          candidates: s6_cands,
          highlightCells: [
            { r: 0, c: 0 },
            { r: 0, c: 1 },
            { r: 0, c: 2 },
          ],
        },
        {
          message:
            'These 3 cells are reserved for 1, 2, 3. Remove 1,2,3 from the fourth cell.',
          board: base_board,
          candidates: s6_cands,
          highlightCells: [{ r: 0, c: 3 }],
          action: { type: 'eliminate', value: 1 },
        },
      ],
    },
  ],
  '7': [
    {
      id: 'hidden-triple-1',
      title: 'Hidden Triple',
      steps: [
        {
          message:
            'Candidates 1, 2, 3 appear ONLY in the first three cells of Row 0.',
          board: base_board,
          candidates: s7_cands,
          highlightCells: [
            { r: 0, c: 0 },
            { r: 0, c: 1 },
            { r: 0, c: 2 },
          ],
        },
        {
          message:
            'They are hidden among other noise. We must remove non-(1,2,3) notes from these cells.',
          board: base_board,
          candidates: s7_cands,
          action: { type: 'eliminate', value: 4 },
        },
      ],
    },
  ],
  '8': [
    {
      id: 'x-wing-1',
      title: 'X-Wing',
      steps: [
        {
          message:
            "Observe Rows 2 and 5. The number '7' appears ONLY in columns 3 and 7.",
          board: base_board,
          candidates: s8_cands,
          highlightCells: [
            { r: 1, c: 2 },
            { r: 1, c: 6 },
            { r: 4, c: 2 },
            { r: 4, c: 6 },
          ],
        },
        {
          message:
            "This X-pattern locks '7' into these columns. Eliminate '7' from Col 3 in Row 1.",
          board: base_board,
          candidates: s8_cands,
          highlightCells: [{ r: 0, c: 2 }],
          action: { type: 'eliminate', value: 7 },
        },
      ],
    },
  ],
  '9': [
    {
      id: 'y-wing-1',
      title: 'Y-Wing',
      steps: [
        {
          message:
            'Pivot (0,0) is {1,2}. Pincers are (0,5):{1,3} and (2,0):{2,3}.',
          board: base_board,
          candidates: s9_cands,
          highlightCells: [
            { r: 0, c: 0 },
            { r: 0, c: 5 },
            { r: 2, c: 0 },
          ],
        },
        {
          message:
            "Cell (2,5) sees both Pincers. It cannot be '3' (the common Z value).",
          board: base_board,
          candidates: s9_cands,
          highlightCells: [{ r: 2, c: 5 }],
          action: { type: 'eliminate', value: 3 },
        },
      ],
    },
  ],
  '10': [
    {
      id: 'swordfish-1',
      title: 'Swordfish',
      steps: [
        {
          message: "Candidate '5' in Rows 2, 5, 8 aligns in Cols 3, 6, 9.",
          board: base_board,
          candidates: s10_cands,
          highlightCells: [
            { r: 1, c: 2 },
            { r: 1, c: 5 },
            { r: 1, c: 8 },
            { r: 4, c: 2 },
            { r: 4, c: 5 },
            { r: 4, c: 8 },
            { r: 7, c: 2 },
            { r: 7, c: 5 },
            { r: 7, c: 8 },
          ],
        },
        {
          message: "Eliminate '5' from these columns in Row 1.",
          board: base_board,
          candidates: s10_cands,
          highlightCells: [{ r: 0, c: 2 }],
          action: { type: 'eliminate', value: 5 },
        },
      ],
    },
  ],
};
