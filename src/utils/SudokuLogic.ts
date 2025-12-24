export type BoardType = (number | null)[][];

export interface Conflict {
  key: string;
  params: { [key: string]: string | number };
  conflictingCell: { row: number; col: number };
}

export const checkConflict = (
  board: BoardType,
  row: number,
  col: number,
  value: number,
): Conflict | null => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === value && i !== col) {
      return {
        key: 'conflict_row',
        params: { val: value, row: row + 1 },
        conflictingCell: { row, col: i },
      };
    }
  }
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === value && i !== row) {
      return {
        key: 'conflict_col',
        params: { val: value, col: col + 1 },
        conflictingCell: { row: i, col },
      };
    }
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const currentRow = boxRow + i;
      const currentCol = boxCol + j;
      if (
        board[currentRow][currentCol] === value &&
        (currentRow !== row || currentCol !== col)
      ) {
        return {
          key: 'conflict_box',
          params: { val: value },
          conflictingCell: { row: currentRow, col: currentCol },
        };
      }
    }
  }
  return null;
};

export const isValidMove = (
  board: BoardType,
  row: number,
  col: number,
  value: number,
): boolean => {
  return checkConflict(board, row, col, value) === null;
};

export const solve = (board: BoardType): boolean => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(
          () => Math.random() - 0.5,
        );
        for (const num of nums) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

export const generateSudoku = (
  difficulty: 'easy' | 'medium' | 'hard' = 'easy',
): { puzzle: BoardType; solution: BoardType } => {
  const board: BoardType = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));
  solve(board);
  const solution = board.map(row => [...row]);

  const attempts =
    difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;

  const newBoard = board.map(row => [...row]);
  for (let i = 0; i < attempts; i++) {
    let row = Math.floor(Math.random() * 9);
    let col = Math.floor(Math.random() * 9);
    while (newBoard[row][col] === null) {
      row = Math.floor(Math.random() * 9);
      col = Math.floor(Math.random() * 9);
    }
    newBoard[row][col] = null;
  }
  return { puzzle: newBoard, solution };
};

export const getPossibleValues = (
  board: BoardType,
  row: number,
  col: number,
): number[] => {
  const possibles: number[] = [];
  for (let num = 1; num <= 9; num++) {
    if (isValidMove(board, row, col, num)) {
      possibles.push(num);
    }
  }
  return possibles;
};

export interface Hint {
  key: string;
  params?: { [key: string]: string | number };
  cell?: { row: number; col: number };
  relatedCells?: { row: number; col: number }[];
}

const getCandidatesMap = (board: BoardType): number[][][] => {
  const map: number[][][] = [];
  for (let r = 0; r < 9; r++) {
    const row: number[][] = [];
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== null) row.push([]);
      else row.push(getPossibleValues(board, r, c));
    }
    map.push(row);
  }
  return map;
};

const checkLockedCandidates = (
  board: BoardType,
  candidates: number[][][],
): Hint | null => {
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      for (let num = 1; num <= 9; num++) {
        const positions: { r: number; c: number }[] = [];
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const r = br * 3 + i;
            const c = bc * 3 + j;
            if (board[r][c] === null && candidates[r][c].includes(num)) {
              positions.push({ r, c });
            }
          }
        }

        if (positions.length > 1 && positions.length <= 3) {
          const firstRow = positions[0].r;
          if (positions.every(p => p.r === firstRow)) {
            let existsOutside = false;
            for (let c = 0; c < 9; c++) {
              if (
                Math.floor(c / 3) !== bc &&
                board[firstRow][c] === null &&
                candidates[firstRow][c].includes(num)
              ) {
                existsOutside = true;
                break;
              }
            }
            if (existsOutside) {
              if (existsOutside) {
                return {
                  key: 'hint_lockedCandidatePointingRow',
                  params: {
                    box: br * 3 + bc + 1,
                    val: num,
                    row: firstRow + 1,
                  },
                  cell: { row: positions[0].r, col: positions[0].c },
                };
              }
            }
          }

          const firstCol = positions[0].c;
          if (positions.every(p => p.c === firstCol)) {
            let existsOutside = false;
            for (let r = 0; r < 9; r++) {
              if (
                Math.floor(r / 3) !== br &&
                board[r][firstCol] === null &&
                candidates[r][firstCol].includes(num)
              ) {
                existsOutside = true;
                break;
              }
            }
            if (existsOutside) {
              if (existsOutside) {
                return {
                  key: 'hint_lockedCandidatePointingCol',
                  params: {
                    box: br * 3 + bc + 1,
                    val: num,
                    col: firstCol + 1,
                  },
                  cell: { row: positions[0].r, col: positions[0].c },
                };
              }
            }
          }
        }
      }
    }
  }
  return null;
};

