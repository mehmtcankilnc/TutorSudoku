import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Board } from '../components/Board';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { toggleTheme } from '../store/themeSlice';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, RouteProp } from '@react-navigation/native';

type GameScreenRouteProp = RouteProp<{ Play: { scannedBoard?: (number | null)[][] } }, 'Play'>;

export const GameScreen: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const route = useRoute<GameScreenRouteProp>();
  const scannedBoard = route.params?.scannedBoard;

  return (
      <View className={`flex-1 items-center justify-center pt-10 ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
        <View className="mb-4 w-full px-6 flex-row items-center justify-between">
            <View>
                <Text className={`text-3xl font-extrabold tracking-wider ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>Sudoku Tutor</Text>
                <Text className={`font-medium text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-blue-600'}`}>Master reasoning, one number at a time</Text>
            </View>
            <TouchableOpacity 
                onPress={() => dispatch(toggleTheme())}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            >
                <MaterialCommunityIcons 
                    name={isDarkMode ? "weather-sunny" : "weather-night"} 
                    size={24} 
                    color={isDarkMode ? "#FBBF24" : "#1E3A8A"} 
                />
            </TouchableOpacity>
        </View>
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
  );
};
