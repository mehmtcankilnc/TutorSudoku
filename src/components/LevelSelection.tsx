import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface LevelSelectionProps {
  onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  isDarkMode: boolean;
  gamesWon: { easy: number; medium: number; hard: number };
}

export const LevelSelection: React.FC<LevelSelectionProps> = ({
  onSelectDifficulty,
  isDarkMode,
  gamesWon,
}) => {
  // Unlock Thresholds
  const MEDIUM_UNLOCK_REQ = 3; // Wins on Easy needed
  const HARD_UNLOCK_REQ = 3; // Wins on Medium needed

  const isMediumLocked = gamesWon.easy < MEDIUM_UNLOCK_REQ;
  const isHardLocked = gamesWon.medium < HARD_UNLOCK_REQ;

  const renderOption = (
    difficulty: 'easy' | 'medium' | 'hard',
    title: string,
    subtitle: string,
    icon: string,
    color: string,
    locked: boolean,
    progressText?: string,
  ) => (
    <TouchableOpacity
      onPress={() => !locked && onSelectDifficulty(difficulty)}
      activeOpacity={locked ? 1 : 0.7}
      className={`w-full p-5 mb-4 rounded-2xl border-2 flex-row items-center justify-between ${
        locked
          ? isDarkMode
            ? 'bg-gray-800 border-gray-700 opacity-60'
            : 'bg-gray-100 border-gray-200 opacity-60'
          : isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-blue-100 shadow-sm'
      }`}
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`p-3 rounded-full mr-4 ${locked ? 'bg-gray-500' : ''}`}
          style={{ backgroundColor: locked ? undefined : `${color}20` }}
        >
          <MaterialCommunityIcons
            name={locked ? 'lock' : icon}
            size={28}
            color={locked ? (isDarkMode ? '#9CA3AF' : '#6B7280') : color}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`font-bold text-xl mb-1 ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}
          >
            {title}
          </Text>
          <Text
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-slate-500'
            }`}
          >
            {subtitle}
          </Text>
          {locked && progressText && (
            <Text className="text-xs font-bold text-orange-500 mt-2">
              {progressText}
            </Text>
          )}
        </View>
      </View>
      {!locked && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={isDarkMode ? '#4B5563' : '#CBD5E1'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="w-full px-4 pt-4">
      <Text
        className={`text-center text-lg font-medium mb-8 ${
          isDarkMode ? 'text-gray-300' : 'text-slate-600'
        }`}
      >
        Select your challenge
      </Text>

      {renderOption(
        'easy',
        'Easy',
        'Perfect for warming up',
        'feather',
        '#10B981', // green-500
        false,
      )}

      {renderOption(
        'medium',
        'Medium',
        'A bit more thinking required',
        'shield-outline',
        '#F59E0B', // amber-500
        isMediumLocked,
        `Win ${MEDIUM_UNLOCK_REQ - gamesWon.easy} more Easy games to unlock`,
      )}

      {renderOption(
        'hard',
        'Hard',
        'For the true puzzle masters',
        'fire',
        '#EF4444', // red-500
        isHardLocked,
        `Win ${HARD_UNLOCK_REQ - gamesWon.medium} more Medium games to unlock`,
      )}

      <View className="mt-8 flex-row justify-center items-center">
        <MaterialCommunityIcons
          name="trophy-outline"
          size={20}
          color={isDarkMode ? '#6B7280' : '#94A3B8'}
        />
        <Text
          className={`ml-2 text-sm ${
            isDarkMode ? 'text-gray-500' : 'text-slate-400'
          }`}
        >
          Total Wins: {gamesWon.easy + gamesWon.medium + gamesWon.hard}
        </Text>
      </View>
    </View>
  );
};
