import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface GameTimerProps {
  isRunning: boolean;
  isDarkMode: boolean;
  onTimeUpdate?: (seconds: number) => void;
  initialTime?: number;
}

export const GameTimer: React.FC<GameTimerProps> = ({
  isRunning,
  isDarkMode,
  onTimeUpdate,
  initialTime = 0,
}) => {
  const [seconds, setSeconds] = useState(initialTime);

  useEffect(() => {
    setSeconds(initialTime);
  }, [initialTime]);

  useEffect(() => {
    let interval: any;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          const next = prev + 1;
          onTimeUpdate?.(next); // Notify parent if needed, but don't re-render parent
          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, onTimeUpdate]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-row items-center">
      <MaterialCommunityIcons name="clock-outline" size={24} color="#3B82F6" />
      <Text
        className={`font-bold text-xl ml-1 ${
          isDarkMode ? 'text-blue-400' : 'text-blue-900'
        }`}
      >
        {formatTime(seconds)}
      </Text>
    </View>
  );
};
