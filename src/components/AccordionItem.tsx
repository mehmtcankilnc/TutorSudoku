/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  LinearTransition,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { TUTORIAL_DATA } from '../data/TutorialData';
import { Technique } from '../types';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

interface AccordionItemProps {
  item: Technique;
  isExpanded: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
  onLessonStart: (lesson: any) => void;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  item,
  isExpanded,
  onToggle,
  isDarkMode,
  onLessonStart,
}) => {
  const { t } = useTranslation();
  const rotation = useSharedValue(0);
  const completedTutorials = useSelector(
    (state: RootState) => state.progress.completedTutorials,
  );

  React.useEffect(() => {
    rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const relevantTutorials = TUTORIAL_DATA[item.id] || [];

  return (
    <Animated.View
      layout={LinearTransition.duration(300)}
      style={{ borderWidth: 2, borderRadius: wp(3), marginBottom: wp(1) }}
      className={`overflow-hidden ${
        isExpanded
          ? isDarkMode
            ? 'border-blue-500 bg-gray-800'
            : 'border-blue-500 bg-blue-50'
          : isDarkMode
          ? 'border-gray-700 bg-gray-800'
          : 'border-gray-200 bg-white'
      }`}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onToggle}
        className="flex-row items-center justify-between"
        style={{ padding: wp(3) }}
      >
        <View
          className="flex-1 flex-row items-center"
          style={{ marginRight: wp(2) }}
        >
          <Text
            numberOfLines={1}
            className={`font-bold flex-shrink ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}
            style={{ fontSize: wp(4) }}
          >
            {t(item.title)}
          </Text>
          <View
            className={`${
              item.difficulty === 'Beginner'
                ? isDarkMode
                  ? 'bg-green-900'
                  : 'bg-green-100'
                : item.difficulty === 'Intermediate'
                ? isDarkMode
                  ? 'bg-yellow-900'
                  : 'bg-yellow-100'
                : isDarkMode
                ? 'bg-red-900'
                : 'bg-red-100'
            }`}
            style={{
              marginLeft: wp(2),
              paddingHorizontal: wp(2),
              paddingVertical: wp(1),
              borderRadius: 9999,
            }}
          >
            <Text
              className={`font-bold ${
                item.difficulty === 'Beginner'
                  ? isDarkMode
                    ? 'text-green-400'
                    : 'text-green-700'
                  : item.difficulty === 'Intermediate'
                  ? isDarkMode
                    ? 'text-yellow-400'
                    : 'text-yellow-700'
                  : isDarkMode
                  ? 'text-red-400'
                  : 'text-red-700'
              }`}
              style={{ fontSize: wp(3) }}
            >
              {t(item.difficulty.toLowerCase())}
            </Text>
          </View>
        </View>
        <Animated.View style={chevronStyle}>
          <MaterialCommunityIcons
            name="chevron-down"
            size={wp(6)}
            color={isExpanded ? '#3B82F6' : '#9CA3AF'}
          />
        </Animated.View>
      </TouchableOpacity>
      {isExpanded && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          style={{ paddingHorizontal: wp(3), paddingBottom: wp(3) }}
        >
          <Text
            className={`leading-5 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
            style={{ marginBottom: wp(4) }}
          >
            {t(item.description)}
          </Text>
          <Text
            className={`font-bold ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}
            style={{ marginBottom: wp(2) }}
          >
            {t('interactiveLessons')}
          </Text>
          <View style={{ gap: wp(2) }}>
            {relevantTutorials.map((tut, idx) => {
              const isCompleted = completedTutorials.includes(tut.id);

              return (
                <TouchableOpacity
                  key={tut.id}
                  onPress={() => onLessonStart(tut)}
                  className={`flex-row items-center active:opacity-70 ${
                    isDarkMode
                      ? 'bg-blue-900/40'
                      : 'bg-white border border-blue-200'
                  }`}
                  style={{ padding: wp(3), borderRadius: wp(2) }}
                >
                  <View
                    className={`items-center justify-center ${
                      isCompleted
                        ? isDarkMode
                          ? 'bg-green-600'
                          : 'bg-green-100'
                        : isDarkMode
                        ? 'bg-blue-600'
                        : 'bg-blue-100'
                    }`}
                    style={{
                      width: wp(8),
                      height: wp(8),
                      borderRadius: 9999,
                      marginRight: wp(2),
                    }}
                  >
                    {isCompleted ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={wp(5)}
                        color={isDarkMode ? 'white' : '#15803d'}
                      />
                    ) : (
                      <Text
                        className={`font-bold ${
                          isDarkMode ? 'text-white' : 'text-blue-700'
                        }`}
                        style={{ fontSize: wp(3) }}
                      >
                        {idx + 1}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-semibold ${
                        isDarkMode ? 'text-blue-100' : 'text-gray-900'
                      }`}
                    >
                      {t(tut.title)}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={isCompleted ? 'check-circle' : 'play-circle-outline'}
                    size={wp(7)}
                    color={
                      isCompleted
                        ? '#22c55e'
                        : isDarkMode
                        ? '#60A5FA'
                        : '#3B82F6'
                    }
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );
};
