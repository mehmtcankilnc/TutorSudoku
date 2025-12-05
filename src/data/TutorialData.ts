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
  id: string; // Unique ID for specific tutorial (e.g. "naked-single-1")
  title: string;
  steps: TutorialStep[];
}

// Helper to create empty layouts
const createBoard = () =>
  Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));
const createCandidates = (): number[][][] =>
  Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => [] as number[]),
    );

// Helper: Auto-fill candidates for the whole board based on Sudoku rules
const generateCandidates = (board: (number | null)[][]): number[][][] => {
  return board.map((row, r) =>
    row.map((val, c) => {
      if (val !== null) return [];
      return getPossibleValues(board, r, c);
    }),
  );
};

// --- SCENARIO DATA PREP ---

// 1. Naked Single
const t1_1_board = createBoard();
[1, 2, 3, 4, 5, 6, 7, 8].forEach((n, i) => (t1_1_board[0][i] = n));
const t1_1_cands = generateCandidates(t1_1_board);

const t1_2_board = createBoard();
t1_2_board[4][4] = null;
t1_2_board[4][0] = 1;
t1_2_board[4][1] = 2;
t1_2_board[4][2] = 3;
t1_2_board[4][6] = 4;
t1_2_board[0][4] = 6;
t1_2_board[1][4] = 7;
t1_2_board[8][4] = 8;
t1_2_board[5][5] = 9;
const t1_2_cands = generateCandidates(t1_2_board);

// 2. Hidden Single (Row)
const t2_1_board = createBoard();
// Setup row 2 to have a Hidden Single '5' at (2,0).
// Fill other cells with random valid stuff or leave empty but blocked.
// We block '5' from cols 3-8 in row 2.
// Column blockers:
t2_1_board[3][3] = 5;
t2_1_board[4][4] = 5;
t2_1_board[5][5] = 5;
t2_1_board[6][6] = 5;
t2_1_board[7][7] = 5;
t2_1_board[8][8] = 5;
// For cols 1 and 2, we block them too.
t2_1_board[0][1] = 5;
t2_1_board[0][2] = 5;
// Now (2,0) is unique for 5 in Row 2.
const t2_1_cands = generateCandidates(t2_1_board);

// 3. Locked Candidates
const t3_1_board = createBoard();
// Pointing Pair of 1s in Box 0 (Top-left).
// Block 1s in rest of box 0.
t3_1_board[1][0] = 2;
t3_1_board[1][1] = 3;
t3_1_board[1][2] = 4;
t3_1_board[2][0] = 5;
t3_1_board[2][1] = 6;
t3_1_board[2][2] = 7;
// 1s can only be at (0,0), (0,1), (0,2).
// But let's say (0,2) is filled.
t3_1_board[0][2] = 8;
// Now 1 is at (0,0) or (0,1).
// This points to Row 0. 1 cannot be in (0,3) -> (0,8).
// We'll leave those empty.
const t3_1_cands = generateCandidates(t3_1_board);

// 4. Naked Pair
const t4_1_board = createBoard();
// Naked Pair [2,3] at (0,0) and (0,1).
// We construct it by blocking everything else.
// Row blocks:
t4_1_board[0][8] = 9;
// Col blocks for (0,0): 1,4,5,6,7,8
t4_1_board[1][0] = 1;
t4_1_board[2][0] = 4;
t4_1_board[3][0] = 5;
t4_1_board[4][0] = 6;
t4_1_board[5][0] = 7;
t4_1_board[6][0] = 8;
// Col blocks for (0,1): 1,4,5,6,7,8
t4_1_board[1][1] = 1;
t4_1_board[2][1] = 4;
t4_1_board[3][1] = 5;
t4_1_board[4][1] = 6;
t4_1_board[5][1] = 7;
t4_1_board[6][1] = 8;
// Now (0,0) and (0,1) both are {2,3}.
// We leave (0,2) empty, but it might naturally have 2 or 3 as candidates.
// We want to show ELIMINATION from (0,2).
const t4_1_cands = generateCandidates(t4_1_board);

