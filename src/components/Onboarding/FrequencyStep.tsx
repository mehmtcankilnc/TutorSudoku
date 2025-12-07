import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface FrequencyStepProps {
  isDarkMode: boolean;
  selectedFrequency: string | null;
  onSelectFrequency: (freq: string) => void;
}

import { useTranslation } from 'react-i18next';

export const FrequencyStep: React.FC<FrequencyStepProps> = ({
  isDarkMode,
  selectedFrequency,
  onSelectFrequency,
}) => {
  const { t } = useTranslation();

  const freqOptions = useMemo(
    () => [
      t('freqEveryDay'),
      t('freq34Days'),
      t('freqOnceWeek'),
      t('freqRarely'),
    ],
    [t],
  );
  return (
    <View
      className="flex-1"
      style={{ padding: wp('6%'), paddingTop: hp('10%') }}
    >
      <Text
        className={`font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
        style={{ fontSize: wp(8) }}
      >
        {t('yourGoal')}
      </Text>
      <Text
        className={`text-base mb-8 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {t('goalDesc')}
      </Text>

      <View style={{ gap: wp(3) }}>
        {freqOptions.map(opt => {
          const isSelected = selectedFrequency === opt;

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
              onPress={() => onSelectFrequency(opt)}
              activeOpacity={0.7}
              className={`border-2 ${bgClass} ${borderClass}`}
              style={{ padding: wp(4), borderRadius: wp(4) }}
            >
              <Text
                className={`font-bold text-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
                style={{ fontSize: wp(4.5) }}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
