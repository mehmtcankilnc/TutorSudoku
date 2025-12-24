/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { t } from 'i18next';
import { playSound } from '../utils/SoundManager';

interface GameControlsProps {
  isDarkMode: boolean;
  isNoteMode: boolean;
  onToggleNoteMode: () => void;
  onHintPress: () => void;
  onClearPress: () => void;
  onUndoPress: () => void;
  isHintActive?: boolean;
  isPaused: boolean;
  canUndo?: boolean;
  canClear?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  isDarkMode,
  isNoteMode,
  onToggleNoteMode,
  onHintPress,
  onClearPress,
  onUndoPress,
  isHintActive,
  isPaused,
  canUndo = true,
  canClear = false,
}) => {
  const isUndoDisabled = canUndo === false;
  const isClearDisabled = canClear === false;

  return (
    <View
      className="flex-row"
      style={{ gap: wp(8), marginTop: wp(1), opacity: isPaused ? 0.3 : 1 }}
      pointerEvents={isPaused ? 'none' : 'auto'}
    >
      <TouchableOpacity
        onPress={onUndoPress}
        onPressIn={() => playSound('click')}
        disabled={isUndoDisabled}
        className={`items-center justify-center rounded-full ${
          isUndoDisabled ? 'opacity-30' : 'active:opacity-60'
        }`}
        style={{ padding: wp(3) }}
      >
        <MaterialCommunityIcons
          name="undo-variant"
          size={wp(8)}
          color={isDarkMode ? '#9CA3AF' : '#4B5563'}
        />
        <Text
          className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          style={{ fontSize: wp(3) }}
        >
          {t('undo')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onClearPress}
        onPressIn={() => {
          if (!isClearDisabled) playSound('delete');
        }}
        disabled={isClearDisabled}
        className={`items-center justify-center rounded-full ${
          isClearDisabled ? 'opacity-30' : 'active:opacity-60'
        }`}
        style={{ padding: wp(3) }}
      >
        <MaterialCommunityIcons
          name="backspace-outline"
          size={wp(8)}
          color={isDarkMode ? '#F87171' : '#EF4444'}
        />
        <Text
          className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          style={{ fontSize: wp(3) }}
        >
          {t('clear')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onToggleNoteMode}
        onPressIn={() => playSound('click')}
        className={`items-center justify-center rounded-full active:opacity-60 relative bg-transparent border border-transparent`}
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
          pointerEvents="none"
          className={`absolute -top-1 -right-2 w-6 h-6 rounded-full items-center justify-center
               ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}
           `}
        >
          <Text className="text-white font-bold" style={{ fontSize: 9 }}>
            {isNoteMode ? 'ON' : 'OFF'}
          </Text>
        </View>
        <Text
          className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          style={{ fontSize: wp(3) }}
        >
          {t('notes')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (!isHintActive) {
            onHintPress();
          }
        }}
        onPressIn={() => {
          if (!isHintActive) playSound('hint');
        }}
        activeOpacity={isHintActive ? 1 : 0.6}
        className={`items-center justify-center rounded-full ${
          isHintActive ? 'opacity-50' : 'active:opacity-60'
        }`}
        style={{ padding: wp(3) }}
        disabled={isHintActive}
      >
        <MaterialCommunityIcons
          name="lightbulb-on-outline"
          size={wp(8)}
          color={isDarkMode ? '#FCD34D' : '#EAB308'}
        />
        <Text
          className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          style={{ fontSize: wp(3) }}
        >
          {t('hint')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
