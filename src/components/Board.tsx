/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, AppState } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useIsFocused } from '@react-navigation/native';
import { ResultScreen } from './ResultScreen';
import { NumberPad } from './NumberPad';
import { GameTimer } from './GameTimer';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSudokuGame } from '../hooks/useSudokuGame';
import { SudokuGrid } from './SudokuGrid';

import { GameControls } from './GameControls';
import { playSound } from '../utils/SoundManager';

interface BoardProps {
  scannedBoard?: (number | null)[][];
  isSettingsOpen?: boolean;
  initialDifficulty?: 'easy' | 'medium' | 'hard';
  onExit: () => void;
  savedGameState?: any;
  justResumed?: boolean;
  onReady?: () => void;
  containerStyle?: View['props']['style'];
}

export const Board: React.FC<BoardProps> = ({
  scannedBoard,
  isSettingsOpen = false,
  initialDifficulty = 'easy',
  onExit,
  savedGameState,
  justResumed,
  onReady,
}) => {
  const isFocused = useIsFocused();
  const { t } = useTranslation();

  const game = useSudokuGame(scannedBoard, () => {});

  const gameRef = React.useRef(game);
  useEffect(() => {
    gameRef.current = game;
  });

  const isManualExit = React.useRef(false);

  useEffect(() => {
    if (game.board.length > 0 && onReady) {
      onReady();
    }
  }, [game.board, onReady]);

  useEffect(() => {
    if (game.board.length === 0) {
      if (savedGameState) {
        game.loadSavedGame(savedGameState);
        if (justResumed) {
          game.setIsPaused(false);
        }
      } else if (!scannedBoard) {
        game.startNewGame(initialDifficulty);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedBoard, savedGameState]);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState !== 'active') {
        gameRef.current.setIsPaused(true);
        saveGame();
      }
    };

    const saveGame = async () => {
      const currentGame = gameRef.current;
      if (
        !isManualExit.current &&
        !currentGame.isSolved &&
        currentGame.board.length > 0
      ) {
        const gameState = {
          board: currentGame.board,
          initialBoard: currentGame.initialBoard,
          notes: currentGame.notes,
          mistakeCount: currentGame.mistakeCount,
          hintCount: currentGame.hintCount,
          timer: currentGame.timerRef.current,
          difficulty: currentGame.currentDifficulty,
          solution: currentGame.solution,
          history: [],
        };
        try {
          const AsyncStorage =
            require('@react-native-async-storage/async-storage').default;
          await AsyncStorage.setItem('saved_game', JSON.stringify(gameState));
        } catch (e) {
          console.error('Failed to save game', e);
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );

    return () => {
      saveGame();
      subscription.remove();
    };
  }, []);

  const handleExit = () => {
    isManualExit.current = true;

    const AsyncStorage =
      require('@react-native-async-storage/async-storage').default;
    AsyncStorage.removeItem('saved_game').catch((e: any) =>
      console.error('Failed to clear saved game', e),
    );
    onExit();
  };

  useEffect(() => {
    return () => {
      if (!isManualExit.current && !game.isSolved && game.board.length > 0) {
        const saveGame = async () => {
          const currentGame = gameRef.current;
          const gameState = {
            board: currentGame.board,
            initialBoard: currentGame.initialBoard,
            notes: currentGame.notes,
            mistakeCount: currentGame.mistakeCount,
            hintCount: currentGame.hintCount,
            timer: currentGame.timerRef.current,
            difficulty: currentGame.currentDifficulty,
            solution: currentGame.solution,
            history: [],
          };
          try {
            const AsyncStorage =
              require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.setItem('saved_game', JSON.stringify(gameState));
          } catch (e) {
            console.error('Failed to save game', e);
          }
        };
        saveGame();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    game.board,
    game.initialBoard,
    game.notes,
    game.mistakeCount,
    game.hintCount,
    game.currentDifficulty,
    game.isSolved,
  ]);

  if (game.board.length === 0) {
    return null;
  }

  return (
    <View className="items-center w-full relative z-0">
      <View
        className="flex-row justify-between w-full items-center"
        style={{ paddingHorizontal: wp(4), marginBottom: hp(1) }}
      >
        <View className="flex-row" style={{ gap: wp(6) }}>
          <GameTimer
            key={game.gameKey}
            isRunning={
              game.isTimerRunning &&
              !game.isPaused &&
              !game.isSolved &&
              !isSettingsOpen &&
              isFocused
            }
            isDarkMode={game.isDarkMode}
            initialTime={game.timerRef.current}
            onTimeUpdate={tVal => {
              game.timerRef.current = tVal;
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
              {game.mistakeCount}
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
              {game.hintCount}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={game.togglePause}
          onPressIn={() => playSound('click')}
          className={`${game.isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
          style={{ padding: wp(2), borderRadius: 9999 }}
        >
          <MaterialCommunityIcons
            name={game.isPaused ? 'play' : 'pause'}
            size={wp(7)}
            color={game.isDarkMode ? '#E5E7EB' : '#4B5563'}
          />
        </TouchableOpacity>
      </View>
      <View className="relative">
        {game.isSolved && (
          <ResultScreen
            mistakes={game.mistakeCount}
            hints={game.hintCount}
            timeInSeconds={game.timerRef.current}
            onNewGame={handleExit}
            isDarkMode={game.isDarkMode}
          />
        )}
        {game.isPaused && (
          <View
            className={`absolute inset-0 z-50 items-center justify-center border-4 ${
              game.isDarkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            }`}
            style={{ borderRadius: wp(5), gap: wp(3) }}
          >
            <Text
              className={`text-4xl font-bold ${
                game.isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
              style={{ fontSize: wp(10), lineHeight: wp(10) }}
            >
              {t('paused')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                game.setIsPaused(false);
              }}
              onPressIn={() => playSound('click')}
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
              onPress={handleExit}
              onPressIn={() => playSound('click')}
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
        <View className={game.isPaused ? 'opacity-0' : 'opacity-100'}>
          <SudokuGrid
            board={game.board}
            initialBoard={game.initialBoard}
            notes={game.notes}
            selectedCell={game.selectedCell}
            highlightedCell={game.highlightedCell}
            shakingCell={game.shakingCell}
            lastMovedCell={game.lastMovedCell}
            tutorMessage={game.tutorMessage}
            conflictingCell={game.conflictingCell}
            completedUnits={game.completedUnits}
            isDarkMode={game.isDarkMode}
            onCellPress={game.handleCellPress}
            onDismissTutorMessage={() => game.setTutorMessage(null)}
            t={t}
          />
        </View>
      </View>
      <NumberPad
        onNumberPress={game.handleNumberPress}
        completedNumbers={game.completedNumbers}
        isDarkMode={game.isDarkMode}
        isPaused={game.isPaused}
      />
      <GameControls
        isDarkMode={game.isDarkMode}
        isNoteMode={game.isNoteMode}
        onToggleNoteMode={game.toggleNoteMode}
        onHintPress={game.handleHintPress}
        onClearPress={game.handleClearPress}
        onUndoPress={game.handleUndo}
        isPaused={game.isPaused}
        canUndo={game.history.length > 0}
        canClear={
          !!game.selectedCell &&
          game.initialBoard[game.selectedCell.row][game.selectedCell.col] ===
            null &&
          (game.board[game.selectedCell.row][game.selectedCell.col] !== null ||
            (game.notes[game.selectedCell.row] &&
              game.notes[game.selectedCell.row][game.selectedCell.col] &&
              game.notes[game.selectedCell.row][game.selectedCell.col].length >
                0))
        }
      />
    </View>
  );
};
