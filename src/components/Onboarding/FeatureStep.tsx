import React from 'react';
import { View, Text, Image, ImageSourcePropType } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

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
      style={{ padding: wp('6%'), paddingBottom: hp('20%') }}
    >
      <Image
        source={imageSource}
        className="mb-8 rounded-3xl"
        style={{
          width: wp('70%'),
          height: wp('70%'),
          maxHeight: hp('35%'),
          maxWidth: hp('35%'),
        }}
        resizeMode="contain"
      />
      <Text
        className={`font-extrabold text-center mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}
        style={{ fontSize: wp('7%') }}
      >
        {title}
      </Text>
      <Text
        className={`text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
        style={{ fontSize: wp('4.5%') }}
      >
        {description}
      </Text>
    </View>
  );
};
