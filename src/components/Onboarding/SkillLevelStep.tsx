import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserState } from '../../store/userSlice';
import { useTranslation } from 'react-i18next';

interface SkillLevelStepProps {
  isDarkMode: boolean;
  selectedSkillLevel: UserState['skillLevel'];
  onSelectSkill: (level: UserState['skillLevel']) => void;
}

export const SkillLevelStep: React.FC<SkillLevelStepProps> = ({
  isDarkMode,
  selectedSkillLevel,
  onSelectSkill,
}) => {
  const { t } = useTranslation();

  const skillLevels = useMemo(
    () => [
      {
        id: 'beginner' as const,
        label: t('beginner'),
        icon: 'sprout',
        desc: t('beginnerDesc'),
      },
      {
        id: 'intermediate' as const,
        label: t('intermediate'),
        icon: 'shield-check',
        desc: t('intermediateDesc'),
      },
      {
        id: 'expert' as const,
        label: t('expert'),
        icon: 'brain',
        desc: t('expertDesc'),
      },
      {
        id: 'master' as const,
        label: t('master'),
        icon: 'crown',
        desc: t('masterDesc'),
      },
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
        {t('yourExperience')}
      </Text>
      <Text
        className={`text-base mb-8 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {t('experienceDesc')}
      </Text>
      <View style={{ gap: wp(3) }}>
        {skillLevels.map(opt => {
          const isSelected = selectedSkillLevel === opt.id;

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
              onPress={() => onSelectSkill(opt.id)}
              activeOpacity={0.7}
              className="flex-row items-center rounded-xl border-2"
              style={{
                borderColor,
                backgroundColor,
                padding: wp(3),
              }}
            >
              <View
                className={`rounded-full ${
                  isSelected
                    ? 'bg-blue-500'
                    : isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                }`}
                style={{ padding: wp(2), marginRight: wp(4) }}
              >
                <MaterialCommunityIcons
                  name={opt.icon}
                  size={wp(6)}
                  color={
                    isSelected ? 'white' : isDarkMode ? '#9CA3AF' : '#6B7280'
                  }
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{ fontSize: wp(4.5) }}
                >
                  {opt.label}
                </Text>
                <Text
                  className={`${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                  style={{ fontSize: wp(4) }}
                >
                  {opt.desc}
                </Text>
              </View>
              <View style={{ opacity: isSelected ? 1 : 0 }}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={wp(6)}
                  color="#3B82F6"
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
