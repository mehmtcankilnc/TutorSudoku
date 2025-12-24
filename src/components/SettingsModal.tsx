/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setDarkMode, toggleSound } from '../store/themeSlice';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playSound } from '../utils/SoundManager';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onTestUpdate?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useDispatch();
  const { isDarkMode, isSoundEnabled } = useSelector(
    (state: RootState) => state.theme,
  );
  const { t, i18n } = useTranslation();

  const switchAnim = React.useRef(
    new Animated.Value(isDarkMode ? 1 : 0),
  ).current;

  const soundSwitchAnim = React.useRef(
    new Animated.Value(isSoundEnabled ? 1 : 0),
  ).current;

  React.useEffect(() => {
    Animated.timing(switchAnim, {
      toValue: isDarkMode ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isDarkMode, switchAnim]);

  React.useEffect(() => {
    Animated.timing(soundSwitchAnim, {
      toValue: isSoundEnabled ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSoundEnabled, soundSwitchAnim]);

  const thumbTranslateX = switchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, wp(10)],
  });

  const soundThumbTranslateX = soundSwitchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, wp(10)],
  });

  const handleToggleTheme = async () => {
    const newMode = !isDarkMode;
    dispatch(setDarkMode(newMode));
    await AsyncStorage.setItem('user_theme', JSON.stringify(newMode));
  };

  const handleToggleSound = async () => {
    const newSoundState = !isSoundEnabled;
    dispatch(toggleSound());
    if (newSoundState) {
      playSound('click');
    }
    await AsyncStorage.setItem('user_sound', JSON.stringify(newSoundState));
  };

  const changeLanguage = async (lang: string) => {
    await AsyncStorage.setItem('user_language', lang);
    i18n.changeLanguage(lang);
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <View
              className={`w-[85%] rounded-3xl p-6 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
              style={{ padding: wp(5), gap: wp(5) }}
            >
              {/* Header */}
              <View className="flex-row justify-between items-center">
                <Text
                  className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {t('settings')}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  onPressIn={() => playSound('click')}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={wp(6)}
                    color={isDarkMode ? '#9CA3AF' : '#4B5563'}
                  />
                </TouchableOpacity>
              </View>

              {/* Theme Section */}
              <View>
                <Text
                  className={`text-sm font-bold mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {t('theme').toUpperCase()}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{ fontSize: wp(4.5) }}
                  >
                    {isDarkMode ? t('darkMode') : t('lightMode')}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleToggleTheme}
                    onPressIn={() => playSound('click')}
                    style={{
                      width: wp(20),
                      height: wp(10),
                      backgroundColor: isDarkMode ? '#374151' : '#BFDBFE',
                      borderRadius: wp(5),
                      padding: wp(1),
                      justifyContent: 'center',
                    }}
                  >
                    {/* Track Icons */}
                    <View
                      className="absolute flex-row justify-between items-center"
                      style={{ width: '100%', paddingHorizontal: wp(2.5) }}
                    >
                      <MaterialCommunityIcons
                        name="weather-sunny"
                        size={wp(5)}
                        color="#FCD34D"
                        style={{ opacity: isDarkMode ? 1 : 0 }}
                      />
                      <MaterialCommunityIcons
                        name="weather-night"
                        size={wp(5)}
                        color="#3B82F6"
                        style={{ opacity: isDarkMode ? 0 : 1 }}
                      />
                    </View>

                    {/* Thumb */}
                    <Animated.View
                      style={{
                        width: wp(8),
                        height: wp(8),
                        borderRadius: wp(4),
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2.5,
                        elevation: 4,
                        transform: [{ translateX: thumbTranslateX }],
                      }}
                    >
                      <MaterialCommunityIcons
                        name={isDarkMode ? 'weather-night' : 'weather-sunny'}
                        size={wp(5)}
                        color={isDarkMode ? '#3B82F6' : '#F59E0B'}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sound Section */}
              <View>
                <Text
                  className={`text-sm font-bold mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {t('soundEffects').toUpperCase()}
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{ fontSize: wp(4.5) }}
                  >
                    {isSoundEnabled ? t('soundOn') : t('soundOff')}
                  </Text>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={handleToggleSound}
                    style={{
                      width: wp(20),
                      height: wp(10),
                      backgroundColor: isDarkMode ? '#374151' : '#BFDBFE',
                      borderRadius: wp(5),
                      padding: wp(1),
                      justifyContent: 'center',
                    }}
                  >
                    {/* Track Icons */}
                    <View
                      className="absolute flex-row justify-between items-center"
                      style={{ width: '100%', paddingHorizontal: wp(2.5) }}
                    >
                      <MaterialCommunityIcons
                        name="volume-off"
                        size={wp(5)}
                        color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                        style={{ opacity: isSoundEnabled ? 1 : 0 }}
                      />
                      <MaterialCommunityIcons
                        name="volume-high"
                        size={wp(5)}
                        color="#3B82F6"
                        style={{ opacity: isSoundEnabled ? 0 : 1 }}
                      />
                    </View>

                    {/* Thumb */}
                    <Animated.View
                      style={{
                        width: wp(8),
                        height: wp(8),
                        borderRadius: wp(4),
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 2.5,
                        elevation: 4,
                        transform: [{ translateX: soundThumbTranslateX }],
                      }}
                    >
                      <MaterialCommunityIcons
                        name={isSoundEnabled ? 'volume-high' : 'volume-off'}
                        size={wp(5)}
                        color={isSoundEnabled ? '#3B82F6' : '#9CA3AF'}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Language Section */}
              <View>
                <Text
                  className={`text-sm font-bold mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {t('language').toUpperCase()}
                </Text>
                <View className="gap-3">
                  {[
                    { code: 'en', label: 'English', flag: '🇬🇧' },
                    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
                  ].map(lang => (
                    <TouchableOpacity
                      key={lang.code}
                      onPress={() => changeLanguage(lang.code)}
                      onPressIn={() => playSound('click')}
                      className={`flex-row items-center justify-between p-4 rounded-xl border ${
                        i18n.language === lang.code
                          ? isDarkMode
                            ? 'bg-blue-900/30 border-blue-500'
                            : 'bg-blue-50 border-blue-500'
                          : isDarkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <View className="flex-row items-center gap-3">
                        <Text style={{ fontSize: wp(5) }}>{lang.flag}</Text>
                        <Text
                          className={`font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {lang.label}
                        </Text>
                      </View>
                      {i18n.language === lang.code && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={wp(5)}
                          color="#3B82F6"
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
