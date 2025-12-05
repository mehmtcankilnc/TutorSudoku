import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface ResultScreenProps {
  mistakes: number;
  hints: number;
  timeInSeconds: number;
  onNewGame: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ mistakes, hints, timeInSeconds, onNewGame }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="absolute inset-0 z-50 bg-white/95 items-center justify-center p-6 rounded-xl">
      <View className="items-center mb-8">
        <Text className="text-5xl mb-2">🎉</Text>
        <Text className="text-3xl font-bold text-blue-900 mb-2">Solved!</Text>
        <Text className="text-gray-500 font-medium">Great mental workout.</Text>
      </View>

      <View className="w-full bg-blue-50 p-6 rounded-2xl mb-8 space-y-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="clock-outline" size={24} color="#3B82F6" />
            <Text className="text-gray-600 ml-2 font-medium text-lg">Time</Text>
          </View>
          <Text className="text-2xl font-bold text-blue-900">{formatTime(timeInSeconds)}</Text>
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#EF4444" />
            <Text className="text-gray-600 ml-2 font-medium text-lg">Mistakes</Text>
          </View>
          <Text className="text-2xl font-bold text-blue-900">{mistakes}</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#EAB308" />
            <Text className="text-gray-600 ml-2 font-medium text-lg">Hints</Text>
          </View>
          <Text className="text-2xl font-bold text-blue-900">{hints}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onNewGame}
        className="bg-blue-600 px-10 py-4 rounded-full shadow-lg active:bg-blue-700 w-full items-center"
      >
        <Text className="text-white font-bold text-lg">Start New Game</Text>
      </TouchableOpacity>
    </View>
  );
};