const checkNakedPairs = (
  board: BoardType,
  candidates: number[][][],
): Hint | null => {
  for (let r = 0; r < 9; r++) {
    const pairs: { [key: string]: number[] } = {};
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === null && candidates[r][c].length === 2) {
        const key = candidates[r][c].join(',');
        if (!pairs[key]) pairs[key] = [];
        pairs[key].push(c);
      }
    }
    for (const k in pairs) {
      if (pairs[k].length === 2) {
        const combo = k.split(',').map(Number);
        let effective = false;
        for (let c = 0; c < 9; c++) {
          if (!pairs[k].includes(c) && board[r][c] === null) {
            if (
              candidates[r][c].includes(combo[0]) ||
              candidates[r][c].includes(combo[1])
            ) {
              effective = true;
              break;
            }
          }
        }
        if (effective) {
          const c1 = pairs[k][0];
          const c2 = pairs[k][1];
          return {
            key: 'hint_nakedPairRow',
            params: {
              row: r + 1,
              col1: c1 + 1,
              col2: c2 + 1,
              candidates: k,
              val1: combo[0],
              val2: combo[1],
            },
            cell: { row: r, col: c1 },
          };
        }
      }
    }
  }

  for (let c = 0; c < 9; c++) {
    const pairs: { [key: string]: number[] } = {};
    for (let r = 0; r < 9; r++) {
      if (board[r][c] === null && candidates[r][c].length === 2) {
        const key = candidates[r][c].join(',');
        if (!pairs[key]) pairs[key] = [];
        pairs[key].push(r);
      }
    }
    for (const k in pairs) {
      if (pairs[k].length === 2) {
        const combo = k.split(',').map(Number);
        let effective = false;
        for (let r = 0; r < 9; r++) {
          if (!pairs[k].includes(r) && board[r][c] === null) {
            if (
              candidates[r][c].includes(combo[0]) ||
              candidates[r][c].includes(combo[1])
            ) {
              effective = true;
              break;
            }
          }
        }
        if (effective) {
          const r1 = pairs[k][0];
          return {
            key: 'hint_nakedPairCol',
            params: {
              col: c + 1,
              candidates: k,
            },
            cell: { row: r1, col: c },
          };
        }
      }
    }
  }

  return null;
};

export const getHint = (board: BoardType): Hint | null => {
  let bestHint: Hint | null = null;
  let bestScore = -1;

  const getPeerDensity = (r: number, c: number) => {
    let filled = 0;
    for (let k = 0; k < 9; k++) if (board[r][k] !== null) filled++;
    for (let k = 0; k < 9; k++) if (board[k][c] !== null) filled++;
    const br = Math.floor(r / 3) * 3;
    const bc = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) if (board[br + i][bc + j] !== null) filled++;
    return filled;
  };

  const candidatesMap = getCandidatesMap(board);

  // 1. Check Naked Singles (Priority 1)
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === null) {
        const possibles = candidatesMap[r][c];
        if (possibles.length === 1) {
          const score = getPeerDensity(r, c) + 100;
          if (score > bestScore) {
            bestScore = score;
            bestHint = {
              key: 'hint_nakedSingle',
              params: {
                row: r + 1,
                col: c + 1,
                val: possibles[0],
              },
              cell: { row: r, col: c },
            };
          }
        }
      }
    }
  }

  if (bestHint) return bestHint;

  // 2. Check Hidden Singles (Priority 2)
  for (let r = 0; r < 9; r++) {
    const counts: { [key: number]: number[] } = {};
    let filledCount = 0;
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== null) filledCount++;
      else {
        const possibles = candidatesMap[r][c];
        possibles.forEach(p => {
          if (!counts[p]) counts[p] = [];
          counts[p].push(c);
        });
      }
    }
    for (let num = 1; num <= 9; num++) {
      if (counts[num] && counts[num].length === 1) {
        const score = filledCount;
        if (score > bestScore) {
          bestScore = score;
          bestHint = {
            key: 'hint_hiddenSingleRow',
            params: {
              row: r + 1,
              col: counts[num][0] + 1,
              val: num,
            },
            cell: { row: r, col: counts[num][0] },
          };
        }
      }
    }
  }
  for (let c = 0; c < 9; c++) {
    const counts: { [key: number]: number[] } = {};
    for (let r = 0; r < 9; r++) {
      if (board[r][c] === null) {
        const possibles = candidatesMap[r][c];
        possibles.forEach(p => {
          if (!counts[p]) counts[p] = [];
          counts[p].push(r);
        });
      }
    }
    for (let num = 1; num <= 9; num++) {
      if (counts[num] && counts[num].length === 1) {
        if (bestScore < 0) {
          bestScore = 50;
          bestHint = {
            key: 'hint_hiddenSingleCol',
            params: {
              row: counts[num][0] + 1,
              col: c + 1,
              val: num,
            },
            cell: { row: counts[num][0], col: c },
          };
        }
      }
    }
  }

  if (bestHint) return bestHint;

  // 3. Locked Candidates
  const lockedHint = checkLockedCandidates(board, candidatesMap);
  if (lockedHint) return lockedHint;

  // 4. Naked Pairs
  const nakedPairHint = checkNakedPairs(board, candidatesMap);
  if (nakedPairHint) return nakedPairHint;

  return {
    key: 'hint_noMove',
  };
};

export const checkCompletion = (
  board: BoardType,
  row: number,
  col: number,
): { type: string; index: number }[] => {
  const completed: { type: string; index: number }[] = [];
  const rowVals = board[row];
  if (rowVals.every(n => n !== null)) {
    const set = new Set(rowVals);
    if (set.size === 9) completed.push({ type: 'row', index: row });
  }
  const colVals = board.map(r => r[col]);
  if (colVals.every(n => n !== null)) {
    const set = new Set(colVals);
    if (set.size === 9) completed.push({ type: 'col', index: col });
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  const boxVals = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      boxVals.push(board[startRow + r][startCol + c]);
    }
  }
  if (boxVals.every(n => n !== null)) {
    const set = new Set(boxVals);
    if (set.size === 9) {
      const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
      completed.push({ type: 'box', index: boxIndex });
    }
  }
  return completed;
};

export const isGameSolved = (board: BoardType): boolean => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === null) return false;
    }
  }
  for (let r = 0; r < 9; r++) {
    const set = new Set(board[r]);
    if (set.size !== 9) return false;
  }
  for (let c = 0; c < 9; c++) {
    const colVals = board.map(r => r[c]);
    const set = new Set(colVals);
    if (set.size !== 9) return false;
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const vals = [];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          vals.push(board[br * 3 + i][bc * 3 + j]);
        }
      }
      const set = new Set(vals);
      if (set.size !== 9) return false;
    }
  }
  return true;
};
