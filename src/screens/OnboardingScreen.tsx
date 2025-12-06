import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setOnboardingComplete, UserState } from '../store/userSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AnimatedStepDot = ({
  isActive,
  isDarkMode,
}: {
  isActive: boolean;
  isDarkMode: boolean;
}) => {
  const anim = React.useRef(new Animated.Value(isActive ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(anim, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 40,
    }).start();
  }, [isActive]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 32],
  });

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDarkMode ? '#374151' : '#D1D5DB', // gray-700 : gray-300
      isDarkMode ? '#60A5FA' : '#2563EB', // blue-400 : blue-600
    ],
  });

  return (
    <Animated.View
      style={{
        height: 8,
        borderRadius: 4,
        width,
        backgroundColor,
      }}
    />
  );
};

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
      <AnimatedStepDot
        key={index}
        isActive={index === currentStep}
        isDarkMode={isDarkMode}
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

  const completeOnboarding = async (
    skill: string = 'beginner',
    freq: string = 'Once a week',
  ) => {
    try {
      await AsyncStorage.setItem(
        'user_onboarding',
        JSON.stringify({
          isOnboarded: true,
          skillLevel: skill,
          playFrequency: freq,
        }),
      );
    } catch (e) {
      console.error('Failed to save onboarding', e);
    }

    dispatch(
      setOnboardingComplete({
        skillLevel: skill as UserState['skillLevel'],
        playFrequency: freq,
      }),
    );
  };

  const handleNext = async () => {
    if (step < 4) setStep(step + 1);
    else if (step === 4) setStep(5);
    else if (step === 5) {
      completeOnboarding(skillLevel || 'beginner', frequency || 'Once a week');
    }
  };

  const handleSkip = () => {
    completeOnboarding('beginner', 'Once a week');
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
      case 1: // Feature: Scan
        return (
          <View className="flex-1 p-6 items-center justify-center">
            {/* Feature Image Frame */}
            <Image
              source={require('../assets/scan_feature.jpeg')}
              className="w-80 h-80 mb-8"
              resizeMode="contain"
            />
            <Text
              className={`text-3xl font-extrabold text-center mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Scan & Solve
            </Text>
            <Text
              className={`text-lg text-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Instantly digitize your favorite paper puzzles just by taking a
              photo.
            </Text>
          </View>
        );
      case 2: // Feature: Learn
        return (
          <View className="flex-1 p-6 items-center justify-center">
            <Image
              source={require('../assets/tutorial_feature.jpeg')}
              className="w-80 h-80 mb-8 rounded-3xl"
              resizeMode="contain"
            />
            <Text
              className={`text-3xl font-extrabold text-center mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Interactive Tutorials
            </Text>
            <Text
              className={`text-lg text-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Master advanced techniques with step-by-step guided lessons.
            </Text>
          </View>
        );
      case 3: // Feature: Hints
        return (
          <View className="flex-1 p-6 items-center justify-center">
            <Image
              source={require('../assets/hint_feature.jpeg')}
              className="w-80 h-80 mb-8 rounded-3xl"
              resizeMode="contain"
            />
            <Text
              className={`text-3xl font-extrabold text-center mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Smart Hints
            </Text>
            <Text
              className={`text-lg text-center ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Don't just get the answer. Understand the logic behind every move.
            </Text>
          </View>
        );
      case 4: // Skill
        return (
          <View className="flex-1 p-6 pt-24">
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
      case 5: // Frequency
        return (
          <View className="flex-1 p-6 pt-24">
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
      <View className="absolute top-12 right-6 z-50">
        <TouchableOpacity
          onPress={handleSkip}
          className={`px-5 py-2.5 rounded-full ${
            isDarkMode
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-white border border-gray-200'
          } shadow-md elevation-5`}
        >
          <Text
            className={`font-bold text-sm ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {renderContent()}
      </ScrollView>
      {/* Footer Navigation */}
      {step > 0 && (
        <View className="p-6">
          <StepIndicator
            currentStep={step}
            totalSteps={6}
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
                (step === 4 && skillLevel === null) ||
                (step === 5 && frequency === null)
              }
              onPress={handleNext}
              className={`flex-1 py-4 rounded-xl items-center bg-blue-600 shadow-lg shadow-blue-500/30 ${
                (step === 4 && skillLevel === null) ||
                (step === 5 && frequency === null)
                  ? 'opacity-50'
                  : 'opacity-100'
              }`}
            >
              <Text className={`font-bold text-white`}>
                {step === 5 ? 'Complete' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
