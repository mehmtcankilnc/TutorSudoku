/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  onDismiss,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View
        className="flex-1 justify-center items-center bg-black/50"
        style={{ paddingHorizontal: wp(5) }}
      >
        <Animated.View
          style={{ opacity: fadeAnim, padding: wp(5), borderRadius: wp(4) }}
          className={`w-full max-w-sm shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <Text
            className={`font-bold text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{ fontSize: wp(5), marginBottom: wp(2) }}
          >
            {title}
          </Text>
          {message && (
            <Text
              className={`text-base text-center ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
              style={{ marginBottom: wp(5) }}
            >
              {message}
            </Text>
          )}

          <View
            className={`flex-row justify-center ${
              buttons.length > 2 ? 'flex-col' : ''
            }`}
            style={{ gap: wp(3) }}
          >
            {buttons.map((btn, index) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';

              let bgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
              let textClass = isDarkMode ? 'text-white' : 'text-gray-800';

              if (!isCancel && !isDestructive) {
                bgClass = 'bg-blue-600';
                textClass = 'text-white';
              } else if (isDestructive) {
                bgClass = isDarkMode ? 'bg-red-900' : 'bg-red-100';
                textClass = 'text-red-500';
              }

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    if (btn.onPress) btn.onPress();
                    if (onDismiss) onDismiss();
                  }}
                  className={`min-w-[100px] items-center ${bgClass} ${
                    buttons.length === 1 ? 'w-full' : 'flex-1'
                  }`}
                  style={{
                    paddingHorizontal: wp(4),
                    paddingVertical: wp(3),
                    borderRadius: wp(4),
                  }}
                >
                  <Text className={`font-bold ${textClass}`}>{btn.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
