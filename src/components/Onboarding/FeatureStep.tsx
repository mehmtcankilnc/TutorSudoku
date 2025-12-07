import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface FeatureStepProps {
  isDarkMode: boolean;
  imageSource: ImageSourcePropType;
  title: string;
  description: string;
}

export const FeatureStep: React.FC<FeatureStepProps> = ({
  isDarkMode,
  imageSource,
  title,
  description,
}) => {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ padding: wp('6%') }}
    >
      <Image
        source={imageSource}
        className="mb-8 rounded-3xl"
        style={{ width: wp('80%'), height: wp('80%') }}
        resizeMode="contain"
      />
      <Text
        className={`text-3xl font-extrabold text-center mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
      >
        {title}
      </Text>
      <Text
        className={`text-lg text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {description}
      </Text>
    </View>
  );
};
