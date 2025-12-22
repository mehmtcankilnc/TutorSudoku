import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTranslation } from 'react-i18next';

interface ResultScreenProps {
  mistakes: number;
  hints: number;
  timeInSeconds: number;
  onNewGame: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  mistakes,
  hints,
  timeInSeconds,
  onNewGame,
}) => {
  const { t } = useTranslation();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View
      className="absolute inset-0 z-50 bg-white/95 items-center justify-center"
      style={{ padding: wp(6), borderRadius: wp(4), gap: wp(8) }}
    >
      <View className="items-center" style={{ gap: wp(2) }}>
        <Text style={{ fontSize: wp(10), lineHeight: wp(12) }}>🎉</Text>
        <Text
          className="font-bold text-blue-900"
          style={{ fontSize: wp(9), lineHeight: wp(11) }}
        >
          {t('solved')}
        </Text>
        <Text
          className="text-gray-500 font-medium"
          style={{ fontSize: wp(4), lineHeight: wp(6) }}
        >
          {t('greatJob')}
        </Text>
      </View>
      <View
        className="w-full bg-blue-50 space-y-4"
        style={{ borderRadius: wp(5), padding: wp(5), gap: wp(4) }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: wp(2) }}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={wp(6)}
              color="#3B82F6"
            />
            <Text
              className="text-gray-600 font-medium"
              style={{ fontSize: wp(4) }}
            >
              {t('time')}
            </Text>
          </View>
          <Text
            className="font-bold text-blue-900"
            style={{ fontSize: wp(4.5) }}
          >
            {formatTime(timeInSeconds)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: wp(2) }}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={wp(6)}
              color="#EF4444"
            />
            <Text
              className="text-gray-600 font-medium"
              style={{ fontSize: wp(4) }}
            >
              {t('mistakes')}
            </Text>
          </View>
          <Text
            className="font-bold text-blue-900"
            style={{ fontSize: wp(4.5) }}
          >
            {mistakes}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: wp(2) }}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={wp(6)}
              color="#EAB308"
            />
            <Text
              className="text-gray-600 ml-2 font-medium"
              style={{ fontSize: wp(4) }}
            >
              {t('hints')}
            </Text>
          </View>
          <Text
            className="font-bold text-blue-900"
            style={{ fontSize: wp(4.5) }}
          >
            {hints}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onNewGame}
        className="bg-blue-600 rounded-full shadow-lg active:bg-blue-700 w-full items-center"
        style={{ paddingHorizontal: wp(10), paddingVertical: wp(4) }}
      >
        <Text className="text-white font-bold" style={{ fontSize: wp(4) }}>
          {t('startNewGame')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
