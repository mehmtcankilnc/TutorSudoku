/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface VerificationViewProps {
  initialBoard: (number | null)[][];
  onConfirm: (finalBoard: (number | null)[][]) => void;
  onCancel: () => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  initialBoard,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const totalBoardWidth = wp('85%');
  const cellSize = Math.floor(totalBoardWidth / 9);

  const [board, setBoard] = useState<(number | null)[][]>(initialBoard);
  const [selectedCell, setSelectedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const handleCellPress = (row: number, col: number) => {
    if (selectedCell?.row === row && selectedCell?.col === col) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberPress = (num: number | null) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View
        className="flex-row items-center justify-center z-10"
        style={{ padding: wp(4) }}
      >
        <TouchableOpacity
          onPress={onCancel}
          style={{ position: 'absolute', left: wp(5) }}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={wp(6)}
            color={isDarkMode ? 'white' : 'black'}
          />
        </TouchableOpacity>
        <Text
          className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          style={{ fontSize: wp(5) }}
        >
          {t('verifyPuzzle')}
        </Text>
      </View>
      <ScrollView
        contentContainerStyle={{
          alignItems: 'center',
          paddingVertical: wp(4),
          gap: wp(6),
        }}
      >
        <Text
          className={`text-center ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}
          style={{ paddingHorizontal: wp(4) }}
        >
          {t('verifyPuzzleDesc')}
        </Text>
        <View
          className={`border-4 shadow-xl ${
            isDarkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-800 bg-white'
          }`}
          style={{ width: cellSize * 9 + 8 }} // +8 for borders (approx 4px each side)
        >
          {board.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row">
              {row.map((cellValue, colIndex) => {
                const isSelected =
                  selectedCell?.row === rowIndex &&
                  selectedCell?.col === colIndex;

                // Borders for 3x3 grids (thicker borders)
                const borderRight =
                  (colIndex + 1) % 3 === 0 && colIndex !== 8
                    ? `border-r-2 ${
                        isDarkMode ? 'border-r-gray-500' : 'border-r-gray-800'
                      }`
                    : `border-r ${
                        isDarkMode ? 'border-r-gray-700' : 'border-r-gray-200'
                      }`;
                const borderBottom =
                  (rowIndex + 1) % 3 === 0 && rowIndex !== 8
                    ? `border-b-2 ${
                        isDarkMode ? 'border-b-gray-500' : 'border-b-gray-800'
                      }`
                    : `border-b ${
                        isDarkMode ? 'border-b-gray-700' : 'border-b-gray-200'
                      }`;

                return (
                  <TouchableOpacity
                    key={`${rowIndex}-${colIndex}`}
                    onPress={() => handleCellPress(rowIndex, colIndex)}
                    activeOpacity={0.7}
                    style={{ width: cellSize, height: cellSize }}
                    className={`items-center justify-center ${borderRight} ${borderBottom} 
                                        ${
                                          isSelected
                                            ? 'bg-blue-500'
                                            : isDarkMode
                                            ? 'bg-gray-800'
                                            : 'bg-white'
                                        }
                                    `}
                  >
                    {cellValue !== null && (
                      <Text
                        className={`text-2xl font-semibold 
                                            ${
                                              isSelected
                                                ? 'text-white'
                                                : isDarkMode
                                                ? 'text-gray-200'
                                                : 'text-gray-900'
                                            }
                                        `}
                      >
                        {cellValue}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Number Pad for Editing */}
        <View
          className="flex-row flex-wrap justify-center w-full"
          style={{ gap: wp(4), paddingHorizontal: wp(4) }}
        >
          {[1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity
              key={num}
              onPress={() => handleNumberPress(num)}
              disabled={!selectedCell}
              className={`rounded-full items-center justify-center shadow-md
                            ${
                              !selectedCell
                                ? 'bg-gray-300 opacity-50'
                                : isDarkMode
                                ? 'bg-gray-700 active:bg-blue-600'
                                : 'bg-white active:bg-blue-100'
                            }
                        `}
              style={{ width: wp(12), height: wp(12) }}
            >
              <Text
                className={`font-bold ${
                  isDarkMode ? 'text-white' : 'text-blue-600'
                }`}
                style={{ fontSize: wp(6) }}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Second Row */}
          {[6, 7, 8, 9].map(num => (
            <TouchableOpacity
              key={num}
              onPress={() => handleNumberPress(num)}
              disabled={!selectedCell}
              className={`rounded-full items-center justify-center shadow-md
                            ${
                              !selectedCell
                                ? 'bg-gray-300 opacity-50'
                                : isDarkMode
                                ? 'bg-gray-700 active:bg-blue-600'
                                : 'bg-white active:bg-blue-100'
                            }
                        `}
              style={{ width: wp(12), height: wp(12) }}
            >
              <Text
                className={`font-bold ${
                  isDarkMode ? 'text-white' : 'text-blue-600'
                }`}
                style={{ fontSize: wp(6) }}
              >
                {num}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => handleNumberPress(null)}
            disabled={!selectedCell}
            className={`rounded-full items-center justify-center shadow-md
                         ${
                           !selectedCell
                             ? 'bg-gray-300 opacity-50'
                             : 'bg-red-100 active:bg-red-200'
                         }
                    `}
            style={{ width: wp(12), height: wp(12) }}
          >
            <MaterialCommunityIcons
              name="backspace-outline"
              size={wp(6)}
              color="#EF4444"
            />
          </TouchableOpacity>
        </View>
        <View className="w-full" style={{ paddingHorizontal: wp(4) }}>
          <TouchableOpacity
            onPress={() => onConfirm(board)}
            className="w-full bg-blue-600 items-center shadow-lg active:bg-blue-700"
            style={{ paddingVertical: wp(4), borderRadius: wp(3) }}
          >
            <Text className="text-white font-bold" style={{ fontSize: wp(5) }}>
              {t('loadPuzzle')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
