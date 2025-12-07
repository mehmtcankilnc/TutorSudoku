/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, ScrollView, BackHandler } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { RootState } from '../store/store';
import { TutorialScenario } from '../data/TutorialData';
import { TECHNIQUES } from '../data/Techniques';
import { InteractiveLesson } from '../components/InteractiveLesson';
import { AccordionItem } from '../components/AccordionItem';
import { markTutorialComplete } from '../store/progressSlice';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const TutorialsScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [activeLesson, setActiveLesson] =
    React.useState<TutorialScenario | null>(null);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (activeLesson) {
          setActiveLesson(null);
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [activeLesson]),
  );

  const toggleSection = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleLessonComplete = async () => {
    if (activeLesson) {
      dispatch(markTutorialComplete(activeLesson.id));
      setActiveLesson(null);

      try {
        const current = await AsyncStorage.getItem('user_progress');
        let completed = current ? JSON.parse(current) : [];
        if (!completed.includes(activeLesson.id)) {
          completed.push(activeLesson.id);
          await AsyncStorage.setItem(
            'user_progress',
            JSON.stringify(completed),
          );
        }
      } catch (e) {
        console.error('Failed to save progress', e);
      }
    }
  };

  if (activeLesson) {
    return (
      <InteractiveLesson
        lesson={activeLesson}
        onClose={() => setActiveLesson(null)}
        onComplete={handleLessonComplete}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <View
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}
      style={{ paddingHorizontal: wp(6), paddingTop: hp(6) }}
    >
      <View style={{ marginBottom: wp(2) }}>
        <Text
          className={`font-extrabold ${
            isDarkMode ? 'text-blue-400' : 'text-blue-900'
          }`}
          style={{ fontSize: wp(8) }}
        >
          {t('learnSudoku')}
        </Text>
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {t('learnSudokuDesc')}
        </Text>
      </View>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={false}
        contentContainerStyle={{ flexGrow: 1, gap: wp(2) }}
      >
        {TECHNIQUES.map(tech => (
          <AccordionItem
            key={tech.id}
            item={tech}
            isExpanded={expandedId === tech.id}
            onToggle={() => toggleSection(tech.id)}
            isDarkMode={isDarkMode}
            onLessonStart={setActiveLesson}
          />
        ))}
      </ScrollView>
    </View>
  );
};
