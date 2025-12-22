import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Linking,
  Platform,
} from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface UpdateModalProps {
  visible: boolean;
  storeUrl: string;
  isDarkMode: boolean;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  storeUrl,
  isDarkMode,
}) => {
  const { t } = useTranslation();

  const handleUpdatePress = () => {
    Linking.openURL(storeUrl).catch(err =>
      console.error('An error occurred', err),
    );
  };

  return (
    <Modal
      key="update-modal"
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View
        className="flex-1 items-center justify-center bg-black/80"
        style={{ padding: wp(6) }}
      >
        <View
          className={`w-full items-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{
            padding: wp(6),
            borderRadius: wp(5),
            gap: wp(4),
            elevation: 10,
          }}
        >
          <View className="bg-blue-100 rounded-full" style={{ padding: wp(4) }}>
            <MaterialCommunityIcons
              name="rocket-launch"
              size={wp(10)}
              color="#2563EB"
            />
          </View>

          <Text
            className={`font-bold text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            style={{ fontSize: wp(6) }}
          >
            {t('updateAvailable')}
          </Text>

          <Text
            className={`text-center font-medium ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
            style={{ fontSize: wp(4) }}
          >
            {t('updateDesc')}
          </Text>

          <TouchableOpacity
            onPress={handleUpdatePress}
            className="w-full bg-blue-600 rounded-xl items-center justify-center active:bg-blue-700"
            style={{ paddingVertical: wp(4), marginTop: wp(2) }}
          >
            <Text
              className="text-white font-bold"
              style={{ fontSize: wp(4.5) }}
            >
              {t('updateNow')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
