import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  // Unlock Thresholds
  const MEDIUM_UNLOCK_REQ = 3; // Wins on Easy needed
  const HARD_UNLOCK_REQ = 5; // Wins on Medium needed

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
      className={`w-full border-2 flex-row items-center justify-between ${
        locked
          ? isDarkMode
            ? 'bg-gray-800 border-gray-700 opacity-60'
            : 'bg-gray-100 border-gray-200 opacity-60'
          : isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-blue-100 shadow-sm'
      }`}
      style={{ padding: wp(5), borderRadius: wp(5) }}
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`rounded-full ${locked ? 'bg-gray-500' : ''}`}
          style={{
            backgroundColor: locked ? undefined : `${color}20`,
            padding: wp(2),
            marginRight: wp(3),
          }}
        >
          <MaterialCommunityIcons
            name={locked ? 'lock' : icon}
            size={wp(8)}
            color={locked ? (isDarkMode ? '#9CA3AF' : '#6B7280') : color}
          />
        </View>
        <View className="flex-1" style={{ gap: wp(1) }}>
          <Text
            className={`font-bold ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}
            style={{ fontSize: wp(5) }}
          >
            {title}
          </Text>
          <Text
            className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}
            style={{ fontSize: wp(3.5) }}
          >
            {subtitle}
          </Text>
          {locked && progressText && (
            <Text
              className="font-bold text-orange-500"
              style={{ fontSize: wp(2.5) }}
            >
              {progressText}
            </Text>
          )}
        </View>
      </View>
      {!locked && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={wp(6)}
          color={isDarkMode ? '#4B5563' : '#CBD5E1'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="w-full relative" style={{ padding: wp(4), gap: wp(5) }}>
      <Text
        className={`text-center font-medium ${
          isDarkMode ? 'text-gray-300' : 'text-slate-600'
        }`}
        style={{ fontSize: wp(4) }}
      >
        {t('selectDifficulty')}
      </Text>

      {renderOption(
        'easy',
        t('easy'),
        t('easyDesc'),
        'feather',
        '#10B981', // green-500
        false,
      )}

      {renderOption(
        'medium',
        t('medium'),
        t('mediumDesc'),
        'shield-outline',
        '#F59E0B', // amber-500
        isMediumLocked,
        `${t('lock')} ${MEDIUM_UNLOCK_REQ - gamesWon.easy}`,
      )}

      {renderOption(
        'hard',
        t('hard'),
        t('hardDesc'),
        'fire',
        '#EF4444', // red-500
        isHardLocked,
        `${t('lock')} ${HARD_UNLOCK_REQ - gamesWon.medium}`,
      )}

      <View className="flex-row justify-center items-center">
        <MaterialCommunityIcons
          name="trophy-outline"
          size={wp(6)}
          color={isDarkMode ? '#6B7280' : '#94A3B8'}
        />
        <Text
          className={`${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}
          style={{ fontSize: wp(3.5), marginLeft: wp(2) }}
        >
          {t('wins')} {gamesWon.easy + gamesWon.medium + gamesWon.hard}
        </Text>
      </View>
    </View>
  );
};
