import React from 'react';
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
  const rotation = useSharedValue(0);
  const completedTutorials = useSelector(
    (state: RootState) => state.progress.completedTutorials,
  );

  React.useEffect(() => {
    rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 300 });
  }, [isExpanded]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const relevantTutorials = TUTORIAL_DATA[item.id] || [];

  return (
    <Animated.View
      layout={LinearTransition.duration(300)}
      className={`mb-4 rounded-xl border-2 overflow-hidden ${
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
        className="p-4 flex-row items-center justify-between"
      >
        <View className="flex-1 flex-row items-center mr-2">
          <Text
            numberOfLines={1}
            className={`font-bold text-lg flex-shrink ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            {item.title}
          </Text>
          <View
            className={`ml-2 px-2 py-0.5 rounded-full ${
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
          >
            <Text
              className={`text-xs font-bold ${
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
            >
              {item.difficulty}
            </Text>
          </View>
        </View>
        <Animated.View style={chevronStyle}>
          <MaterialCommunityIcons
            name="chevron-down"
            size={24}
            color={isExpanded ? '#3B82F6' : '#9CA3AF'}
          />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          entering={FadeIn}
          exiting={FadeOut}
          className="px-4 pb-4"
        >
          <Text
            className={`leading-5 mb-4 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {item.description}
          </Text>

          <Text
            className={`font-bold mb-2 ${
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            }`}
          >
            Interactive Lessons:
          </Text>
          <View className="gap-2">
            {relevantTutorials.map((tut, idx) => {
              const isCompleted = completedTutorials.includes(tut.id);

              return (
                <TouchableOpacity
                  key={tut.id}
                  onPress={() => onLessonStart(tut)}
                  className={`p-3 rounded-lg flex-row items-center active:opacity-70 ${
                    isDarkMode
                      ? 'bg-blue-900/40'
                      : 'bg-white border border-blue-200'
                  }`}
                >
                  <View
                    className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                      isCompleted
                        ? isDarkMode
                          ? 'bg-green-600'
                          : 'bg-green-100'
                        : isDarkMode
                        ? 'bg-blue-600'
                        : 'bg-blue-100'
                    }`}
                  >
                    {isCompleted ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={16}
                        color={isDarkMode ? 'white' : '#15803d'}
                      />
                    ) : (
                      <Text
                        className={`font-bold ${
                          isDarkMode ? 'text-white' : 'text-blue-700'
                        }`}
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
                      {tut.title}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={isCompleted ? 'check-circle' : 'play-circle-outline'}
                    size={24}
                    color={
                      isCompleted
                        ? '#22c55e' // Green-500
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
