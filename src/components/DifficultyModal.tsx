import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

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
  // Unlock Thresholds
  const MEDIUM_UNLOCK_REQ = 3;
  const HARD_UNLOCK_REQ = 3;

  // Ensure gamesWon is defined to prevent crashes if not yet hydrated perfectly
  const wins = gamesWon || { easy: 0, medium: 0, hard: 0 };

  const isMediumLocked = wins.easy < MEDIUM_UNLOCK_REQ;
  const isHardLocked = wins.medium < HARD_UNLOCK_REQ;

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
              className={`w-4/5 rounded-2xl p-6 shadow-xl ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text
                  className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  New Game
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <MaterialCommunityIcons
                    name="close"
                    size={24}
                    color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  />
                </TouchableOpacity>
              </View>

              <Text
                className={`mb-4 text-base ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                Choose a difficulty level to start:
              </Text>

              <View className="gap-3">
                {/* Easy Option */}
                <TouchableOpacity
                  onPress={() => {
                    onSelect('easy');
                    onClose();
                  }}
                  className={`p-4 rounded-xl flex-row items-center border-2 ${
                    isDarkMode
                      ? 'bg-green-900/20 border-green-700'
                      : 'bg-green-50 border-green-200'
                  }`}
                >
                  <View
                    className={`p-2 rounded-full mr-3 ${
                      isDarkMode ? 'bg-green-800' : 'bg-green-100'
                    }`}
                  >
                    <MaterialCommunityIcons
                      name="feather"
                      size={24}
                      color={isDarkMode ? '#4ADE80' : '#16A34A'}
                    />
                  </View>
                  <View>
                    <Text
                      className={`font-bold text-lg ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Easy
                    </Text>
                    <Text
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      Relaxing & Fun
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
                  className={`p-4 rounded-xl flex-row items-center border-2 ${
                    isMediumLocked
                      ? isDarkMode
                        ? 'bg-gray-800 border-gray-700 opacity-50'
                        : 'bg-gray-100 border-gray-200 opacity-50'
                      : isDarkMode
                      ? 'bg-yellow-900/20 border-yellow-700'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <View
                    className={`p-2 rounded-full mr-3 ${
                      isMediumLocked
                        ? 'bg-gray-500'
                        : isDarkMode
                        ? 'bg-yellow-800'
                        : 'bg-yellow-100'
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={isMediumLocked ? 'lock' : 'shield-outline'}
                      size={24}
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
                      className={`font-bold text-lg ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Medium
                    </Text>
                    <Text
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {isMediumLocked
                        ? `Win ${MEDIUM_UNLOCK_REQ - wins.easy} more Easy`
                        : 'Good Workout'}
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
                  className={`p-4 rounded-xl flex-row items-center border-2 ${
                    isHardLocked
                      ? isDarkMode
                        ? 'bg-gray-800 border-gray-700 opacity-50'
                        : 'bg-gray-100 border-gray-200 opacity-50'
                      : isDarkMode
                      ? 'bg-red-900/20 border-red-700'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <View
                    className={`p-2 rounded-full mr-3 ${
                      isHardLocked
                        ? 'bg-gray-500'
                        : isDarkMode
                        ? 'bg-red-800'
                        : 'bg-red-100'
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={isHardLocked ? 'lock' : 'fire'}
                      size={24}
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
                      className={`font-bold text-lg ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Hard
                    </Text>
                    <Text
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                    >
                      {isHardLocked
                        ? `Win ${HARD_UNLOCK_REQ - wins.medium} more Medium`
                        : 'Challenge Yourself'}
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
