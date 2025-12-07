import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

interface NumberPadProps {
  onNumberPress: (num: number) => void;
  completedNumbers?: number[];
  isDarkMode?: boolean;
}
export const NumberPad: React.FC<NumberPadProps> = ({
  onNumberPress,
  completedNumbers = [],
  isDarkMode = false,
}) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <View
      className="w-full"
      style={{ marginTop: wp(3), paddingHorizontal: wp(2) }}
    >
      <View className="flex-row items-center">
        {numbers.map(num => {
          const isCompleted = completedNumbers.includes(num);
          return (
            <TouchableOpacity
              key={num}
              onPress={() => onNumberPress(num)}
              disabled={isCompleted}
              className={`flex-1 items-center justify-center active:scale-95 active:opacity-60 
                ${
                  isCompleted
                    ? isDarkMode
                      ? 'bg-green-900 rounded-md'
                      : 'bg-green-100 rounded-md'
                    : ''
                }`}
              style={{ height: hp(5), marginHorizontal: wp(1) }}
            >
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{ fontSize: wp(7) }}
                className={`font-bold 
                ${
                  isCompleted
                    ? isDarkMode
                      ? 'text-green-400 opacity-50'
                      : 'text-green-600 opacity-50'
                    : isDarkMode
                    ? 'text-blue-400'
                    : 'text-blue-600'
                }`}
              >
                {num}
              </Text>
              {isCompleted && (
                <View
                  className={`absolute -top-1 -right-1 rounded-full items-center justify-center border ${
                    isDarkMode
                      ? 'bg-green-600 border-gray-900'
                      : 'bg-green-500 border-white'
                  }`}
                  style={{ width: wp(4), height: wp(4) }}
                >
                  <Text className="text-white text-[10px] font-bold">✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
