import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setOnboardingComplete, UserState } from '../store/userSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StepIndicator = ({
  currentStep,
  totalSteps,
  isDarkMode,
}: {
  currentStep: number;
  totalSteps: number;
  isDarkMode: boolean;
}) => (
  <View className="flex-row justify-center gap-2 mb-8 mt-4">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <View
        key={index}
        className={`h-2 rounded-full ${
          index === currentStep
            ? `w-8 ${isDarkMode ? 'bg-blue-400' : 'bg-blue-600'}`
            : `w-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`
        }`}
      />
    ))}
  </View>
);

export const OnboardingScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const [step, setStep] = useState(0);
  const [skillLevel, setSkillLevel] = useState<UserState['skillLevel']>(null);
  const [frequency, setFrequency] = useState<string | null>(null);

  const skillLevels: {
    id: UserState['skillLevel'];
    label: string;
    icon: string;
    desc: string;
  }[] = [
    {
      id: 'beginner',
      label: 'Beginner',
      icon: 'sprout',
      desc: 'New to Sudoku, learning rules',
    },
    {
      id: 'intermediate',
      label: 'Intermediate',
      icon: 'shield-check',
      desc: 'Can solve easy puzzles comfortably',
    },
    {
      id: 'expert',
      label: 'Expert',
      icon: 'brain',
      desc: 'Knows advanced techniques',
    },
    {
      id: 'master',
      label: 'Master',
      icon: 'crown',
      desc: 'Solves hardest puzzles in minutes',
    },
  ];

  const freqOptions = ['Every day', '3-4 days a week', 'Once a week', 'Rarely'];

  const handleNext = async () => {
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
    else if (step === 2) {
      const finalSkill = skillLevel || 'beginner';
      const finalFreq = frequency || 'Once a week';

      try {
        await AsyncStorage.setItem(
          'user_onboarding',
          JSON.stringify({
            isOnboarded: true,
            skillLevel: finalSkill,
            playFrequency: finalFreq,
          }),
        );
      } catch (e) {
        console.error('Failed to save onboarding', e);
      }

      dispatch(
        setOnboardingComplete({
          skillLevel: finalSkill,
          playFrequency: finalFreq,
        }),
      );
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const renderContent = () => {
    switch (step) {
      case 0: // Welcome
        return (
          <View className="flex-1 items-center justify-center p-6">
            <View
              className={`w-32 h-32 rounded-3xl items-center justify-center mb-8 ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}
            >
              <MaterialCommunityIcons
                name="book-education-outline"
                size={64}
                color={isDarkMode ? '#60A5FA' : '#3B82F6'}
              />
            </View>
            <Text
              className={`text-4xl font-extrabold text-center mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Welcome to{'\n'}TutorSudoku
            </Text>
            <Text
              className={`text-lg text-center mb-8 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Your personal AI companion for mastering the art of logic.
            </Text>
            <TouchableOpacity
              onPress={handleNext}
              className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-lg shadow-blue-500/30"
            >
              <Text className="text-white font-bold text-lg">Get Started</Text>
            </TouchableOpacity>
          </View>
        );
      case 1: // Skill
        return (
          <View className="flex-1 p-6">
            <Text
              className={`text-3xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Your Experience
            </Text>
            <Text
              className={`text-base mb-8 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Help us tailor the difficulty for you.
            </Text>
            <View>
              {skillLevels.map(opt => {
                const isSelected = skillLevel === opt.id;

                const borderColor = isSelected
                  ? '#3B82F6'
                  : isDarkMode
                  ? '#374151'
                  : '#E5E7EB';

                const backgroundColor = isSelected
                  ? isDarkMode
                    ? 'rgba(30, 58, 138, 0.5)'
                    : '#EFF6FF'
                  : isDarkMode
                  ? '#1F2937'
                  : '#FFFFFF';

                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setSkillLevel(opt.id)}
                    activeOpacity={0.7}
                    className="flex-row items-center p-4 rounded-xl border-2 mb-3"
                    style={{
                      borderColor,
                      backgroundColor,
                    }}
                  >
                    <View
                      className={`p-2 rounded-full mr-4 ${
                        isSelected
                          ? 'bg-blue-500'
                          : isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                      }`}
                    >
                      <MaterialCommunityIcons
                        name={opt.icon}
                        size={24}
                        color={
                          isSelected
                            ? 'white'
                            : isDarkMode
                            ? '#9CA3AF'
                            : '#6B7280'
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`font-bold text-lg ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {opt.label}
                      </Text>
                      <Text
                        className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}
                      >
                        {opt.desc}
                      </Text>
                    </View>
                    <View style={{ opacity: isSelected ? 1 : 0 }}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={24}
                        color="#3B82F6"
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      case 2: // Frequency
        return (
          <View className="flex-1 p-6">
            <Text
              className={`text-3xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Your Goal
            </Text>
            <Text
              className={`text-base mb-8 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              How often do you plan to train your brain?
            </Text>

            <View>
              {freqOptions.map(opt => {
                const isSelected = frequency === opt;

                const bgClass = isSelected
                  ? isDarkMode
                    ? 'bg-blue-900/50'
                    : 'bg-blue-50'
                  : isDarkMode
                  ? 'bg-gray-800'
                  : 'bg-white';

                const borderClass = isSelected
                  ? 'border-blue-500'
                  : isDarkMode
                  ? 'border-gray-700'
                  : 'border-gray-200';

                return (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setFrequency(opt)}
                    activeOpacity={0.7}
                    className={`p-4 rounded-xl border-2 mb-3 ${bgClass} ${borderClass}`}
                  >
                    <Text
                      className={`font-bold text-lg text-center ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <View className="flex-1">{renderContent()}</View>
      {/* Footer Navigation */}
      {step > 0 && (
        <View className="p-6">
          <StepIndicator
            currentStep={step}
            totalSteps={3}
            isDarkMode={isDarkMode}
          />
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={handleBack}
              className={`flex-1 py-4 rounded-xl items-center border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}
            >
              <Text
                className={`font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}
              >
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={
                (step === 1 && skillLevel === null) ||
                (step === 2 && frequency === null)
              }
              onPress={handleNext}
              className={`flex-1 py-4 rounded-xl items-center bg-blue-600 shadow-lg shadow-blue-500/30 ${
                (step === 1 && skillLevel === null) ||
                (step === 2 && frequency === null)
                  ? 'opacity-50'
                  : 'opacity-100'
              }`}
            >
              <Text className={`font-bold text-white`}>
                {step === 2 ? 'Complete' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
