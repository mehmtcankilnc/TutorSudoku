/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface DifficultyModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (difficulty: 'easy' | 'medium' | 'hard') => void;
  isDarkMode: boolean;
  gamesWon: {
    easy: number;
    medium: number;
    hard: number;
  };
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  visible,
  onClose,
  onSelect,
  isDarkMode,
  gamesWon,
}) => {
  const MEDIUM_UNLOCK_REQ = 3;
  const HARD_UNLOCK_REQ = 3;

  // Ensure gamesWon is defined to prevent crashes if not yet hydrated perfectly
  const wins = gamesWon || { easy: 0, medium: 0, hard: 0 };

  const isMediumLocked = wins.easy < MEDIUM_UNLOCK_REQ;
  const isHardLocked = wins.medium < HARD_UNLOCK_REQ;
  const { t } = useTranslation();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View
              className={`shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
              style={{ borderRadius: wp(5), padding: wp(6), width: wp(80) }}
            >
              <View
                className="flex-row justify-between items-center"
                style={{ marginBottom: wp(5) }}
              >
                <Text
                  className={`font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{ fontSize: wp(6) }}
                >
                  {t('newGame')}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <MaterialCommunityIcons
                    name="close"
                    size={wp(6)}
                    color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  />
                </TouchableOpacity>
              </View>
              <Text
                className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                style={{ marginBottom: wp(4), fontSize: wp(3.5) }}
              >
                {t('difficultyHeader')}
              </Text>
              <View style={{ gap: wp(3) }}>
                {/* Easy Option */}
                <TouchableOpacity
                  onPress={() => {
                    onSelect('easy');
                    onClose();
                  }}
                  className={`flex-row items-center border-2 ${
                    isDarkMode
                      ? 'bg-green-900/20 border-green-700'
                      : 'bg-green-50 border-green-200'
                  }`}
                  style={{ padding: wp(4), borderRadius: wp(4) }}
                >
                  <View
                    className={`${
                      isDarkMode ? 'bg-green-800' : 'bg-green-100'
                    }`}
                    style={{
                      padding: wp(2),
                      borderRadius: 9999,
                      marginRight: wp(3),
                    }}
                  >
                    <MaterialCommunityIcons
                      name="feather"
                      size={wp(6)}
                      color={isDarkMode ? '#4ADE80' : '#16A34A'}
                    />
                  </View>
                  <View>
                    <Text
                      className={`font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                      style={{ fontSize: wp(4) }}
                    >
                      {t('easy')}
                    </Text>
                    <Text
                      className={`${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                      style={{ fontSize: wp(3) }}
                    >
                      {t('easyLabel')}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Medium Option */}
                <TouchableOpacity
                  onPress={() => {
                    if (!isMediumLocked) {
                      onSelect('medium');
                      onClose();
                    }
                  }}
                  activeOpacity={isMediumLocked ? 1 : 0.7}
                  className={`flex-row items-center border-2 ${
                    isMediumLocked
                      ? isDarkMode
                        ? 'bg-gray-800 border-gray-700 opacity-50'
                        : 'bg-gray-100 border-gray-200 opacity-50'
                      : isDarkMode
                      ? 'bg-yellow-900/20 border-yellow-700'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                  style={{ padding: wp(4), borderRadius: wp(4) }}
                >
                  <View
                    className={`${
                      isMediumLocked
                        ? 'bg-gray-500'
                        : isDarkMode
                        ? 'bg-yellow-800'
                        : 'bg-yellow-100'
                    }`}
                    style={{
                      padding: wp(2),
                      borderRadius: 9999,
                      marginRight: wp(3),
                    }}
                  >
                    <MaterialCommunityIcons
                      name={isMediumLocked ? 'lock' : 'shield-outline'}
                      size={wp(6)}
                      color={
                        isMediumLocked
                          ? '#D1D5DB'
                          : isDarkMode
                          ? '#FACC15'
                          : '#CA8A04'
                      }
                    />
                  </View>
                  <View>
                    <Text
                      className={`font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                      style={{ fontSize: wp(4) }}
                    >
                      {t('medium')}
                    </Text>
                    <Text
                      className={`${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                      style={{ fontSize: wp(3) }}
                    >
                      {isMediumLocked
                        ? t('winMoreEasy', {
                            count: MEDIUM_UNLOCK_REQ - wins.easy,
                          })
                        : t('mediumLabel')}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Hard Option */}
                <TouchableOpacity
                  onPress={() => {
                    if (!isHardLocked) {
                      onSelect('hard');
                      onClose();
                    }
                  }}
                  activeOpacity={isHardLocked ? 1 : 0.7}
                  className={`flex-row items-center border-2 ${
                    isHardLocked
                      ? isDarkMode
                        ? 'bg-gray-800 border-gray-700 opacity-50'
                        : 'bg-gray-100 border-gray-200 opacity-50'
                      : isDarkMode
                      ? 'bg-red-900/20 border-red-700'
                      : 'bg-red-50 border-red-200'
                  }`}
                  style={{ padding: wp(4), borderRadius: wp(4) }}
                >
                  <View
                    className={`${
                      isHardLocked
                        ? 'bg-gray-500'
                        : isDarkMode
                        ? 'bg-red-800'
                        : 'bg-red-100'
                    }`}
                    style={{
                      padding: wp(2),
                      borderRadius: 9999,
                      marginRight: wp(3),
                    }}
                  >
                    <MaterialCommunityIcons
                      name={isHardLocked ? 'lock' : 'fire'}
                      size={wp(6)}
                      color={
                        isHardLocked
                          ? '#D1D5DB'
                          : isDarkMode
                          ? '#F87171'
                          : '#DC2626'
                      }
                    />
                  </View>
                  <View>
                    <Text
                      className={`font-bold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                      style={{ fontSize: wp(4) }}
                    >
                      {t('hard')}
                    </Text>
                    <Text
                      className={`${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                      style={{ fontSize: wp(3) }}
                    >
                      {isHardLocked
                        ? t('winMoreMedium', {
                            count: HARD_UNLOCK_REQ - wins.medium,
                          })
                        : t('hardLabel')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
