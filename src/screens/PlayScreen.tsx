/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  BackHandler,
  ToastAndroid,
  ActivityIndicator,
  NativeModules,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { Board } from '../components/Board';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { SettingsModal } from '../components/SettingsModal';
import { playSound } from '../utils/SoundManager';
import { useTranslation } from 'react-i18next';

type PlayScreenRouteProp = RouteProp<
  { Play: { scannedBoard?: (number | null)[][] } },
  'Play'
>;

const { PlayGames } = NativeModules;

export const PlayScreen: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode, gamesWon } = useSelector((state: RootState) => ({
    isDarkMode: state.theme.isDarkMode,
    gamesWon: state.user.gamesWon || { easy: 0, medium: 0, hard: 0 },
  }));
  const route = useRoute<PlayScreenRouteProp>();
  const scannedBoard = route.params?.scannedBoard;
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const [gameStage, setGameStage] = useState<'selecting' | 'playing'>(
    scannedBoard ? 'playing' : 'selecting',
  );

  React.useEffect(() => {
    if (scannedBoard) {
      setGameStage('playing');
      setSavedGame(null);
      setGameId(prev => prev + 1);
    }
  }, [scannedBoard]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(
    'easy',
  );

  const [gameId, setGameId] = useState(0);

  const [lastBackPress, setLastBackPress] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (gameStage === 'playing') {
          const now = Date.now();
          if (lastBackPress && now - lastBackPress < 2000) {
            return false;
          }
          setLastBackPress(now);
          ToastAndroid.show(t('pressBackAgainToExit'), ToastAndroid.SHORT);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [gameStage, lastBackPress, t]),
  );

  const [loadingLevel, setLoadingLevel] = useState<string | null>(null);

  const handleLevelSelect = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level);
    setLoadingLevel(level);
    setSavedGame(null);
    setGameId(prev => prev + 1);
  };

  const handleExitGame = () => {
    setGameStage('selecting');
  };

  const [savedGame, setSavedGame] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      const checkSavedGame = async () => {
        try {
          const AsyncStorage =
            require('@react-native-async-storage/async-storage').default;
          const saved = await AsyncStorage.getItem('saved_game');
          if (saved) {
            setSavedGame(JSON.parse(saved));
          } else {
            setSavedGame(null);
          }
        } catch (e) {
          console.error('Failed to load saved game', e);
        }
      };
      if (gameStage === 'selecting' && !loadingLevel) {
        checkSavedGame();
      }
    }, [gameStage, loadingLevel]),
  );

  const handleResumeGame = () => {
    if (savedGame) {
      setLoadingLevel('resume');
      setGameId(prev => prev + 1);
    }
  };

  const MEDIUM_UNLOCK_REQ = 3;
  const HARD_UNLOCK_REQ = 5;

  const isMediumLocked = gamesWon.easy < MEDIUM_UNLOCK_REQ;
  const isHardLocked = gamesWon.medium < HARD_UNLOCK_REQ;

  const renderOption = (
    level: 'easy' | 'medium' | 'hard',
    title: string,
    subtitle: string,
    icon: string,
    color: string,
    locked: boolean,
    isLoading: boolean,
    isDisabled: boolean,
    progressText?: string,
  ) => (
    <TouchableOpacity
      onPress={() => !locked && !isDisabled && handleLevelSelect(level)}
      onPressIn={() => {
        if (!locked && !isDisabled) playSound('click');
      }}
      activeOpacity={locked || isDisabled ? 1 : 0.7}
      className={`w-full border-2 flex-row items-center justify-between ${
        locked
          ? isDarkMode
            ? 'bg-gray-800 border-gray-700 opacity-60'
            : 'bg-gray-100 border-gray-200 opacity-60'
          : isDarkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-blue-100 shadow-sm'
      }`}
      style={{
        paddingVertical: wp(5),
        paddingHorizontal: wp(2),
        borderRadius: wp(5),
      }}
    >
      <View className="flex-row items-center flex-1">
        <View
          className={`rounded-full ${locked ? 'bg-gray-500' : ''}`}
          style={{
            backgroundColor: locked ? undefined : `${color}20`,
            padding: wp(2),
            marginRight: wp(3),
          }}
        >
          {isLoading ? (
            <ActivityIndicator
              size="small"
              color={isDarkMode ? '#60A5FA' : '#2563EB'}
            />
          ) : (
            <MaterialCommunityIcons
              name={locked ? 'lock' : icon}
              size={wp(8)}
              color={locked ? (isDarkMode ? '#9CA3AF' : '#6B7280') : color}
            />
          )}
        </View>
        <View className="flex-1" style={{ gap: wp(1) }}>
          <Text
            className={`font-bold ${
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}
            style={{ fontSize: wp(5) }}
          >
            {title}
          </Text>
          <Text
            className={`${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}
            style={{ fontSize: wp(3.5) }}
          >
            {subtitle}
          </Text>
          {locked && progressText && (
            <Text
              className="font-bold text-orange-500"
              style={{ fontSize: wp(2.5) }}
            >
              {progressText}
            </Text>
          )}
        </View>
      </View>
      {!locked && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={wp(6)}
          color={isDarkMode ? '#4B5563' : '#CBD5E1'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: wp(5),
          paddingTop: hp(4),
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
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => {
                PlayGames.showAllLeaderboards().catch((e: any) =>
                  console.error(e),
                );
              }}
              onPressIn={() => playSound('click')}
              className={`rounded-full ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              style={{ padding: wp(2), marginRight: wp(4) }}
            >
              <MaterialCommunityIcons
                name="trophy"
                size={wp(6)}
                color={'#F59E0B'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsSettingsVisible(true);
              }}
              onPressIn={() => playSound('click')}
              className={`rounded-full ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              style={{ padding: wp(2), marginRight: wp(4) }}
            >
              <MaterialCommunityIcons
                name="cog"
                size={wp(6)}
                color={isDarkMode ? '#9CA3AF' : '#4B5563'}
              />
            </TouchableOpacity>
          </View>
        </View>
        <SettingsModal
          visible={isSettingsVisible}
          onClose={() => setIsSettingsVisible(false)}
        />
        <View className="flex-1 items-center justify-center w-full">
          {gameStage === 'selecting' ? (
            <View
              className="w-full relative"
              style={{ padding: wp(4), gap: wp(5) }}
            >
              {savedGame && (
                <TouchableOpacity
                  onPress={() => !loadingLevel && handleResumeGame()}
                  onPressIn={() => {
                    if (!loadingLevel) playSound('click');
                  }}
                  activeOpacity={loadingLevel ? 1 : 0.7}
                  className={`w-full border-2 flex-row items-center justify-between ${
                    isDarkMode
                      ? 'bg-blue-900 border-blue-700'
                      : 'bg-blue-100 border-blue-200'
                  }`}
                  style={{ padding: wp(5), borderRadius: wp(5) }}
                >
                  <View className="flex-row items-center flex-1">
                    <View
                      className="rounded-full"
                      style={{
                        backgroundColor: isDarkMode ? '#1E3A8A' : '#DBEAFE',
                        padding: wp(2),
                        marginRight: wp(3),
                      }}
                    >
                      {loadingLevel === 'resume' ? (
                        <ActivityIndicator
                          size="small"
                          color={isDarkMode ? '#60A5FA' : '#2563EB'}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="play-circle-outline"
                          size={wp(8)}
                          color={isDarkMode ? '#60A5FA' : '#2563EB'}
                        />
                      )}
                    </View>
                    <View className="flex-1" style={{ gap: wp(1) }}>
                      <Text
                        className={`font-bold ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}
                        style={{ fontSize: wp(5) }}
                      >
                        {t('resumeGame')}
                      </Text>
                      <View
                        className="flex-row flex-wrap items-center mt-1"
                        style={{ gap: wp(3) }}
                      >
                        {/* Time */}
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="clock-outline"
                            size={wp(3.5)}
                            color={isDarkMode ? '#9CA3AF' : '#64748B'}
                          />
                          <Text
                            className={`${
                              isDarkMode ? 'text-gray-400' : 'text-slate-600'
                            }`}
                            style={{ fontSize: wp(3.2), marginLeft: wp(1) }}
                          >
                            {(() => {
                              const time = savedGame.timer || 0;
                              const mins = Math.floor(time / 60);
                              const secs = time % 60;
                              return `${mins}:${secs
                                .toString()
                                .padStart(2, '0')}`;
                            })()}
                          </Text>
                        </View>

                        {/* Difficulty */}
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="speedometer"
                            size={wp(3.5)}
                            color={isDarkMode ? '#9CA3AF' : '#64748B'}
                          />
                          <Text
                            className={`${
                              isDarkMode ? 'text-gray-400' : 'text-slate-600'
                            }`}
                            style={{ fontSize: wp(3.2), marginLeft: wp(1) }}
                          >
                            {t(savedGame.difficulty)}
                          </Text>
                        </View>

                        {/* Mistakes */}
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={wp(3.5)}
                            color="#EF4444"
                          />
                          <Text
                            className={`${
                              isDarkMode ? 'text-gray-400' : 'text-slate-600'
                            }`}
                            style={{ fontSize: wp(3.2), marginLeft: wp(1) }}
                          >
                            {savedGame.mistakeCount || 0}
                          </Text>
                        </View>

                        {/* Hints */}
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="lightbulb-on-outline"
                            size={wp(3.5)}
                            color="#EAB308"
                          />
                          <Text
                            className={`${
                              isDarkMode ? 'text-gray-400' : 'text-slate-600'
                            }`}
                            style={{ fontSize: wp(3.2), marginLeft: wp(1) }}
                          >
                            {savedGame.hintCount || 0}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={wp(6)}
                    color={isDarkMode ? '#60A5FA' : '#2563EB'}
                  />
                </TouchableOpacity>
              )}

              <Text
                className={`text-center font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-600'
                }`}
                style={{ fontSize: wp(4) }}
              >
                {t('selectDifficulty')}
              </Text>

              {renderOption(
                'easy',
                t('easy'),
                t('easyDesc'),
                'feather',
                '#10B981',
                false,
                loadingLevel === 'easy',
                loadingLevel !== null,
              )}

              {renderOption(
                'medium',
                t('medium'),
                t('mediumDesc'),
                'shield-outline',
                '#F59E0B',
                isMediumLocked,
                loadingLevel === 'medium',
                loadingLevel !== null,
                `${t('mediumLock')} ${MEDIUM_UNLOCK_REQ - gamesWon.easy}`,
              )}

              {renderOption(
                'hard',
                t('hard'),
                t('hardDesc'),
                'fire',
                '#EF4444',
                isHardLocked,
                loadingLevel === 'hard',
                loadingLevel !== null,
                `${t('hardLock')} ${HARD_UNLOCK_REQ - gamesWon.medium}`,
              )}

              <View className="flex-row justify-center items-center">
                <MaterialCommunityIcons
                  name="trophy-outline"
                  size={wp(6)}
                  color={isDarkMode ? '#6B7280' : '#94A3B8'}
                />
                <Text
                  className={`${
                    isDarkMode ? 'text-gray-500' : 'text-slate-400'
                  }`}
                  style={{ fontSize: wp(3.5), marginLeft: wp(2) }}
                >
                  {t('wins')} {gamesWon.easy + gamesWon.medium + gamesWon.hard}
                </Text>
              </View>

              {/* Hidden Board for Pre-loading */}
              {loadingLevel && (
                <View
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    pointerEvents: 'none',
                  }}
                >
                  <Board
                    key={gameId}
                    scannedBoard={scannedBoard}
                    isSettingsOpen={isSettingsVisible}
                    initialDifficulty={difficulty}
                    onExit={handleExitGame}
                    savedGameState={
                      loadingLevel === 'resume' ? savedGame : undefined
                    }
                    justResumed={loadingLevel === 'resume'}
                    onReady={() => {
                      setLoadingLevel(null);
                      setGameStage('playing');
                    }}
                    totalWins={gamesWon.easy + gamesWon.medium + gamesWon.hard}
                  />
                </View>
              )}
            </View>
          ) : (
            <Board
              key={gameId}
              scannedBoard={scannedBoard}
              isSettingsOpen={isSettingsVisible}
              initialDifficulty={difficulty}
              onExit={handleExitGame}
              savedGameState={savedGame}
              justResumed={savedGame !== null && savedGame !== undefined}
              totalWins={gamesWon.easy + gamesWon.medium + gamesWon.hard}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};
