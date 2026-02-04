/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import './global.css';
import './src/i18n';
import { useTranslation } from 'react-i18next';
import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PlayScreen } from './src/screens/PlayScreen';
import { TutorialsScreen } from './src/screens/TutorialsScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { StatusBar } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './src/store/store';
import { AlertProvider } from './src/context/AlertContext';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { hydrateUser, setGamesWon, setBestTimes } from './src/store/userSlice';
import { View, useColorScheme, NativeModules } from 'react-native';
import { setDarkMode } from './src/store/themeSlice';
import { setCompletedTutorials } from './src/store/progressSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useResponsive } from './src/hooks/useResponsive';
import LottieView from 'lottie-react-native';
import { UpdateModal } from './src/components/UpdateModal';
import {
  loadSounds,
  playSound,
  setSoundEnabled,
} from './src/utils/SoundManager';
import { setSoundEnabled as setStoreSoundEnabled } from './src/store/themeSlice';

const { PlayGames } = NativeModules;
const LEADERBOARD_IDS = {
  TOTAL_WINS: 'CgkI1O2G5fIKEAIQAQ',
  EASY_TIME: 'CgkI1O2G5fIKEAIQBw',
  MEDIUM_TIME: 'CgkI1O2G5fIKEAIQAw',
  HARD_TIME: 'CgkI1O2G5fIKEAIQBA',
};

const CURRENT_VERSION = '1.3.5';
const VERSION_URL =
  'https://raw.githubusercontent.com/mehmtcankilnc/TutorSudoku/main/version.json';

const compareVersions = (v1: string, v2: string) => {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
};

