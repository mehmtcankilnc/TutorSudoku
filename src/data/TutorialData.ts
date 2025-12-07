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
  `..8..79..
  .42..5...
  ...6...5.
  ..3..68.1
  ........6
  9...7....
  .8.13.47.
  ....9....
  .1.......`,
);
const s1_cands = generateCandidates(s1_board);

// 2. Hidden Single
const s2_board = parseBoard(
  `..9.32...
  ...7.....
  162......
  .1..2.56.
  ...9.....
  .5....1.7
  ......4.3
  .26..9...
  ..587....`,
);
let s2_cands = generateCandidates(s2_board);
let overrided_s2_cands = overrideCandidates(s2_cands, [
  { r: 6, c: 2, vals: [1] },
]);

// 3. Locked Candidates (Pointing)
const s3_board = parseBoard(
  `..9.7....
  .8.4.....
  ..3....28
  1.....67.
  .2..13.4.
  .4...78..
  6...3....
  .1.......
  ......284`,
);
let s3_cands = generateCandidates(s3_board);
let overrided_s3_cands = overrideCandidates(s3_cands, [
  { r: 7, c: 0, vals: [2, 3, 5, 7, 8, 9] },
]);

// 4. Naked Pair
const s4_board = parseBoard(
  `..2.85..4
  ....3..6.
  ..421..3.
  .......52
  ......31.
  9........
  8....6...
  25.4....8
  .....16..`,
);
let s4_cands = generateCandidates(s4_board);
let overrided_s4_cands = overrideCandidates(s4_cands, [
  { r: 0, c: 3, vals: [6] },
  { r: 1, c: 5, vals: [4] },
]);

// 5. Hidden Pair
let s5_cands = generateCandidates(s2_board);
let overrided_s5_cands = overrideCandidates(s5_cands, [
  { r: 4, c: 0, vals: [2, 6] },
  { r: 5, c: 0, vals: [2, 6] },
]);

// 6. Naked Triple
const s6_board = parseBoard(
  `37.....9.
  9...7....
  ...42...6
  ..1.842..
  .........
  8..6...5.
  ..6..2.1.
  .......39
  .5....4..`,
);
let s6_cands = generateCandidates(s6_board);
let overrided_s6_cands = overrideCandidates(s6_cands, [
  { r: 0, c: 2, vals: [2, 4] },
  { r: 1, c: 1, vals: [2, 4, 6] },
  { r: 1, c: 2, vals: [2, 4] },
]);

// 7. Hidden Triple
const s7_board = parseBoard(
  `..8..7...
  .42..5...
  .........
  ..3..68.1
  ........6
  9........
  .8.13.47.
  ....9....
  .1.......`,
);
let s7_cands = generateCandidates(s7_board);
let overrided_s7_cands = overrideCandidates(s7_cands, [
  { r: 7, c: 3, vals: [5, 6, 7] },
  { r: 8, c: 3, vals: [5, 6, 7] },
  { r: 8, c: 4, vals: [5, 6, 7] },
]);

// 8. X-Wing
const s8_board = parseBoard(
  `..38..51.
  ..87..93.
  1..3.5728
  ...2..849
  8.19.6257
  ...5..163
  964127385
  382659471
  .1.4..692`,
);
let s8_cands = generateCandidates(s8_board);
let overrided_s8_cands = overrideCandidates(s8_cands, [
  { r: 0, c: 1, vals: [2, 7, 9] },
  { r: 0, c: 4, vals: [6, 9] },
  { r: 1, c: 1, vals: [2, 5] },
  { r: 1, c: 4, vals: [1, 6] },
  { r: 5, c: 1, vals: [2, 7, 9] },
  { r: 5, c: 4, vals: [5, 8] },
]);

// 9. Y-Wing
const s9_board = parseBoard(
  `9..2..75.
  .5.69.231
  42.......
  .9.......
  ..2......
  .7...6...
  .69..1...
  51...3...
  2.7.8...9`,
);
let s9_cands = generateCandidates(s9_board);
let overrided_s9_cands = overrideCandidates(s9_cands, [
  { r: 8, c: 5, vals: [5] },
]);

