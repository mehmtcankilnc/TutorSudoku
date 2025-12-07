/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setOnboardingComplete, UserState } from '../store/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  StepIndicator,
  WelcomeStep,
  FeatureStep,
  SkillLevelStep,
  FrequencyStep,
} from '../components/Onboarding';
import { useTranslation } from 'react-i18next';

export const OnboardingScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const [step, setStep] = useState(0);
  const [skillLevel, setSkillLevel] = useState<UserState['skillLevel']>(null);
  const [frequency, setFrequency] = useState<string | null>(null);

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
        return <WelcomeStep isDarkMode={isDarkMode} onNext={handleNext} />;
      case 1: // Feature: Scan
        return (
          <FeatureStep
            isDarkMode={isDarkMode}
            imageSource={require('../assets/scan_feature.jpeg')}
            title={t('scanTitle')}
            description={t('scanDesc')}
          />
        );
      case 2: // Feature: Learn
        return (
          <FeatureStep
            isDarkMode={isDarkMode}
            imageSource={require('../assets/tutorial_feature.jpeg')}
            title={t('learnTitle')}
            description={t('learnDesc')}
          />
        );
      case 3: // Feature: Hints
        return (
          <FeatureStep
            isDarkMode={isDarkMode}
            imageSource={require('../assets/hint_feature.jpeg')}
            title={t('hintsTitle')}
            description={t('hintsDesc')}
          />
        );
      case 4: // Skill
        return (
          <SkillLevelStep
            isDarkMode={isDarkMode}
            selectedSkillLevel={skillLevel}
            onSelectSkill={setSkillLevel}
          />
        );
      case 5: // Frequency
        return (
          <FrequencyStep
            isDarkMode={isDarkMode}
            selectedFrequency={frequency}
            onSelectFrequency={setFrequency}
          />
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
            {t('skip')}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {renderContent()}
      </ScrollView>
      {/* Footer Navigation */}
      {step > 0 && (
        <View style={{ padding: wp(6) }}>
          <StepIndicator
            currentStep={step}
            totalSteps={6}
            isDarkMode={isDarkMode}
          />
          <View className="flex-row" style={{ gap: wp(4) }}>
            <TouchableOpacity
              onPress={handleBack}
              className={`flex-1 items-center border ${
                isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}
              style={{ paddingVertical: wp(4), borderRadius: wp(4) }}
            >
              <Text
                className={`font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-700'
                }`}
              >
                {t('back')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={
                (step === 4 && skillLevel === null) ||
                (step === 5 && frequency === null)
              }
              onPress={handleNext}
              className={`flex-1 items-center bg-blue-600 shadow-lg shadow-blue-500/30 ${
                (step === 4 && skillLevel === null) ||
                (step === 5 && frequency === null)
                  ? 'opacity-50'
                  : 'opacity-100'
              }`}
              style={{ paddingVertical: wp(4), borderRadius: wp(4) }}
            >
              <Text className={`font-bold text-white`}>
                {step === 5 ? t('complete') : t('next')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
