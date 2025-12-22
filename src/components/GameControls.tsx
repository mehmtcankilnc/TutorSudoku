/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { t } from 'i18next';

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
}) => {
  const isUndoDisabled = canUndo === false;
  return (
    <View
      className="flex-row"
      style={{ gap: wp(8), marginTop: wp(1), opacity: isPaused ? 0.3 : 1 }}
      pointerEvents={isPaused ? 'none' : 'auto'}
    >
      <TouchableOpacity
        onPress={onUndoPress}
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
        className="items-center justify-center rounded-full active:opacity-60"
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
        className={`items-center justify-center rounded-full active:opacity-60 relative
             ${
               isNoteMode
                 ? isDarkMode
                   ? 'bg-blue-900 border border-blue-500'
                   : 'bg-blue-100 border border-blue-500'
                 : 'bg-transparent border border-transparent'
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
          pointerEvents="none"
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
        <Text
          className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          style={{ fontSize: wp(3) }}
        >
          {t('notes')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={isHintActive ? undefined : onHintPress}
        activeOpacity={isHintActive ? 1 : 0.6}
        className={`items-center justify-center rounded-full ${
          isHintActive
            ? 'opacity-50 bg-gray-200 dark:bg-gray-700'
            : 'active:opacity-60'
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
