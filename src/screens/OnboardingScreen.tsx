/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
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
  const flatListRef = useRef<FlatList>(null);

  const [step, setStep] = useState(0);
  const [skillLevel, setSkillLevel] = useState<UserState['skillLevel']>(null);
  const [frequency, setFrequency] = useState<string | null>(null);

  const steps = useMemo(
    () => [
      { type: 'welcome' },
      {
        type: 'feature',
        image: require('../assets/scan_feature.jpeg'),
        title: t('scanTitle'),
        description: t('scanDesc'),
      },
      {
        type: 'feature',
        image: require('../assets/tutorial_feature.jpeg'),
        title: t('learnTitle'),
        description: t('learnDesc'),
      },
      {
        type: 'feature',
        image: require('../assets/hint_feature.jpeg'),
        title: t('hintsTitle'),
        description: t('hintsDesc'),
      },
      { type: 'skill' },
      { type: 'frequency' },
    ],
    [t],
  );

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

  const scrollToStep = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setStep(index);
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      scrollToStep(step + 1);
    } else {
      completeOnboarding(skillLevel || 'beginner', frequency || 'Once a week');
    }
  };

  const handleSkip = () => {
    completeOnboarding('beginner', 'Once a week');
  };

  const handleBack = () => {
    if (step > 0) {
      scrollToStep(step - 1);
    }
  };

  // Update step when user swipes
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setStep(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const visibleSteps = useMemo(() => {
    if (skillLevel === null) {
      return steps.slice(0, 5);
    }
    return steps;
  }, [steps, skillLevel]);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={{ width: wp(100), flex: 1 }}>
        {item.type === 'welcome' && (
          <WelcomeStep isDarkMode={isDarkMode} onNext={() => scrollToStep(1)} />
        )}
        {item.type === 'feature' && (
          <FeatureStep
            isDarkMode={isDarkMode}
            imageSource={item.image}
            title={item.title}
            description={item.description}
          />
        )}
        {item.type === 'skill' && (
          <SkillLevelStep
            isDarkMode={isDarkMode}
            selectedSkillLevel={skillLevel}
            onSelectSkill={setSkillLevel}
          />
        )}
        {item.type === 'frequency' && (
          <FrequencyStep
            isDarkMode={isDarkMode}
            selectedFrequency={frequency}
            onSelectFrequency={setFrequency}
          />
        )}
      </View>
    );
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
      <View className="absolute top-6 right-6 z-50">
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

      <FlatList
        ref={flatListRef}
        data={visibleSteps}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={3}
      />

      {/* Footer Navigation */}
      {step > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: wp(8), // Just a little bit up from bottom
            left: 0,
            right: 0,
            paddingHorizontal: wp(6),
          }}
        >
          <StepIndicator
            currentStep={step}
            totalSteps={steps.length}
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
                (step === steps.findIndex(s => s.type === 'skill') &&
                  skillLevel === null) ||
                (step === steps.findIndex(s => s.type === 'frequency') &&
                  frequency === null)
              }
              onPress={handleNext}
              className={`flex-1 items-center bg-blue-600 shadow-lg shadow-blue-500/30 ${
                (step === steps.findIndex(s => s.type === 'skill') &&
                  skillLevel === null) ||
                (step === steps.findIndex(s => s.type === 'frequency') &&
                  frequency === null)
                  ? 'opacity-50'
                  : 'opacity-100'
              }`}
              style={{ paddingVertical: wp(4), borderRadius: wp(4) }}
            >
              <Text className={`font-bold text-white`}>
                {step === steps.length - 1 ? t('complete') : t('next')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
