import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
interface NumberPadProps {
  onNumberPress: (num: number) => void;
  onClearPress: () => void;
  completedNumbers?: number[];
  isDarkMode?: boolean;
}
export const NumberPad: React.FC<NumberPadProps> = ({ onNumberPress, onClearPress, completedNumbers = [], isDarkMode = false }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <View className="mt-6 px-2 w-full">
      <View className="flex-row items-center mb-6">
        {numbers.map((num) => {
          const isCompleted = completedNumbers.includes(num);
          return (
          <TouchableOpacity
            key={num}
            onPress={() => onNumberPress(num)}
            disabled={isCompleted}
            className={`flex-1 h-12 mx-0.5 items-center justify-center active:scale-95 active:opacity-60 
                ${isCompleted 
                    ? (isDarkMode ? 'bg-green-900 rounded-md' : 'bg-green-100 rounded-md') 
                    : ''
                }`}
          >
            <Text 
                adjustsFontSizeToFit
                numberOfLines={1}
                className={`text-3xl font-bold 
                ${isCompleted 
                    ? (isDarkMode ? 'text-green-400 opacity-50' : 'text-green-600 opacity-50') 
                    : (isDarkMode ? 'text-blue-400' : 'text-blue-600')
                }`}>
                {num}
            </Text>
            {isCompleted && (
                 <View className={`absolute -top-1 -right-1 w-4 h-4 rounded-full items-center justify-center border ${isDarkMode ? 'bg-green-600 border-gray-900' : 'bg-green-500 border-white'}`}>
                     <Text className="text-white text-[10px] font-bold">✓</Text>
                 </View>
            )}
          </TouchableOpacity>
        )})}
      </View>
    </View>
  );
};