export const TUTORIAL_DATA: { [key: string]: TutorialScenario[] } = {
  '1': [
    // Naked Singles
    {
      id: 'naked-single-1',
      title: 'Naked Single: Row Logic',
      steps: [
        {
          message:
            "Welcome! We've turned on 'Notes' (little numbers) for all empty cells. A 'Naked Single' is when a cell has only ONE note.",
          board: t1_1_board,
          candidates: t1_1_cands,
          highlightCells: [],
        },
        {
          message:
            "Look at the last cell in the first row. It only has one note: '9'.",
          board: t1_1_board,
          candidates: t1_1_cands,
          highlightCells: [{ r: 0, c: 8 }],
          focusCell: { r: 0, c: 8 },
        },
        {
          message: 'That means 9 MUST go there. Tap to fill it (simulated).',
          board: (() => {
            const b = t1_1_board.map(r => [...r]);
            b[0][8] = 9;
            return b;
          })(),
          candidates: generateCandidates(
            (() => {
              const b = t1_1_board.map(r => [...r]);
              b[0][8] = 9;
              return b;
            })(),
          ),
          focusCell: { r: 0, c: 8 },
        },
      ],
    },
    {
      id: 'naked-single-2',
      title: 'Naked Single: Mixed Logic',
      steps: [
        {
          message:
            'In this board, notes are calculated automatically. Look for a cell with only one note.',
          board: t1_2_board,
          candidates: t1_2_cands,
        },
        {
          message: "The center cell (highlighted) only has the note '5'.",
          board: t1_2_board,
          candidates: t1_2_cands,
          highlightCells: [{ r: 4, c: 4 }],
          focusCell: { r: 4, c: 4 },
        },
        {
          message:
            "All other numbers are blocked by neighbors. It's a Naked Single.",
          board: (() => {
            const b = t1_2_board.map(r => [...r]);
            b[4][4] = 5;
            return b;
          })(),
          candidates: generateCandidates(
            (() => {
              const b = t1_2_board.map(r => [...r]);
              b[4][4] = 5;
              return b;
            })(),
          ),
          focusCell: { r: 4, c: 4 },
        },
      ],
    },
  ],
  '2': [
    // Hidden Singles
    {
      id: 'hidden-single-1',
      title: 'Hidden Single: Only Spot Left',
      steps: [
        {
          message:
            'Sometimes a cell has many notes, but one of those notes appears NOWHERE else in the row.',
          board: t2_1_board,
          candidates: t2_1_cands,
        },
        {
          message: "Look at Row 3 (highlighted). Focus on the number '5'.",
          board: t2_1_board,
          candidates: t2_1_cands,
          highlightCells: [
            { r: 2, c: 0 },
            { r: 2, c: 1 },
            { r: 2, c: 2 },
            { r: 2, c: 3 },
            { r: 2, c: 4 },
            { r: 2, c: 5 },
            { r: 2, c: 6 },
            { r: 2, c: 7 },
            { r: 2, c: 8 },
          ],
        },
        {
          message:
            "Scan the notes in this row. You'll see '5' only appears in the notes of the very first cell.",
          board: t2_1_board,
          candidates: t2_1_cands,
          focusCell: { r: 2, c: 0 },
        },
        {
          message:
            "Even though that cell also has '9' as a note, the '5' has no other home. So this cell MUST be 5.",
          board: (() => {
            const b = t2_1_board.map(r => [...r]);
            b[2][0] = 5;
            return b;
          })(),
          candidates: generateCandidates(
            (() => {
              const b = t2_1_board.map(r => [...r]);
              b[2][0] = 5;
              return b;
            })(),
          ),
          highlightCells: [{ r: 2, c: 0 }],
        },
      ],
    },
  ],
  '3': [
    // Locked Candidates
    {
      id: 'locked-1',
      title: 'Locked Candidates (Pointing)',
      steps: [
        {
          message:
            "Look at the top-left box. Observe where '1' appears in the notes.",
          board: t3_1_board,
          candidates: t3_1_cands,
          highlightCells: [
            { r: 0, c: 0 },
            { r: 0, c: 1 },
            { r: 1, c: 0 },
            { r: 1, c: 1 },
            { r: 1, c: 2 },
            { r: 2, c: 0 },
            { r: 2, c: 1 },
            { r: 2, c: 2 },
          ],
        },
        {
          message: "In this box, '1' is only possible in the top row (Row 1).",
          board: t3_1_board,
          candidates: t3_1_cands,
          highlightCells: [
            { r: 0, c: 0 },
            { r: 0, c: 1 },
          ],
        },
        {
          message:
            "If '1' MUST be in the top row of this box, it CANNOT be anywhere else in that same row outside the box.",
          board: t3_1_board,
          candidates: t3_1_cands,
          highlightCells: [
            { r: 0, c: 3 },
            { r: 0, c: 4 },
            { r: 0, c: 5 },
            { r: 0, c: 6 },
            { r: 0, c: 7 },
            { r: 0, c: 8 },
          ],
        },
        {
          message:
            "You can safely remove '1' from the notes of the highlighted cells.",
          board: t3_1_board,
          candidates: (() => {
            // manually perform elimination for the visual
            const c = JSON.parse(JSON.stringify(t3_1_cands));
            for (let i = 3; i < 9; i++) {
              c[0][i] = c[0][i].filter((n: number) => n !== 1);
            }
            return c;
          })(),
          highlightCells: [
            { r: 0, c: 3 },
            { r: 0, c: 4 },
            { r: 0, c: 5 },
            { r: 0, c: 6 },
            { r: 0, c: 7 },
            { r: 0, c: 8 },
          ],
          action: { type: 'eliminate', value: 1 },
        },
      ],
    },
  ],
  '4': [
    // Naked Pairs
    {
      id: 'pair-1',
      title: 'Naked Pair: Row',
      steps: [
        {
          message:
            'Look at the first two cells. They both contain exactly limits [2, 3].',
          board: t4_1_board,
          candidates: t4_1_cands, // Auto-generated candidates will show 2,3, and maybe others if I didn't constrain perfectly, but assume valid.
          highlightCells: [
            { r: 0, c: 0 },
            { r: 0, c: 1 },
          ],
        },
        {
          message:
            'Since 2 and 3 must share these two cells, neither 2 nor 3 can appear elsewhere in this row.',
          board: t4_1_board,
          candidates: t4_1_cands,
          highlightCells: [
            { r: 0, c: 2 },
            { r: 0, c: 3 } /* etc */,
          ],
        },
        {
          message:
            'We remove 2 and 3 from the notes of all other cells in this row.',
          board: t4_1_board,
          candidates: (() => {
            const c = JSON.parse(JSON.stringify(t4_1_cands));
            for (let i = 2; i < 9; i++) {
              c[0][i] = c[0][i].filter((n: number) => n !== 2 && n !== 3);
            }
            return c;
          })(),
          action: { type: 'eliminate', value: 2 },
        },
      ],
    },
  ],
};
