import React from 'react';
import { View, Animated } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export const StepIndicator = ({
  currentStep,
  totalSteps,
  isDarkMode,
}: {
  currentStep: number;
  totalSteps: number;
  isDarkMode: boolean;
}) => (
  <View
    className="flex-row justify-center"
    style={{
      gap: wp('2%'),
      marginBottom: hp('4%'),
      marginTop: hp('2%'),
    }}
  >
    {Array.from({ length: totalSteps }).map((_, index) => (
      <AnimatedStepDot
        key={index}
        isActive={index === currentStep}
        isDarkMode={isDarkMode}
      />
    ))}
  </View>
);
