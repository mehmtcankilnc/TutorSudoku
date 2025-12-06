import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Board } from '../components/Board';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleTheme } from '../store/themeSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, RouteProp } from '@react-navigation/native';

type GameScreenRouteProp = RouteProp<
  { Play: { scannedBoard?: (number | null)[][] } },
  'Play'
>;

export const GameScreen: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const route = useRoute<GameScreenRouteProp>();
  const scannedBoard = route.params?.scannedBoard;

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 48,
          paddingBottom: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 w-full flex-row items-center justify-between">
          <View>
            <Text
              className={`text-3xl font-extrabold tracking-wider ${
                isDarkMode ? 'text-blue-400' : 'text-blue-900'
              }`}
            >
              Sudoku Tutor
            </Text>
            <Text
              className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Master reasoning, one number at a time
            </Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              const newTheme = !isDarkMode;
              await AsyncStorage.setItem(
                'user_theme',
                JSON.stringify(newTheme),
              );
              dispatch(toggleTheme());
            }}
            className={`p-2 rounded-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <MaterialCommunityIcons
              name={isDarkMode ? 'weather-sunny' : 'weather-night'}
              size={24}
              color={isDarkMode ? '#FBBF24' : '#1E3A8A'}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center w-full">
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.removeItem('user_onboarding');
              console.log('Onboarding reset!');
              Alert.alert('App state reset. Please reload the app.');
            }}
            className="mb-2 bg-red-500 rounded p-2"
          >
            <Text className="text-white font-bold">RESET APP STATE</Text>
          </TouchableOpacity>
          <Board scannedBoard={scannedBoard} />
        </View>
      </ScrollView>
    </View>
  );
};
