/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Cell } from './Cell';
import { TutorialScenario } from '../data/TutorialData';
import { playSound } from '../utils/SoundManager';

interface InteractiveLessonProps {
  lesson: TutorialScenario;
  onClose: () => void;
  onComplete: () => void;
  isDarkMode: boolean;
}

const ProgressSegment: React.FC<{
  filled: boolean;
  isDarkMode: boolean;
}> = ({ filled, isDarkMode }) => {
  const widthAnim = React.useRef(new Animated.Value(filled ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: filled ? 1 : 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [filled]);

  return (
    <View
      className={`rounded-full flex-1 overflow-hidden ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
      }`}
      style={{ height: wp(2) }}
    >
      <Animated.View
        style={{
          width: widthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }}
        className="h-full bg-blue-500"
      />
    </View>
  );
};

export const InteractiveLesson: React.FC<InteractiveLessonProps> = ({
  lesson,
  onClose,
  onComplete,
  isDarkMode,
}) => {
  const { t } = useTranslation();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const totalWidth = wp('95%');
  const cellSize = Math.floor((totalWidth - 16) / 9);

  const currentStep = lesson.steps[currentStepIndex];
  const isLastStep = currentStepIndex === lesson.steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
      {/* Header */}
      <View
        className="flex-row items-center justify-center border-b border-gray-200 dark:border-gray-700"
        style={{ padding: wp(4) }}
      >
        <TouchableOpacity
          onPress={onClose}
          onPressIn={() => playSound('click')}
          style={{ position: 'absolute', left: wp(5) }}
        >
          <MaterialCommunityIcons
            name="close"
            size={wp(6)}
            color={isDarkMode ? '#9CA3AF' : '#6B7280'}
          />
        </TouchableOpacity>
        <Text
          className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          style={{ fontSize: wp(5) }}
        >
          {t(lesson.title)}
        </Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: 'center', paddingVertical: wp(4) }}
      >
        {/* The Board */}
        <View
          style={{
            width: cellSize * 9 + 8,
            height: cellSize * 9 + 8,
            marginBottom: wp(4),
          }}
          className={`border-2 ${
            isDarkMode ? 'border-gray-600' : 'border-black'
          }`}
        >
          {currentStep.board.map((row, r) => (
            <View key={r} className="flex-row">
              {row.map((val, c) => {
                const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 2 : 0;
                const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 2 : 0;
                const isHighlighted = currentStep.highlightCells?.some(
                  h => h.r === r && h.c === c,
                );
                const isFocused =
                  currentStep.focusCell?.r === r &&
                  currentStep.focusCell?.c === c;

                const cellCandidates = currentStep.candidates
                  ? currentStep.candidates[r][c]
                  : undefined;

                return (
                  <View
                    key={`${r}-${c}`}
                    style={{
                      borderRightWidth: borderRight,
                      borderBottomWidth: borderBottom,
                      borderColor: isDarkMode ? '#4B5563' : '#000000',
                    }}
                    className="relative"
                  >
                    <Cell
                      value={val}
                      candidates={cellCandidates}
                      size={cellSize}
                      isDarkMode={isDarkMode}
                      isSelected={isFocused}
                      isEditable={false}
                    />
                    {isHighlighted && (
                      <View className="absolute inset-0 bg-yellow-400 opacity-30 pointer-events-none" />
                    )}
                    {isFocused && (
                      <View className="absolute inset-0 border-2 border-blue-500 z-10" />
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        {/* Instruction Bubble */}
        <View
          className={`border-l-4 ${
            isDarkMode
              ? 'bg-blue-900/20 border-blue-500'
              : 'bg-white border-blue-500'
          }`}
          style={{
            minHeight: wp(10),
            justifyContent: 'center',
            marginHorizontal: wp(4),
            marginBottom: wp(4),
            padding: wp(4),
            borderRadius: wp(3),
            width: wp(90),
          }}
        >
          <Text
            className={`text-center ${
              isDarkMode ? 'text-blue-100' : 'text-blue-900'
            }`}
            style={{ fontSize: wp(3.5) }}
          >
            {t(currentStep.message)}
          </Text>
        </View>
        {/* Progress Bar */}
        <View
          className="flex-row first-line:w-full justify-center"
          style={{ gap: wp(2), paddingHorizontal: wp(8) }}
        >
          {lesson.steps.map((_, idx) => (
            <ProgressSegment
              key={idx}
              filled={idx <= currentStepIndex}
              isDarkMode={isDarkMode}
            />
          ))}
        </View>
      </ScrollView>
      {/* Controls */}
      <View
        className={`border-t ${
          isDarkMode ? 'border-gray-800' : 'border-gray-100'
        }`}
        style={{ paddingHorizontal: wp(6), paddingVertical: wp(2) }}
      >
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={handlePrev}
            onPressIn={() => currentStepIndex > 0 && playSound('click')}
            disabled={currentStepIndex === 0}
            className={`rounded-full border ${
              currentStepIndex === 0
                ? 'opacity-0'
                : isDarkMode
                ? 'border-gray-600'
                : 'border-gray-300'
            }`}
            style={{ paddingHorizontal: wp(6), paddingVertical: wp(3) }}
          >
            <Text
              className={`font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              {t('back')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            onPressIn={() => playSound('click')}
            className="rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"
            style={{ paddingHorizontal: wp(6), paddingVertical: wp(3) }}
          >
            <Text className="text-white font-bold">
              {isLastStep ? t('finish') : t('next')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