const Tab = createBottomTabNavigator();
const MainApp = () => {
  const r = useResponsive();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const isSoundEnabled = useSelector(
    (state: RootState) => state.theme.isSoundEnabled,
  );
  const { isOnboarded } = useSelector((state: RootState) => state.user);
  const systemScheme = useColorScheme();
  const [isLoading, setIsLoading] = React.useState(true);
  const isStoreLoaded = React.useRef(false);

  const [isSplashFinished, setIsSplashFinished] = React.useState(false);

  const [isUpdateRequired, setIsUpdateRequired] = React.useState(false);
  const [storeUrl, setStoreUrl] = React.useState('');

  React.useEffect(() => {
    PlayGames.init()
      .then(async (isAuthenticated: boolean) => {
        console.log('Giriş durumu: ', isAuthenticated);
        if (isAuthenticated) {
          try {
            const [cloudTotalWins, cloudEasy, cloudMedium, cloudHard] =
              await Promise.all([
                PlayGames.getMyScore(LEADERBOARD_IDS.TOTAL_WINS),
                PlayGames.getMyScore(LEADERBOARD_IDS.EASY_TIME),
                PlayGames.getMyScore(LEADERBOARD_IDS.MEDIUM_TIME),
                PlayGames.getMyScore(LEADERBOARD_IDS.HARD_TIME),
              ]);

            const currentUserState = store.getState().user;
            let hasChanges = false;

            const localWins = currentUserState.gamesWon;
            const localTotalWins =
              localWins.easy + localWins.medium + localWins.hard;

            let newWins = { ...localWins };

            if (cloudTotalWins > localTotalWins) {
              const diff = cloudTotalWins - localTotalWins;
              if (diff > 3) {
                newWins.easy += 3;
                newWins.medium += diff - 3;
              } else {
                newWins.easy += diff;
              }
              hasChanges = true;
            }

            const localTimes = currentUserState.bestTimes || {
              easy: null,
              medium: null,
              hard: null,
            };
            let newTimes = { ...localTimes };

            const syncTime = (cloudVal: number, localVal: number | null) => {
              if (cloudVal <= 0) return localVal;

              const cloudSeconds = cloudVal / 1000;

              if (localVal === null || cloudSeconds < localVal) {
                return cloudSeconds;
              }
              return localVal;
            };

            const syncedEasy = syncTime(cloudEasy, localTimes.easy);
            const syncedMedium = syncTime(cloudMedium, localTimes.medium);
            const syncedHard = syncTime(cloudHard, localTimes.hard);

            if (
              syncedEasy !== localTimes.easy ||
              syncedMedium !== localTimes.medium ||
              syncedHard !== localTimes.hard
            ) {
              newTimes = {
                easy: syncedEasy,
                medium: syncedMedium,
                hard: syncedHard,
              };
              hasChanges = true;
            }

            if (hasChanges) {
              if (newWins !== localWins) dispatch(setGamesWon(newWins));
              if (newTimes !== localTimes) dispatch(setBestTimes(newTimes));

              await AsyncStorage.setItem('user_wins', JSON.stringify(newWins));
              await AsyncStorage.setItem(
                'user_best_times',
                JSON.stringify(newTimes),
              );
            }
          } catch (error) {
            console.error('Senkronizasyon hatası:', error);
          }
        }
      })
      .catch((err: any) => console.error('Play Games Hatası: ', err));
  }, [dispatch]);

  React.useEffect(() => {
    loadSounds();
    const checkVersion = async () => {
      try {
        const response = await fetch(VERSION_URL);
        if (response.ok) {
          const data = await response.json();

          const latestVersion = data.version;
          const url = data.storeUrl;

          if (
            latestVersion &&
            compareVersions(latestVersion, CURRENT_VERSION) > 0
          ) {
            setStoreUrl(url);
            setIsUpdateRequired(true);
          }
        }
      } catch (error) {
        console.warn('Version check failed', error);
      }
    };
    checkVersion();
  }, []);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const themeData = await AsyncStorage.getItem('user_theme');
        if (themeData !== null) {
          const isDark = JSON.parse(themeData);
          dispatch(setDarkMode(isDark));
        } else {
          dispatch(setDarkMode(systemScheme === 'dark'));
        }

        const soundData = await AsyncStorage.getItem('user_sound');
        if (soundData !== null) {
          const isSound = JSON.parse(soundData);
          dispatch(setStoreSoundEnabled(isSound));
          setSoundEnabled(isSound);
        }

        const userData = await AsyncStorage.getItem('user_onboarding');
        if (userData) {
          const parsed = JSON.parse(userData);
          dispatch(hydrateUser(parsed));
        }

        const langData = await AsyncStorage.getItem('user_language');
        if (langData) {
          i18n.changeLanguage(langData);
        }

        const progressData = await AsyncStorage.getItem('user_progress');
        if (progressData) {
          const parsedProgress = JSON.parse(progressData);
          dispatch(setCompletedTutorials(parsedProgress));
        }

        const winsData = await AsyncStorage.getItem('user_wins');
        if (winsData) {
          const parsedWins = JSON.parse(winsData);
          dispatch(setGamesWon(parsedWins));
        }

        const timesData = await AsyncStorage.getItem('user_best_times');
        if (timesData) {
          const parsedTimes = JSON.parse(timesData);
          dispatch(setBestTimes(parsedTimes));
        }
      } catch (e) {
        console.error(e);
      } finally {
        isStoreLoaded.current = true;
        setIsLoading(false);
      }
    };
    checkUser();
  }, [dispatch, systemScheme, i18n]);

  React.useEffect(() => {
    setSoundEnabled(isSoundEnabled);
  }, [isSoundEnabled]);

  React.useEffect(() => {
    const saveData = async () => {
      if (!isStoreLoaded.current) {
        return;
      }
      try {
        const userState = store.getState().user;
        await AsyncStorage.setItem(
          'user_wins',
          JSON.stringify(userState.gamesWon),
        );
        await AsyncStorage.setItem(
          'user_best_times',
          JSON.stringify(userState.bestTimes),
        );
      } catch (e) {
        console.error('Failed to save wins', e);
      }
    };

    const unsubscribe = store.subscribe(() => {
      saveData();
    });
    return () => unsubscribe();
  }, []);

  const MyLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#ffffff',
      card: '#ffffff',
      text: '#111827',
      border: '#f3f4f6',
    },
  };
  const MyDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: '#111827',
      card: '#1F2937',
      text: '#F9FAFB',
      border: '#374151',
    },
  };

  if (isLoading || !isSplashFinished) {
    return (
      <SafeAreaProvider
        style={{ backgroundColor: isDarkMode ? '#111827' : '#ffffff' }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <LottieView
            source={require('./src/assets/splash_animation.json')}
            autoPlay
            loop={false}
            onAnimationFinish={() => setIsSplashFinished(true)}
            style={{ width: wp(50), height: wp(50) }}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!isOnboarded) {
    return (
      <SafeAreaProvider
        style={{ backgroundColor: isDarkMode ? '#111827' : '#ffffff' }}
      >
        <StatusBar
          hidden
          translucent={true}
          backgroundColor={isDarkMode ? '#111827' : '#ffffff'}
        />
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
          }}
          edges={['top', 'right', 'left']}
        >
          <OnboardingScreen />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider
      style={{ backgroundColor: isDarkMode ? '#111827' : '#eff6ff' }}
    >
      <StatusBar
        hidden
        translucent={true}
        backgroundColor={isDarkMode ? '#111827' : '#eff6ff'}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDarkMode ? '#111827' : '#eff6ff' }}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <NavigationContainer theme={isDarkMode ? MyDarkTheme : MyLightTheme}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
                height: r.isTablet ? hp(10) : hp(8),
                paddingBottom: r.isTablet ? hp(2) : hp(2),
                paddingTop: r.isTablet ? hp(1) : hp(1),
              },
              tabBarLabelStyle: {
                fontSize: r.isTablet ? wp(2.5) : wp(3.5),
                lineHeight: r.isTablet ? wp(3) : wp(4),
                fontWeight: '600',
              },
              tabBarActiveTintColor: '#3B82F6',
              tabBarInactiveTintColor: isDarkMode ? '#9CA3AF' : '#9CA3AF',
            }}
          >
            <Tab.Screen
              name="Play"
              component={PlayScreen}
              listeners={{
                tabPress: () => playSound('click'),
              }}
              options={{
                tabBarLabel: t('navPlay'),
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="puzzle-outline"
                    color={color}
                    size={r.isTablet ? wp(3) : wp(7)}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Scan"
              component={ScanScreen}
              listeners={{
                tabPress: () => playSound('click'),
              }}
              options={{
                tabBarLabel: t('navScan'),
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="camera-outline"
                    color={color}
                    size={r.isTablet ? wp(3) : wp(7)}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Learn"
              component={TutorialsScreen}
              listeners={{
                tabPress: () => playSound('click'),
              }}
              options={{
                tabBarLabel: t('navLearn'),
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="school-outline"
                    color={color}
                    size={r.isTablet ? wp(3) : wp(7)}
                  />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
      <UpdateModal
        visible={isUpdateRequired}
        storeUrl={storeUrl}
        isDarkMode={isDarkMode}
      />
    </SafeAreaProvider>
  );
};
export default function App() {
  return (
    <Provider store={store}>
      <AlertProvider>
        <MainApp />
      </AlertProvider>
    </Provider>
  );
}
