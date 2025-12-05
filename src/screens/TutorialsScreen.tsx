import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { TUTORIAL_DATA, TutorialScenario } from '../data/TutorialData';
import { InteractiveLesson } from '../components/InteractiveLesson';

interface Technique {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  example: string;
}

const TECHNIQUES: Technique[] = [
  {
    id: '1',
    title: 'Naked Single',
    difficulty: 'Beginner',
    description:
      'When a cell has only one possible candidate remaining, that number implies the solution for that cell.',
    example:
      'If a cell can only be "5" because 1-4 and 6-9 are already in the row, col, or box, fill it in!',
  },
  {
    id: '2',
    title: 'Hidden Single',
    difficulty: 'Beginner',
    description:
      'When a number can only go in one specific cell within a row, column, or box, even if that cell has other candidates.',
    example:
      'In a 3x3 box, if the number "7" can only be placed in the top-right cell (because other cells are blocked), it must go there.',
  },
  {
    id: '3',
    title: 'Locked Candidates (Pointing)',
    difficulty: 'Intermediate',
    description:
      'If a candidate number is restricted to a single row or column within a 3x3 box, you can eliminate that number from the rest of that row or column outside the box.',
    example:
      'If "3"s in Box 1 are only in the top row, then no other cell in the top row (in Box 2 or 3) can be a 3.',
  },
  {
    id: '4',
    title: 'Naked Pairs',
    difficulty: 'Intermediate',
    description:
      'If two cells in a unit (row/col/box) contain exactly the same two candidates (e.g., 2 & 7), those numbers must be in those two cells. You can remove them from all other cells in that unit.',
    example:
      'Cells A1 and A2 both have candidates {2, 7}. No other cell in Row A can have 2 or 7.',
  },
];

export const TutorialsScreen: React.FC = () => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [activeLesson, setActiveLesson] =
    React.useState<TutorialScenario | null>(null);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  if (activeLesson) {
    return (
      <InteractiveLesson
        lesson={activeLesson}
        onClose={() => setActiveLesson(null)}
        onComplete={() => setActiveLesson(null)}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <View
      className={`flex-1 pt-12 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
    >
      <View className="mb-6">
        <Text
          className={`text-3xl font-extrabold ${
            isDarkMode ? 'text-blue-400' : 'text-blue-900'
          }`}
        >
          Learn Sudoku
        </Text>
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Master techniques from beginner to pro
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {TECHNIQUES.map(tech => {
          const isExpanded = expandedId === tech.id;
          const relevantTutorials = TUTORIAL_DATA[tech.id] || [];

          return (
            <TouchableOpacity
              key={tech.id}
              activeOpacity={0.9}
              onPress={() => setExpandedId(isExpanded ? null : tech.id)}
              className={`mb-4 rounded-xl border-2 overflow-hidden
                            ${
                              isExpanded
                                ? isDarkMode
                                  ? 'border-blue-500 bg-gray-800'
                                  : 'border-blue-500 bg-blue-50'
                                : isDarkMode
                                ? 'border-gray-700 bg-gray-800'
                                : 'border-gray-200 bg-white'
                            }`}
            >
              <View className="p-4 flex-row justify-between items-center">
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text
                      className={`font-bold text-lg mr-2 ${
                        isDarkMode ? 'text-gray-100' : 'text-gray-800'
                      }`}
                    >
                      {tech.title}
                    </Text>
                    <View
                      className={`px-2 py-0.5 rounded-full ${
                        tech.difficulty === 'Beginner'
                          ? isDarkMode
                            ? 'bg-green-900'
                            : 'bg-green-100'
                          : tech.difficulty === 'Intermediate'
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
                          tech.difficulty === 'Beginner'
                            ? isDarkMode
                              ? 'text-green-400'
                              : 'text-green-700'
                            : tech.difficulty === 'Intermediate'
                            ? isDarkMode
                              ? 'text-yellow-400'
                              : 'text-yellow-700'
                            : isDarkMode
                            ? 'text-red-400'
                            : 'text-red-700'
                        }`}
                      >
                        {tech.difficulty}
                      </Text>
                    </View>
                  </View>
                  {isExpanded && (
                    <View className="mt-2">
                      <Text
                        className={`leading-5 mb-4 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        {tech.description}
                      </Text>

                      <Text
                        className={`font-bold mb-2 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}
                      >
                        Interactive Lessons:
                      </Text>
                      <View className="gap-2">
                        {relevantTutorials.map((tut, idx) => (
                          <TouchableOpacity
                            key={tut.id}
                            onPress={e => {
                              e.stopPropagation(); // Prevent closing accordion
                              setActiveLesson(tut);
                            }}
                            className={`p-3 rounded-lg flex-row items-center active:opacity-70 ${
                              isDarkMode
                                ? 'bg-blue-900/40'
                                : 'bg-white border border-blue-200'
                            }`}
                          >
                            <View
                              className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                                isDarkMode ? 'bg-blue-600' : 'bg-blue-100'
                              }`}
                            >
                              <Text
                                className={`font-bold ${
                                  isDarkMode ? 'text-white' : 'text-blue-700'
                                }`}
                              >
                                {idx + 1}
                              </Text>
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
                              name="play-circle-outline"
                              size={24}
                              color={isDarkMode ? '#60A5FA' : '#3B82F6'}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
                <View className="ml-2">
                  <MaterialCommunityIcons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={isExpanded ? '#3B82F6' : '#9CA3AF'}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View className="h-24" />
      </ScrollView>
    </View>
  );
};
