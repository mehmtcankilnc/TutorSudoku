import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { Cell } from './Cell';
import {
  generateSudoku,
  isValidMove,
  BoardType,
  getHint,
  Hint,
  checkConflict,
  checkCompletion,
  isGameSolved,
} from '../utils/SudokuLogic';
import { ResultScreen } from './ResultScreen';
import { NumberPad } from './NumberPad';
import { TutorBubble } from './TutorBubble';
import { GameTimer } from './GameTimer';
import { DifficultyModal } from './DifficultyModal';
import { LevelSelection } from './LevelSelection';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { recordWin } from '../store/userSlice';
import { useAlert } from '../context/AlertContext';

interface BoardProps {
  scannedBoard?: (number | null)[][];
}

export const Board: React.FC<BoardProps> = ({ scannedBoard }) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { width } = useWindowDimensions();
  const boardPadding = 20;
  const cellSize = Math.floor((width - boardPadding * 2) / 9);

  const { isDarkMode, gamesWon } = useSelector((state: RootState) => ({
    isDarkMode: state.theme.isDarkMode,
    gamesWon: state.user.gamesWon || { easy: 0, medium: 0, hard: 0 },
  }));

  const [initialBoard, setInitialBoard] = useState<BoardType>([]);
  const [board, setBoard] = useState<BoardType>([]);
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
    text: string;
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

  /* Timer is now handled in GameTimer, but we keep track of final time for Results */
  const timerRef = React.useRef(0);
  const [isDifficultyModalVisible, setIsDifficultyModalVisible] =
    useState(false);
  const [gameKey, setGameKey] = useState(0);

  // Game Stage Management
  const [gameState, setGameState] = useState<'selecting' | 'playing'>(
    'selecting',
  );
  const [currentDifficulty, setCurrentDifficulty] = useState<
    'easy' | 'medium' | 'hard'
  >('easy');

  useEffect(() => {
    if (scannedBoard) {
      const validBoard = JSON.parse(JSON.stringify(scannedBoard));
      setInitialBoard(validBoard);
      setBoard(JSON.parse(JSON.stringify(validBoard)));
      // Reset timer ref
      timerRef.current = 0;
      setGameKey(prev => prev + 1);
      setIsSolved(false);
      setMistakeCount(0);
      setHintCount(0);
      setIsTimerRunning(true);
      setIsPaused(false);
      // Mode
      setCurrentDifficulty('easy');
      setGameState('playing');
    } else {
      // If simply loading Board without params, we show selection
      setGameState('selecting');
    }
  }, [scannedBoard]);

  const completedNumbers = React.useMemo(() => {
    if (board.length === 0) return [];
    const counts: { [key: number]: number } = {};
    board.forEach(row =>
      row.forEach(val => {
        if (val !== null) counts[val] = (counts[val] || 0) + 1;
      }),
    );
    return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => counts[n] === 9);
  }, [board]);

  const startNewGame = (difficulty: 'easy' | 'medium' | 'hard' = 'easy') => {
    setIsDifficultyModalVisible(false);
    const newBoard = generateSudoku(difficulty);

    setInitialBoard(newBoard.map(row => [...row]));
    setBoard(newBoard.map(row => [...row]));
    setSelectedCell(null);
    setHighlightedCell(null);
    setShakingCell(null);
    setTutorMessage(null);
    setConflictingCell(null);
    setLastMovedCell(null);
    setCompletedUnits([]);
    setIsSolved(false);
    setIsPaused(false);
    setMistakeCount(0);
    setHintCount(0);
    // Reset timer
    timerRef.current = 0;
    setGameKey(prev => prev + 1);
    setIsTimerRunning(true);

    // Update Flow
    setCurrentDifficulty(difficulty);
    setGameState('playing');
  };

  const handleNewGamePress = () => {
    setIsDifficultyModalVisible(true);
  };

  const handleReturnToHome = () => {
    setGameState('selecting');
    setIsSolved(false);
  };

  const handleCellPress = (row: number, col: number) => {
    if (isSolved || isPaused) return;

    setSelectedCell({ row, col });
    setHighlightedCell(null);
    setTutorMessage(null);
    setConflictingCell(null);
  };

  const handleNumberPress = (num: number) => {
    if (!selectedCell || isSolved || isPaused) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    const conflict = checkConflict(board, row, col, num);
    if (conflict) {
      setTutorMessage({ row, col, text: conflict.message });
      setConflictingCell(conflict.conflictingCell);
      setShakingCell({ row, col });
      setMistakeCount(prev => prev + 1);
      setTimeout(() => setShakingCell(null), 500);
    } else {
      setTutorMessage(null);
      setConflictingCell(null);
    }

    const newBoard = [...board];
    newBoard[row] = [...newBoard[row]];
    newBoard[row][col] = num;

    setBoard(newBoard);
    if (!conflict) {
      const completions = checkCompletion(newBoard, row, col);
      if (completions.length > 0) {
        setLastMovedCell({ row, col });
        setCompletedUnits(completions);
        setTimeout(() => setCompletedUnits([]), 1500);
      }

      if (isGameSolved(newBoard)) {
        setIsSolved(true);
        setIsTimerRunning(false);
        // Record Win!
        dispatch(recordWin(currentDifficulty));
      }
    }
  };

  const handleClearPress = () => {
    if (!selectedCell || isPaused) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

    const newBoard = [...board];
    newBoard[row] = [...newBoard[row]];
    newBoard[row][col] = null;
    setBoard(newBoard);
    setTutorMessage(null);
  };

  const handleHintPress = () => {
    if (isSolved || isPaused) return;

    setHintCount(prev => prev + 1);
    const hint = getHint(board);
    if (hint) {
      if (hint.cell) {
        setHighlightedCell(hint.cell);
        setSelectedCell(hint.cell);
        setTutorMessage({
          row: hint.cell.row,
          col: hint.cell.col,
          text: hint.message,
        });
      } else {
        showAlert('Hint', hint.message);
      }
    } else {
      showAlert(
        'Good Job',
        'The board looks solved or no obvious moves found!',
      );
    }
  };

  if (gameState === 'selecting') {
    return (
      <LevelSelection
        onSelectDifficulty={startNewGame}
        isDarkMode={isDarkMode}
        gamesWon={gamesWon}
      />
    );
  }

  if (board.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="items-center w-full relative z-0">
      <DifficultyModal
        visible={isDifficultyModalVisible}
        onClose={() => setIsDifficultyModalVisible(false)}
        onSelect={startNewGame}
        isDarkMode={isDarkMode}
        gamesWon={gamesWon}
      />
      {isSolved && (
        <ResultScreen
          mistakes={mistakeCount}
          hints={hintCount}
          timeInSeconds={timerRef.current}
          onNewGame={handleReturnToHome}
        />
      )}
      <View className="flex-row justify-between w-full px-4 mb-4 items-center">
        <View className="flex-row gap-6">
          <GameTimer
            key={gameKey}
            isRunning={isTimerRunning && !isPaused && !isSolved && isFocused}
            isDarkMode={isDarkMode}
            initialTime={0}
            onTimeUpdate={t => {
              timerRef.current = t;
            }}
          />
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={24}
              color="#EF4444"
            />
            <Text className="text-red-500 font-bold text-xl ml-1">
              {mistakeCount}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={24}
              color="#EAB308"
            />
            <Text className="text-yellow-600 font-bold text-xl ml-1">
              {hintCount}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setIsPaused(!isPaused)}
          className={`p-2 rounded-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}
        >
          <MaterialCommunityIcons
            name={isPaused ? 'play' : 'pause'}
            size={28}
            color={isDarkMode ? '#E5E7EB' : '#4B5563'}
          />
        </TouchableOpacity>
      </View>
      <View className="relative">
        {isPaused && (
          <View
            className={`absolute inset-0 z-50 items-center justify-center rounded-xl border-4 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <Text
              className={`text-4xl font-bold mb-4 ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
            >
              PAUSED
            </Text>
            <TouchableOpacity
              onPress={() => setIsPaused(false)}
              className="bg-blue-500 px-8 py-3 rounded-full"
            >
              <Text className="text-white font-bold text-lg">Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReturnToHome}
              className="mt-4 bg-red-500 px-8 py-3 rounded-full"
            >
              <Text className="text-white font-bold text-lg">Exit Game</Text>
            </TouchableOpacity>
          </View>
        )}
        <View
          className={`border-4 shadow-2xl elevation-10 z-10 ${
            isDarkMode ? 'border-gray-600 bg-gray-900' : 'border-black bg-white'
          } ${isPaused ? 'opacity-0' : 'opacity-100'}`}
        >
          {board.map((row, rowIndex) => {
            const isBubbleRow = tutorMessage?.row === rowIndex;
            const rowZIndex = isBubbleRow ? 'z-50 elevation-50' : 'z-10';
            return (
              <View key={rowIndex} className={`flex-row ${rowZIndex}`}>
                {row.map((cellValue, colIndex) => {
                  const borderRight =
                    (colIndex + 1) % 3 === 0 && colIndex !== 8
                      ? `border-r-2 ${
                          isDarkMode ? 'border-r-gray-600' : 'border-r-black'
                        }`
                      : '';
                  const borderBottom =
                    (rowIndex + 1) % 3 === 0 && rowIndex !== 8
                      ? `border-b-2 ${
                          isDarkMode ? 'border-b-gray-600' : 'border-b-black'
                        }`
                      : '';
                  const isEditable = initialBoard[rowIndex][colIndex] === null;
                  let isInvalid = false;
                  if (cellValue !== null) {
                    if (!isValidMove(board, rowIndex, colIndex, cellValue)) {
                      isInvalid = true;
                    }
                  }
                  const isHinted =
                    highlightedCell?.row === rowIndex &&
                    highlightedCell?.col === colIndex;
                  const isSelected =
                    selectedCell?.row === rowIndex &&
                    selectedCell?.col === colIndex;
                  const isRelated = selectedCell
                    ? (selectedCell.row === rowIndex ||
                        selectedCell.col === colIndex) &&
                      !isSelected
                    : false;
                  const shouldShake =
                    shakingCell?.row === rowIndex &&
                    shakingCell?.col === colIndex;
                  const isConflictSource =
                    conflictingCell?.row === rowIndex &&
                    conflictingCell?.col === colIndex;
                  const showBubble =
                    tutorMessage?.row === rowIndex &&
                    tutorMessage?.col === colIndex;
                  const zIndexClass = showBubble ? 'z-50 elevation-50' : 'z-20';

                  const isSuccess = completedUnits.some(unit => {
                    if (unit.type === 'row') return unit.index === rowIndex;
                    if (unit.type === 'col') return unit.index === colIndex;
                    if (unit.type === 'box') {
                      const boxRow = Math.floor(rowIndex / 3);
                      const boxCol = Math.floor(colIndex / 3);
                      return unit.index === boxRow * 3 + boxCol;
                    }
                    return false;
                  });
                  return (
                    <View
                      key={`${rowIndex}-${colIndex}`}
                      className={`${borderRight} ${borderBottom} relative ${zIndexClass}`}
                    >
                      <Cell
                        value={cellValue}
                        onPress={() => handleCellPress(rowIndex, colIndex)}
                        isSelected={isSelected}
                        isRelated={isRelated}
                        isConflictSource={isConflictSource}
                        isEditable={isEditable}
                        isInvalid={isInvalid}
                        shouldShake={shouldShake}
                        isSuccess={isSuccess}
                        successDelay={
                          isSuccess && lastMovedCell
                            ? (Math.abs(rowIndex - lastMovedCell.row) +
                                Math.abs(colIndex - lastMovedCell.col)) *
                              50
                            : 0
                        }
                        isDarkMode={isDarkMode}
                        size={cellSize}
                      />
                      {isHinted && (
                        <View className="absolute inset-0 bg-yellow-300 opacity-50 pointer-events-none" />
                      )}
                      {showBubble && tutorMessage && (
                        <TutorBubble
                          message={tutorMessage.text}
                          onDismiss={() => setTutorMessage(null)}
                          position={rowIndex < 4 ? 'below' : 'above'}
                          align={colIndex < 4 ? 'left' : 'right'}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
      <NumberPad
        onNumberPress={handleNumberPress}
        onClearPress={handleClearPress}
        completedNumbers={completedNumbers}
        isDarkMode={isDarkMode}
      />
      <View className="flex-row gap-12 mt-8">
        <TouchableOpacity
          onPress={handleHintPress}
          className="items-center justify-center p-3 rounded-full active:opacity-60"
        >
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={32}
            color={isDarkMode ? '#FCD34D' : '#EAB308'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleClearPress}
          className="items-center justify-center p-3 rounded-full active:opacity-60"
        >
          <MaterialCommunityIcons
            name="backspace-outline"
            size={32}
            color={isDarkMode ? '#F87171' : '#EF4444'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNewGamePress}
          className="items-center justify-center p-3 rounded-full active:opacity-60"
        >
          <MaterialCommunityIcons
            name="refresh"
            size={32}
            color={isDarkMode ? '#9CA3AF' : '#4B5563'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