// 10. Swordfish (5)
const s10_board = parseBoard(
  `9.87351..
  .1.98..3.
  ....2..98
  8.546931.
  .9..7....
  .4325.9..
  25..9...1
  .89512.63
  ..1847..9`,
);
let s10_cands = generateCandidates(s10_board);
const s10_op1_board = parseBoard(
  `9.87351.6
  .1.98..3.
  ....2..98
  8.546931.
  .9..7....
  64325.9..
  25..9...1
  .89512.63
  .61847..9`,
);
let s10_op1_cands = generateCandidates(s10_op1_board);
const s10_op2_board = parseBoard(
  `9687351..
  .1.98..3.
  ....2..98
  8.546931.
  .9..7....
  .4325.9.6
  25..9...1
  .89512.63
  6.1847..9`,
);
let s10_op2_cands = generateCandidates(s10_op2_board);
let overrided_s10_cands = overrideCandidates(s10_cands, [
  { r: 1, c: 0, vals: [4, 5, 7] },
  { r: 2, c: 0, vals: [3, 4, 5, 7] },
  { r: 4, c: 0, vals: [1] },
  { r: 2, c: 1, vals: [3, 7] },
  { r: 1, c: 8, vals: [2, 5, 7] },
  { r: 4, c: 8, vals: [2, 4, 5] },
]);

