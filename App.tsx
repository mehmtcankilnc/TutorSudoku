import './global.css';
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
import { ActivityIndicator, View } from 'react-native';

const Tab = createBottomTabNavigator();
const MainApp = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const isOnboarded = useSelector((state: RootState) => state.user.isOnboarded);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_onboarding');
        if (userData) {
          const parsed = JSON.parse(userData);
          dispatch(hydrateUser(parsed));
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
      <SafeAreaProvider>
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
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#111827' : '#ffffff'}
        />
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: isDarkMode ? '#111827' : '#ffffff',
          }}
          edges={['top', 'bottom']}
        >
          <OnboardingScreen />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#111827' : '#ffffff'}
      />
      <SafeAreaView
        style={{ flex: 1, backgroundColor: isDarkMode ? '#111827' : '#ffffff' }}
        edges={['top', 'bottom']}
      >
        <NavigationContainer theme={isDarkMode ? MyDarkTheme : MyLightTheme}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                paddingBottom: 8,
                paddingTop: 8,
                backgroundColor: isDarkMode ? '#1F2937' : '#ffffff',
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? '#374151' : '#f3f4f6',
                elevation: 10,
                shadowColor: isDarkMode ? '#000000' : '#000000',
              },
              tabBarLabelStyle: {
                fontSize: 12,
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
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="puzzle-outline"
                    color={color}
                    size={28}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Scan"
              component={ScanScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="camera-outline"
                    color={color}
                    size={28}
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Learn"
              component={TutorialsScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons
                    name="school-outline"
                    color={color}
                    size={28}
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
