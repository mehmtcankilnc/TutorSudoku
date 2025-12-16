/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Board } from '../components/Board';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SettingsModal } from '../components/SettingsModal';
import { t } from 'i18next';

type GameScreenRouteProp = RouteProp<
  { Play: { scannedBoard?: (number | null)[][] } },
  'Play'
>;

export const GameScreen: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const route = useRoute<GameScreenRouteProp>();
  const scannedBoard = route.params?.scannedBoard;
  const [isSettingsVisible, setIsSettingsVisible] = React.useState(false);

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: wp(6),
          paddingTop: hp(6),
          paddingBottom: hp(3),
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="w-full flex-row items-center justify-between"
          style={{ marginBottom: wp(2) }}
        >
          <View>
            <Text
              className={`font-extrabold tracking-wider ${
                isDarkMode ? 'text-blue-400' : 'text-blue-900'
              }`}
              style={{ fontSize: wp(8) }}
            >
              {t('gameScreenTitle')}
            </Text>
            <Text
              className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              style={{ fontSize: wp(3) }}
            >
              {t('gameScreenText')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsSettingsVisible(true)}
            className={`rounded-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            style={{ padding: wp(2) }}
          >
            <MaterialCommunityIcons
              name="cog"
              size={wp(6)}
              color={isDarkMode ? '#9CA3AF' : '#4B5563'}
            />
          </TouchableOpacity>
        </View>
        <SettingsModal
          visible={isSettingsVisible}
          onClose={() => setIsSettingsVisible(false)}
        />
        <View className="flex-1 items-center justify-center w-full">
          <Board
            scannedBoard={scannedBoard}
            isSettingsOpen={isSettingsVisible}
          />
        </View>
      </ScrollView>
    </View>
  );
};
