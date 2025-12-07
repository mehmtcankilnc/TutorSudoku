import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

interface WelcomeStepProps {
  isDarkMode: boolean;
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({
  isDarkMode,
  onNext,
}) => {
  const { t } = useTranslation();
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ padding: wp('6%') }}
    >
      <View
        className={`rounded-3xl items-center justify-center mb-8 ${
          isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
        }`}
        style={{ width: wp('30%'), height: wp('30%') }}
      >
        <MaterialCommunityIcons
          name="book-education-outline"
          size={wp('15%')}
          color={isDarkMode ? '#60A5FA' : '#3B82F6'}
        />
      </View>
      <Text
        className={`text-4xl font-extrabold text-center mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {t('welcomeTitle')}
      </Text>
      <Text
        className={`text-lg text-center mb-8 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {t('welcomeDesc')}
      </Text>
      <TouchableOpacity
        onPress={onNext}
        className="bg-blue-600 w-full py-4 rounded-xl items-center shadow-lg shadow-blue-500/30"
      >
        <Text className="text-white font-bold text-lg">{t('getStarted')}</Text>
      </TouchableOpacity>
    </View>
  );
};
