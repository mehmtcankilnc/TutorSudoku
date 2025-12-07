import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from 'react-native';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface TutorBubbleProps {
  message: string;
  onDismiss: () => void;
  position?: 'above' | 'below';
  align?: 'left' | 'right';
}

export const TutorBubble: React.FC<TutorBubbleProps> = ({
  message,
  onDismiss,
  position = 'above',
  align = 'left',
}) => {
  const { t } = useTranslation();
  const containerClass = position === 'above' ? 'bottom-12' : 'top-12';
  // Use inline styles for positioning to guarantee behavior over tailwind classes if conflicts arise
  const positionStyle = align === 'left' ? { left: 0 } : { right: 0 };

  return (
    <View
      className={`absolute z-50 ${containerClass}`}
      style={[positionStyle, { width: wp(45) }]}
      pointerEvents="box-none"
    >
      {position === 'below' && (
        <View
          className={`absolute -top-2 w-4 h-4 bg-white border-t border-l border-blue-200 transform rotate-45 shadow-sm z-10 ${
            align === 'left' ? 'left-4' : 'right-4'
          }`}
        />
      )}
      <TouchableOpacity
        onPress={onDismiss}
        activeOpacity={0.9}
        className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-blue-200 elevation-10 mb-2 relative z-20"
      >
        <Text className="text-blue-900 font-bold text-xs mb-1">
          {t('tutorSays')}
        </Text>
        {message.split('\n').map((line, index) => (
          <Text
            key={index}
            className={`text-gray-700 text-xs leading-4 ${
              line.startsWith('Technique:')
                ? 'font-bold text-blue-800 mb-1'
                : ''
            }`}
          >
            {line}
          </Text>
        ))}
      </TouchableOpacity>
      {position === 'above' && (
        <View
          className={`absolute bottom-0 w-4 h-4 bg-white border-b border-r border-blue-200 transform rotate-45 translate-y-2 shadow-sm z-10 ${
            align === 'left' ? 'left-4' : 'right-4'
          }`}
        />
      )}
    </View>
  );
};
