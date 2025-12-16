/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
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
import { GameScreen } from './src/screens/GameScreen';
import { TutorialsScreen } from './src/screens/TutorialsScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { StatusBar } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from './src/store/store';
import { AlertProvider } from './src/context/AlertContext';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { hydrateUser } from './src/store/userSlice';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { setDarkMode } from './src/store/themeSlice';
import { setCompletedTutorials } from './src/store/progressSlice';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useResposive } from './src/hooks/useResponsive';

const Tab = createBottomTabNavigator();
const MainApp = () => {
  const r = useResposive();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const isOnboarded = useSelector((state: RootState) => state.user.isOnboarded);
  const systemScheme = useColorScheme();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        // Load Theme Preference
        const themeData = await AsyncStorage.getItem('user_theme');
        if (themeData !== null) {
          const isDark = JSON.parse(themeData);
          dispatch(setDarkMode(isDark));
        } else {
          // Fallback to system preference
          dispatch(setDarkMode(systemScheme === 'dark'));
        }

        // Load Onboarding Data
        const userData = await AsyncStorage.getItem('user_onboarding');
        if (userData) {
          const parsed = JSON.parse(userData);
          dispatch(hydrateUser(parsed));
        }

        // Load Language Preference
        const langData = await AsyncStorage.getItem('user_language');
        if (langData) {
          i18n.changeLanguage(langData);
        }

        // Load Progress Data
        const progressData = await AsyncStorage.getItem('user_progress');
        if (progressData) {
          const parsedProgress = JSON.parse(progressData);
          dispatch(setCompletedTutorials(parsedProgress));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [dispatch]);

  // Custom Navigation Themes
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

  if (isLoading) {
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
          <ActivityIndicator size="large" color="#3B82F6" />
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
        edges={['top', 'left', 'right']}
      >
        <NavigationContainer theme={isDarkMode ? MyDarkTheme : MyLightTheme}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
              },
              tabBarLabelStyle: {
                fontSize: r.isTablet ? wp(2.5) : wp(3.5),
                fontWeight: '600',
              },
              tabBarActiveTintColor: '#3B82F6',
              tabBarInactiveTintColor: isDarkMode ? '#9CA3AF' : '#9CA3AF',
            }}
          >
            <Tab.Screen
              name="Play"
              component={GameScreen}
              options={{
                tabBarLabel: t('navPlay'),
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="puzzle-outline"
                    color={color}
                    size={r.isTablet ? wp(3) : wp(8)}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Scan"
              component={ScanScreen}
              options={{
                tabBarLabel: t('navScan'),
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="camera-outline"
                    color={color}
                    size={r.isTablet ? wp(3) : wp(8)}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Learn"
              component={TutorialsScreen}
              options={{
                tabBarLabel: t('navLearn'),
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons
                    name="school-outline"
                    color={color}
                    size={r.isTablet ? wp(3) : wp(8)}
                  />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
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
