import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Cell } from './Cell';
import { TutorialScenario } from '../data/TutorialData';

interface InteractiveLessonProps {
  lesson: TutorialScenario;
  onClose: () => void;
  onComplete: () => void;
  isDarkMode: boolean;
}

export const InteractiveLesson: React.FC<InteractiveLessonProps> = ({
  lesson,
  onClose,
  onComplete,
  isDarkMode,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { width } = useWindowDimensions();
  const boardPadding = 20;
  const cellSize = Math.floor((width - boardPadding * 2 - 16) / 9);

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
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={onClose} className="p-2">
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={isDarkMode ? '#9CA3AF' : '#6B7280'}
          />
        </TouchableOpacity>
        <Text
          className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {lesson.title}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ alignItems: 'center', paddingVertical: 20 }}
      >
        {/* The Board */}
        <View
          style={{ width: cellSize * 9 + 8, height: cellSize * 9 + 8 }}
          className={`border-2 mb-6 ${
            isDarkMode ? 'border-gray-600' : 'border-black'
          }`}
        >
          {currentStep.board.map((row, r) => (
            <View key={r} className="flex-row">
              {row.map((val, c) => {
                // Formatting
                const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 2 : 0;
                const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 2 : 0;
                const isHighlighted = currentStep.highlightCells?.some(
                  h => h.r === r && h.c === c,
                );
                const isFocused =
                  currentStep.focusCell?.r === r &&
                  currentStep.focusCell?.c === c;

                // Candidates
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
                      isEditable={false} // Tutorials are guided, user doesn't type
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
          className={`mx-4 mb-6 p-4 rounded-xl border-l-4 w-[90%] ${
            isDarkMode
              ? 'bg-blue-900/20 border-blue-500'
              : 'bg-blue-50 border-blue-500'
          }`}
          style={{ minHeight: 100, justifyContent: 'center' }}
        >
          <Text
            className={`text-base text-center ${
              isDarkMode ? 'text-blue-100' : 'text-blue-900'
            }`}
          >
            {currentStep.message}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="flex-row gap-2 mt-8 px-8 w-full justify-center">
          {lesson.steps.map((_, idx) => (
            <View
              key={idx}
              className={`h-2 rounded-full flex-1 ${
                idx <= currentStepIndex
                  ? 'bg-blue-500'
                  : isDarkMode
                  ? 'bg-gray-700'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </View>
      </ScrollView>

      {/* Controls */}
      <View
        className={`px-6 py-6 border-t ${
          isDarkMode ? 'border-gray-800' : 'border-gray-100'
        }`}
      >
        <View className="flex-row justify-between">
          <TouchableOpacity
            onPress={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-6 py-3 rounded-full border ${
              currentStepIndex === 0
                ? 'opacity-0'
                : isDarkMode
                ? 'border-gray-600'
                : 'border-gray-300'
            }`}
          >
            <Text
              className={`font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            className="px-8 py-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30"
          >
            <Text className="text-white font-bold">
              {isLastStep ? 'Finish' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