export const TUTORIAL_DATA: { [key: string]: TutorialScenario[] } = {
  '1': [
    {
      id: 'naked-single-1',
      title: 'tech_nakedSingle_title',
      steps: [
        {
          message: 'tut_naked-single-1_step_0',
          board: s1_board,
          candidates: s1_cands,
          highlightCells: [{ r: 6, c: 5 }],
        },
        {
          message: 'tut_naked-single-1_step_1',
          board: s1_board,
          candidates: s1_cands,
          highlightCells: [{ r: 6, c: 5 }],
          action: { type: 'fill', value: 2 },
        },
      ],
    },
  ],
  '2': [
    {
      id: 'hidden-single-1',
      title: 'tech_hiddenSingle_title',
      steps: [
        {
          message: 'tut_hidden-single-1_step_0',
          board: s2_board,
          candidates: s2_cands,
          highlightCells: [{ r: 6, c: 2 }],
        },
        {
          message: 'tut_hidden-single-1_step_1',
          board: s2_board,
          candidates: overrided_s2_cands,
          action: { type: 'fill', value: 1 },
        },
      ],
    },
  ],
  '3': [
    {
      id: 'locked-1',
      title: 'tech_lockedCandidates_title',
      steps: [
        {
          message: 'tut_locked-1_step_0',
          board: s3_board,
          candidates: s3_cands,
          highlightCells: [
            { r: 0, c: 0 },
            { r: 2, c: 0 },
          ],
        },
        {
          message: 'tut_locked-1_step_1',
          board: s3_board,
          candidates: overrided_s3_cands,
          highlightCells: [{ r: 7, c: 0 }],
          action: { type: 'eliminate', value: 1 },
        },
      ],
    },
  ],
  '4': [
    {
      id: 'naked-pair-1',
      title: 'tech_nakedPairs_title',
      steps: [
        {
          message: 'tut_naked-pair-1_step_0',
          board: s4_board,
          candidates: s4_cands,
          highlightCells: [
            { r: 1, c: 3 },
            { r: 2, c: 5 },
          ],
        },
        {
          message: 'tut_naked-pair-1_step_1',
          board: s4_board,
          candidates: overrided_s4_cands,
          highlightCells: [
            { r: 0, c: 3 },
            { r: 1, c: 5 },
          ],
          action: { type: 'eliminate', value: 1 },
        },
      ],
    },
  ],
  '5': [
    {
      id: 'hidden-pair-1',
      title: 'tech_hiddenPairs_title',
      steps: [
        {
          message: 'tut_hidden-pair-1_step_0',
          board: s2_board,
          candidates: s5_cands,
          highlightCells: [
            { r: 4, c: 0 },
            { r: 5, c: 0 },
          ],
        },
        {
          message: 'tut_hidden-pair-1_step_1',
          board: s2_board,
          candidates: overrided_s5_cands,
          highlightCells: [
            { r: 4, c: 0 },
            { r: 5, c: 0 },
          ],
          action: { type: 'eliminate', value: 1 },
        },
      ],
    },
  ],
  '6': [
    {
      id: 'naked-triple-1',
      title: 'tech_nakedTriples_title',
      steps: [
        {
          message: 'tut_naked-triple-1_step_0',
          board: s6_board,
          candidates: s6_cands,
          highlightCells: [
            { r: 2, c: 0 },
            { r: 2, c: 1 },
            { r: 2, c: 2 },
          ],
        },
        {
          message: 'tut_naked-triple-1_step_1',
          board: s6_board,
          candidates: overrided_s6_cands,
          highlightCells: [
            { r: 0, c: 2 },
            { r: 1, c: 1 },
            { r: 1, c: 2 },
          ],
          action: { type: 'eliminate', value: 1 },
        },
      ],
    },
  ],
  '7': [
    {
      id: 'hidden-triple-1',
      title: 'tech_hiddenTriples_title',
      steps: [
        {
          message: 'tut_hidden-triple-1_step_0',
          board: s7_board,
          candidates: s7_cands,
          highlightCells: [
            { r: 7, c: 3 },
            { r: 8, c: 3 },
            { r: 8, c: 4 },
          ],
        },
        {
          message: 'tut_hidden-triple-1_step_1',
          board: s7_board,
          candidates: overrided_s7_cands,
          highlightCells: [
            { r: 7, c: 3 },
            { r: 8, c: 3 },
            { r: 8, c: 4 },
          ],
          action: { type: 'eliminate', value: 4 },
        },
      ],
    },
  ],
  '8': [
    {
      id: 'x-wing-1',
      title: 'tech_xWing_title',
      steps: [
        {
          message: 'tut_x-wing-1_step_0',
          board: s8_board,
          candidates: s8_cands,
          highlightCells: [
            { r: 2, c: 1 },
            { r: 2, c: 4 },
            { r: 4, c: 1 },
            { r: 4, c: 4 },
          ],
        },
        {
          message: 'tut_x-wing-1_step_1',
          board: s8_board,
          candidates: overrided_s8_cands,
          highlightCells: [
            { r: 0, c: 1 },
            { r: 0, c: 4 },
            { r: 1, c: 1 },
            { r: 1, c: 4 },
            { r: 5, c: 1 },
            { r: 5, c: 4 },
          ],
          action: { type: 'eliminate', value: 7 },
        },
      ],
    },
  ],
  '9': [
    {
      id: 'y-wing-1',
      title: 'tech_yWing_title',
      steps: [
        {
          message: 'tut_y-wing-1_step_0',
          board: s9_board,
          candidates: s9_cands,
          highlightCells: [
            { r: 0, c: 1 },
            { r: 0, c: 5 },
            { r: 8, c: 1 },
          ],
        },
        {
          message: 'tut_y-wing-1_step_1',
          board: s9_board,
          candidates: s9_cands,
          highlightCells: [{ r: 8, c: 5 }],
          action: { type: 'eliminate', value: 3 },
        },
        {
          message: 'tut_y-wing-1_step_2',
          board: s9_board,
          candidates: overrided_s9_cands,
          highlightCells: [{ r: 8, c: 5 }],
          action: { type: 'eliminate', value: 3 },
        },
      ],
    },
  ],
  '10': [
    {
      id: 'swordfish-1',
      title: 'tech_swordfish_title',
      steps: [
        {
          message: 'tut_swordfish-1_step_0',
          board: s10_board,
          candidates: s10_cands,
          highlightCells: [
            { r: 0, c: 1 },
            { r: 0, c: 8 },
            { r: 5, c: 0 },
            { r: 5, c: 8 },
            { r: 8, c: 0 },
            { r: 8, c: 1 },
          ],
        },
        {
          message: 'tut_swordfish-1_step_1',
          board: s10_op1_board,
          candidates: s10_op1_cands,
          highlightCells: [
            { r: 0, c: 8 },
            { r: 5, c: 0 },
            { r: 8, c: 1 },
          ],
        },
        {
          message: 'tut_swordfish-1_step_2',
          board: s10_op2_board,
          candidates: s10_op2_cands,
          highlightCells: [
            { r: 0, c: 1 },
            { r: 5, c: 8 },
            { r: 8, c: 0 },
          ],
        },
        {
          message: 'tut_swordfish-1_step_3',
          board: s10_board,
          candidates: overrided_s10_cands,
          highlightCells: [
            { r: 1, c: 0 },
            { r: 2, c: 0 },
            { r: 4, c: 0 },
            { r: 2, c: 1 },
            { r: 1, c: 8 },
            { r: 4, c: 8 },
          ],
          action: { type: 'eliminate', value: 5 },
        },
      ],
    },
  ],
};
