import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';

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

  const onTimeUpdateRef = React.useRef(onTimeUpdate);

  React.useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    let interval: any;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => {
          const next = prev + 1;
          onTimeUpdateRef.current?.(next);
          return next;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-row items-center">
      <MaterialCommunityIcons
        name="clock-outline"
        size={wp(6)}
        color="#3B82F6"
      />
      <Text
        className={`font-bold ${
          isDarkMode ? 'text-blue-400' : 'text-blue-900'
        }`}
        style={{ marginLeft: wp(1), fontSize: wp(5) }}
      >
        {formatTime(seconds)}
      </Text>
    </View>
  );
};
