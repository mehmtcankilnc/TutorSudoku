import React from 'react';
import { View } from 'react-native';
import { Cell } from './Cell';
import { TutorBubble } from './TutorBubble';
import { isValidMove } from '../utils/SudokuLogic';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface SudokuGridProps {
  board: (number | null)[][];
  initialBoard: (number | null)[][];
  notes: number[][][];
  selectedCell: { row: number; col: number } | null;
  highlightedCell: { row: number; col: number } | null;
  shakingCell: { row: number; col: number } | null;
  lastMovedCell: { row: number; col: number } | null;
  tutorMessage: {
    row: number;
    col: number;
    text: { key: string; params?: any };
  } | null;
  conflictingCell: { row: number; col: number } | null;
  completedUnits: { type: string; index: number }[];
  isDarkMode: boolean;
  onCellPress: (row: number, col: number) => void;
  onDismissTutorMessage: () => void;
  t: (key: string, params?: any) => string;
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({
  board,
  initialBoard,
  notes,
  selectedCell,
  highlightedCell,
  shakingCell,
  lastMovedCell,
  tutorMessage,
  conflictingCell,
  completedUnits,
  isDarkMode,
  onCellPress,
  onDismissTutorMessage,
  t,
}) => {
  const totalBoardWidth = wp('90%');
  const cellSize = Math.floor(totalBoardWidth / 9);

  return (
    <View
      className={`border-4 shadow-2xl elevation-10 z-10 ${
        isDarkMode ? 'border-gray-400 bg-gray-900' : 'border-gray-800 bg-white'
      }`}
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
                      isDarkMode ? 'border-r-gray-400' : 'border-r-gray-900'
                    }`
                  : '';
              const borderBottom =
                (rowIndex + 1) % 3 === 0 && rowIndex !== 8
                  ? `border-b-2 ${
                      isDarkMode ? 'border-b-gray-400' : 'border-b-gray-900'
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
                shakingCell?.row === rowIndex && shakingCell?.col === colIndex;
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
                    onPress={() => onCellPress(rowIndex, colIndex)}
                    isSelected={isSelected}
                    isRelated={isRelated}
                    isSameValue={
                      !!cellValue &&
                      !!selectedCell &&
                      cellValue === board[selectedCell.row][selectedCell.col] &&
                      !isSelected
                    }
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
                    showRightBorder={(colIndex + 1) % 3 !== 0}
                    showBottomBorder={(rowIndex + 1) % 3 !== 0}
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
                      onDismiss={onDismissTutorMessage}
                      position={rowIndex < 4 ? 'below' : 'above'}
                      align={colIndex < 4 ? 'left' : 'right'}
                      isDarkMode={isDarkMode}
                    />
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};
