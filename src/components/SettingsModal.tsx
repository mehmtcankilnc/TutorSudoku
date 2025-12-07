import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setDarkMode } from '../store/themeSlice';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { t, i18n } = useTranslation();

  /* duplicate removed */

  const handleToggleTheme = async () => {
    const newMode = !isDarkMode;
    dispatch(setDarkMode(newMode));
    await AsyncStorage.setItem('user_theme', JSON.stringify(newMode));
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
                <TouchableOpacity onPress={onClose}>
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
                <TouchableOpacity
                  onPress={handleToggleTheme}
                  className={`flex-row items-center justify-between p-4 rounded-xl border ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <MaterialCommunityIcons
                      name={isDarkMode ? 'weather-night' : 'weather-sunny'}
                      size={wp(5)}
                      color={isDarkMode ? '#60A5FA' : '#F59E0B'}
                    />
                    <Text
                      className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {isDarkMode ? t('darkMode') : t('lightMode')}
                    </Text>
                  </View>
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      isDarkMode ? 'border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    {isDarkMode && (
                      <View className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </View>
                </TouchableOpacity>
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
