import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AppState } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { recordWin } from '../store/userSlice';
import {
  generateSudoku,
  isValidMove,
  BoardType,
  getHint,
  checkConflict,
  checkCompletion,
  isGameSolved,
  solve,
} from '../utils/SudokuLogic';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../context/AlertContext';
import { playSound } from '../utils/SoundManager';

export interface GameState {
  board: BoardType;
  initialBoard: BoardType;
  notes: number[][][];
  mistakeCount: number;
  hintCount: number;
  timer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  solution: BoardType;
  history: { board: BoardType; notes: number[][][] }[];
}

export const useSudokuGame = (
  scannedBoard: (number | null)[][] | undefined,
  onGameSolved: () => void,
) => {
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { t } = useTranslation();

  const { isDarkMode, gamesWon } = useSelector((state: RootState) => ({
    isDarkMode: state.theme.isDarkMode,
    gamesWon: state.user.gamesWon || { easy: 0, medium: 0, hard: 0 },
  }));

  const [initialBoard, setInitialBoard] = useState<BoardType>([]);
  const [board, setBoard] = useState<BoardType>([]);
  const [solution, setSolution] = useState<BoardType>([]);
  const [notes, setNotes] = useState<number[][][]>([]);

  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [highlightedCell, setHighlightedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [shakingCell, setShakingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [lastMovedCell, setLastMovedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [tutorMessage, setTutorMessage] = useState<{
    row: number;
    col: number;
    text: { key: string; params?: any };
  } | null>(null);
  const [conflictingCell, setConflictingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [completedUnits, setCompletedUnits] = useState<
    { type: string; index: number }[]
  >([]);

  const [isSolved, setIsSolved] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);

  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isNoteMode, setIsNoteMode] = useState(false);

  const timerRef = useRef(0);
  const [gameKey, setGameKey] = useState(0);

  const [currentDifficulty, setCurrentDifficulty] = useState<
    'easy' | 'medium' | 'hard'
  >('easy');

  const [history, setHistory] = useState<
    { board: BoardType; notes: number[][][] }[]
  >([]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState !== 'active' && !isSolved) {
        setIsPaused(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isSolved]);

  useEffect(() => {
    if (scannedBoard) {
      const validBoard = JSON.parse(JSON.stringify(scannedBoard));
      setInitialBoard(validBoard);
      setBoard(JSON.parse(JSON.stringify(validBoard)));

      const solutionBoard = JSON.parse(JSON.stringify(validBoard));
      solve(solutionBoard);
      setSolution(solutionBoard);

      setNotes(
        Array(9)
          .fill(null)
          .map(() => Array(9).fill([])),
      );
      setHistory([]);

      timerRef.current = 0;
      setGameKey(prev => prev + 1);
      setIsSolved(false);
      setMistakeCount(0);
      setHintCount(0);
      setIsTimerRunning(true);
      setIsPaused(false);
      setIsNoteMode(false);
      setCurrentDifficulty('easy');
    }
  }, [scannedBoard]);

  const completedNumbers = useMemo(() => {
    if (board.length === 0) return [];
    const counts: { [key: number]: number } = {};
    board.forEach(row =>
      row.forEach(val => {
        if (val !== null) counts[val] = (counts[val] || 0) + 1;
      }),
    );

    const candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => counts[n] === 9);

    return candidates.filter(num => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] === num) {
            if (checkConflict(board, r, c, num)) {
              return false;
            }
          }
        }
      }
      return true;
    });
  }, [board]);

  const startNewGame = useCallback(
    (difficulty: 'easy' | 'medium' | 'hard' = 'easy') => {
      const { puzzle, solution: newSolution } = generateSudoku(difficulty);

      setInitialBoard(puzzle.map(row => [...row]));
      setBoard(puzzle.map(row => [...row]));
      setSolution(newSolution);
      setNotes(
        Array(9)
          .fill(null)
          .map(() => Array(9).fill([])),
      );
      setHistory([]);

      setSelectedCell(null);
      setHighlightedCell(null);
      setShakingCell(null);
      setTutorMessage(null);
      setConflictingCell(null);
      setLastMovedCell(null);
      setCompletedUnits([]);
      setIsSolved(false);
      setIsPaused(false);
      setIsNoteMode(false);
      setMistakeCount(0);
      setHintCount(0);
      timerRef.current = 0;
      setGameKey(prev => prev + 1);
      setIsTimerRunning(true);

      setCurrentDifficulty(difficulty);
    },
    [],
  );

  const loadSavedGame = useCallback((savedState: GameState) => {
    setInitialBoard(savedState.initialBoard);
    setBoard(savedState.board);
    let loadedSolution = savedState.solution;
    if (!loadedSolution || loadedSolution.length === 0) {
      const tempBoard = JSON.parse(JSON.stringify(savedState.initialBoard));
      solve(tempBoard);
      loadedSolution = tempBoard;
    }
    setSolution(loadedSolution);

    setNotes(savedState.notes);
    setMistakeCount(savedState.mistakeCount);
    setHintCount(savedState.hintCount);
    setCurrentDifficulty(savedState.difficulty);
    setHistory(savedState.history);

    timerRef.current = savedState.timer;

    setSelectedCell(null);
    setHighlightedCell(null);
    setShakingCell(null);
    setTutorMessage(null);
    setConflictingCell(null);
    setLastMovedCell(null);
    setCompletedUnits([]);
    setIsSolved(false);
    setIsPaused(true);
    setIsNoteMode(false);

    setGameKey(prev => prev + 1);
    setIsTimerRunning(true);
  }, []);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (isSolved || isPaused) return;

      setSelectedCell({ row, col });
      setHighlightedCell(null);
      setTutorMessage(null);
      setConflictingCell(null);
    },
    [isSolved, isPaused],
  );

  const saveToHistory = useCallback(() => {
    setHistory(prev => [
      ...prev,
      {
        board: JSON.parse(JSON.stringify(board)),
        notes: JSON.parse(JSON.stringify(notes)),
      },
    ]);
  }, [board, notes]);

  const handleUndo = useCallback(() => {
    if (isSolved || isPaused || history.length === 0) return;

    setHistory(prev => {
      const newHistory = [...prev];
      const lastState = newHistory.pop();
      if (lastState) {
        setBoard(lastState.board);
        setNotes(lastState.notes);
        setTutorMessage(null);
        setConflictingCell(null);
        setShakingCell(null);
        setLastMovedCell(null);
      }
      return newHistory;
    });
  }, [isSolved, isPaused, history]);

  const handleNumberPress = useCallback(
    (num: number) => {
      if (!selectedCell || isSolved || isPaused) return;

      const { row, col } = selectedCell;
      if (initialBoard[row][col] !== null) return;

      if (board[row][col] !== null) {
        const currentVal = board[row][col]!;

        const tempBoard = board.map(r => [...r]);
        tempBoard[row][col] = null;
        if (isValidMove(tempBoard, row, col, currentVal)) {
          return;
        }
      }

      saveToHistory();

      if (isNoteMode) {
        if (board[row][col] !== null) return;

        setNotes(prev => {
          const newNotes = [...prev];
          newNotes[row] = [...prev[row]];
          const currentNotes = newNotes[row][col];
          if (currentNotes.includes(num)) {
            newNotes[row][col] = currentNotes.filter(n => n !== num);
          } else {
            newNotes[row][col] = [...currentNotes, num].sort();
          }
          return newNotes;
        });
        return;
      }

      const isCorrect = solution.length > 0 && solution[row][col] === num;

      if (!isCorrect) {
        const conflict = checkConflict(board, row, col, num);
        if (conflict) {
          setTutorMessage({
            row,
            col,
            text: { key: conflict.key, params: conflict.params },
          });
          setConflictingCell(conflict.conflictingCell);
        } else {
          setTutorMessage(null);
          setConflictingCell(null);
        }

        setShakingCell({ row, col });
        setMistakeCount(prev => prev + 1);
        playSound('wrong');
        setTimeout(() => setShakingCell(null), 500);
        return;
      } else {
        setTutorMessage(null);
        setConflictingCell(null);
      }

      const conflict = null;

      const newBoard = [...board];
      newBoard[row] = [...newBoard[row]];
      newBoard[row][col] = num;

      setBoard(newBoard);

      setNotes(prev => {
        const newNotes = [...prev];
        newNotes[row] = [...prev[row]];
        newNotes[row][col] = [];
        return newNotes;
      });

      if (!conflict) {
        const completions = checkCompletion(newBoard, row, col);
        const solved = isGameSolved(newBoard);

        if (solved) {
          playSound('completed');
          setLastMovedCell({ row, col });

          const allRows = Array.from({ length: 9 }, (_, i) => ({
            type: 'row',
            index: i,
          }));
          setCompletedUnits(allRows);

          const ANIMATION_DURATION = 2500;

          setIsTimerRunning(false);
          dispatch(recordWin(currentDifficulty));

          setTimeout(() => {
            setIsSolved(true);
            if (onGameSolved) onGameSolved();
          }, ANIMATION_DURATION);
        } else if (completions.length > 0) {
          setLastMovedCell({ row, col });
          playSound('correct');
          setCompletedUnits(completions);
          setTimeout(() => setCompletedUnits([]), 1500);
        } else {
          playSound('correct');
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      selectedCell,
      isSolved,
      isPaused,
      initialBoard,
      isNoteMode,
      board,
      currentDifficulty,
      dispatch,
      onGameSolved,
      saveToHistory,
    ],
  );

  const handleClearPress = useCallback(() => {
    if (!selectedCell || isPaused) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    if (board[row][col] !== null) {
      const currentVal = board[row][col]!;
      const tempBoard = board.map(r => [...r]);
      tempBoard[row][col] = null;
      if (isValidMove(tempBoard, row, col, currentVal)) {
        return;
      }
    }

    saveToHistory();

    const newBoard = [...board];
    newBoard[row] = [...newBoard[row]];
    newBoard[row][col] = null;
    setBoard(newBoard);
    setTutorMessage(null);

    setNotes(prev => {
      const newNotes = [...prev];
      newNotes[row] = [...prev[row]];
      newNotes[row][col] = [];
      return newNotes;
    });
  }, [selectedCell, isPaused, initialBoard, board, saveToHistory]);

  const handleHintPress = useCallback(() => {
    if (isSolved || isPaused) return;

    setHintCount(prev => prev + 1);
    const hint = getHint(board, notes);
    if (hint) {
      if (hint.cell) {
        setHighlightedCell(hint.cell);
        setSelectedCell(hint.cell);
        setTutorMessage({
          row: hint.cell.row,
          col: hint.cell.col,
          text: { key: hint.key, params: hint.params },
        });
      } else {
        showAlert(t('hintHeader'), t(hint.key, hint.params));
      }
    } else {
      showAlert(t('goodJob'), t('boardSolved'));
    }
  }, [isSolved, isPaused, board, t, showAlert]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);
  const toggleNoteMode = useCallback(() => {
    setIsNoteMode(prev => !prev);
  }, []);

  const debugWin = useCallback(() => {
    setIsSolved(true);
    playSound('completed');
  }, []);

  return {
    board,
    initialBoard,
    solution,
    notes,
    selectedCell,
    highlightedCell,
    shakingCell,
    lastMovedCell,
    tutorMessage,
    conflictingCell,
    completedUnits,
    isSolved,
    mistakeCount,
    hintCount,
    isTimerRunning,
    isPaused,
    setIsPaused,
    togglePause,
    isNoteMode,
    toggleNoteMode,
    timerRef,
    gameKey,
    startNewGame,
    handleCellPress,
    handleNumberPress,
    handleClearPress,
    handleHintPress,
    handleUndo,
    completedNumbers,
    isDarkMode,
    gamesWon,
    currentDifficulty,
    setTutorMessage,
    loadSavedGame,
    history,
    debugWin,
  };
};
