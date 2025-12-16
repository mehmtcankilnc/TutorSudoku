/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useIsFocused } from '@react-navigation/native';
import { Cell } from './Cell';
import {
  generateSudoku,
  isValidMove,
  BoardType,
  getHint,
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
  isSettingsOpen?: boolean;
}

export const Board: React.FC<BoardProps> = ({
  scannedBoard,
  isSettingsOpen = false,
}) => {
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const { t } = useTranslation();

  const totalBoardWidth = wp('85%');
  const cellSize = Math.floor(totalBoardWidth / 9);

  const { isDarkMode, gamesWon } = useSelector((state: RootState) => ({
    isDarkMode: state.theme.isDarkMode,
    gamesWon: state.user.gamesWon || { easy: 0, medium: 0, hard: 0 },
  }));

  const [initialBoard, setInitialBoard] = useState<BoardType>([]);
  const [board, setBoard] = useState<BoardType>([]);
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

  const timerRef = React.useRef(0);
  const [isDifficultyModalVisible, setIsDifficultyModalVisible] =
    useState(false);
  const [gameKey, setGameKey] = useState(0);

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
      setNotes(
        Array(9)
          .fill(null)
          .map(() => Array(9).fill([])),
      );

      timerRef.current = 0;
      setGameKey(prev => prev + 1);
      setIsSolved(false);
      setMistakeCount(0);
      setHintCount(0);
      setIsTimerRunning(true);
      setIsPaused(false);
      setIsNoteMode(false);
      setCurrentDifficulty('easy');
      setGameState('playing');
    } else {
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
    setNotes(
      Array(9)
        .fill(null)
        .map(() => Array(9).fill([])),
    );

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
    if (isSolved || isPaused || isSettingsOpen) return;

    setSelectedCell({ row, col });
    setHighlightedCell(null);
    setTutorMessage(null);
    setConflictingCell(null);
  };

  const handleNumberPress = (num: number) => {
    if (!selectedCell || isSolved || isPaused || isSettingsOpen) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

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

    const conflict = checkConflict(board, row, col, num);
    if (conflict) {
      setTutorMessage({
        row,
        col,
        text: { key: conflict.key, params: conflict.params },
      });
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

    setNotes(prev => {
      const newNotes = [...prev];
      newNotes[row] = [...prev[row]];
      newNotes[row][col] = [];
      return newNotes;
    });

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

        dispatch(recordWin(currentDifficulty));
      }
    }
  };

  const handleClearPress = () => {
    if (!selectedCell || isPaused || isSettingsOpen) return;

    const { row, col } = selectedCell;
    if (initialBoard[row][col] !== null) return;

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
  };

  const handleHintPress = () => {
    if (isSolved || isPaused || isSettingsOpen) return;

    setHintCount(prev => prev + 1);
    const hint = getHint(board);
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
        <Text>{t('loading')}</Text>
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
      <View
        className="flex-row justify-between w-full items-center"
        style={{ paddingHorizontal: wp(4), marginBottom: hp(1) }}
      >
        <View className="flex-row" style={{ gap: wp(6) }}>
          <GameTimer
            key={gameKey}
            isRunning={
              isTimerRunning &&
              !isPaused &&
              !isSolved &&
              !isSettingsOpen &&
              isFocused
            }
            isDarkMode={isDarkMode}
            initialTime={0}
            onTimeUpdate={t => {
              timerRef.current = t;
            }}
          />
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={wp(6)}
              color="#EF4444"
            />
            <Text
              className="text-red-500 font-bold"
              style={{ marginLeft: wp(1), fontSize: wp(5) }}
            >
              {mistakeCount}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={wp(6)}
              color="#EAB308"
            />
            <Text
              className="text-yellow-600 font-bold"
              style={{ marginLeft: wp(1), fontSize: wp(5) }}
            >
              {hintCount}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setIsPaused(!isPaused)}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
          style={{ padding: wp(2), borderRadius: 9999 }}
        >
          <MaterialCommunityIcons
            name={isPaused ? 'play' : 'pause'}
            size={wp(7)}
            color={isDarkMode ? '#E5E7EB' : '#4B5563'}
          />
        </TouchableOpacity>
      </View>
      <View className="relative">
        {isPaused && (
          <View
            className={`absolute inset-0 z-50 items-center justify-center border-4 ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
            style={{ borderRadius: wp(5), gap: wp(3) }}
          >
            <Text
              className={`text-4xl font-bold ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
              style={{ fontSize: wp(10), lineHeight: wp(10) }}
            >
              {t('paused')}
            </Text>
            <TouchableOpacity
              onPress={() => setIsPaused(false)}
              className="bg-blue-500"
              style={{
                paddingHorizontal: wp(7),
                paddingVertical: wp(3),
                borderRadius: 9999,
              }}
            >
              <Text
                className="text-white font-bold"
                style={{ fontSize: wp(5) }}
              >
                {t('resume')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleReturnToHome}
              className="bg-red-500"
              style={{
                paddingHorizontal: wp(7),
                paddingVertical: wp(3),
                borderRadius: 9999,
              }}
            >
              <Text
                className="text-white font-bold"
                style={{ fontSize: wp(5) }}
              >
                {t('exitGame')}
              </Text>
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
                          isDarkMode ? 'border-r-gray-800' : 'border-r-black'
                        }`
                      : '';
                  const borderBottom =
                    (rowIndex + 1) % 3 === 0 && rowIndex !== 8
                      ? `border-b-2 ${
                          isDarkMode ? 'border-b-gray-800' : 'border-b-black'
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

                  const currentCandidates =
                    notes.length > rowIndex && notes[rowIndex].length > colIndex
                      ? notes[rowIndex][colIndex]
                      : [];

                  return (
                    <View
                      key={`${rowIndex}-${colIndex}`}
                      className={`${borderRight} ${borderBottom} relative ${zIndexClass}`}
                    >
                      <Cell
                        value={cellValue}
                        candidates={currentCandidates}
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
                          message={
                            t(
                              tutorMessage.text.key,
                              tutorMessage.text.params,
                            ) as string
                          }
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
        completedNumbers={completedNumbers}
        isDarkMode={isDarkMode}
      />
      <View className="flex-row" style={{ gap: wp(8), marginTop: wp(2) }}>
        <TouchableOpacity
          onPress={() => setIsNoteMode(!isNoteMode)}
          className={`items-center justify-center rounded-full active:opacity-60 relative
             ${
               isNoteMode
                 ? isDarkMode
                   ? 'bg-blue-900 border border-blue-500'
                   : 'bg-blue-100 border border-blue-500'
                 : 'bg-transparent'
             }
          `}
          style={{ padding: wp(3) }}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={wp(8)}
            color={
              isDarkMode
                ? isNoteMode
                  ? '#60A5FA'
                  : '#9CA3AF'
                : isNoteMode
                ? '#2563EB'
                : '#4B5563'
            }
          />
          <View
            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center
               ${
                 isNoteMode
                   ? isDarkMode
                     ? 'bg-blue-500'
                     : 'bg-blue-600'
                   : 'opacity-0'
               }
           `}
          >
            <Text className="text-white text-xs font-bold">ON</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleHintPress}
          className="items-center justify-center rounded-full active:opacity-60"
          style={{ padding: wp(3) }}
        >
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={wp(8)}
            color={isDarkMode ? '#FCD34D' : '#EAB308'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleClearPress}
          className="items-center justify-center rounded-full active:opacity-60"
          style={{ padding: wp(3) }}
        >
          <MaterialCommunityIcons
            name="backspace-outline"
            size={wp(8)}
            color={isDarkMode ? '#F87171' : '#EF4444'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNewGamePress}
          className="items-center justify-center rounded-full active:opacity-60"
          style={{ padding: wp(3) }}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={wp(8)}
            color={isDarkMode ? '#9CA3AF' : '#4B5563'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
