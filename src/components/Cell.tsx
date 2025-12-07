/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

interface CellProps {
  value: number | null;
  candidates?: number[];
  onPress?: () => void;
  isSelected?: boolean;
  isRelated?: boolean;
  isConflictSource?: boolean;
  isEditable?: boolean;
  isInvalid?: boolean;
  shouldShake?: boolean;
  isSuccess?: boolean;
  successDelay?: number;
  isDarkMode?: boolean;
  size?: number;
}

export const Cell = React.memo<CellProps>(
  ({
    value,
    candidates,
    onPress,
    isSelected,
    isRelated,
    isConflictSource,
    isEditable = true,
    isInvalid = false,
    shouldShake = false,
    isSuccess = false,
    successDelay = 0,
    isDarkMode = false,
    size = 40,
  }) => {
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const successAnim = useRef(new Animated.Value(0)).current;

    // Shake Animation (Wrong Move)
    useEffect(() => {
      if (shouldShake) {
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 50,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [shouldShake]);

    // Success Wave Animation
    useEffect(() => {
      if (isSuccess) {
        Animated.sequence([
          Animated.delay(successDelay),
          Animated.parallel([
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(successAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      } else {
        Animated.timing(successAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }, [isSuccess, successDelay]);

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!isEditable && !onPress}
        activeOpacity={0.7}
        style={{ width: size, height: size }}
      >
        <Animated.View
          style={{
            width: size,
            height: size,
            transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
          }}
          className={`border items-center justify-center overflow-hidden relative
            ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}
            ${
              isSelected
                ? isDarkMode
                  ? 'bg-blue-800'
                  : 'bg-blue-300'
                : isConflictSource
                ? isDarkMode
                  ? 'bg-red-900 border-red-700 border-2'
                  : 'bg-red-200 border-red-500 border-2'
                : isRelated
                ? isDarkMode
                  ? 'bg-gray-800'
                  : 'bg-blue-100'
                : isEditable
                ? isDarkMode
                  ? 'bg-gray-900'
                  : 'bg-white'
                : isDarkMode
                ? 'bg-slate-800'
                : 'bg-gray-100'
            }`}
        >
          {/* Success Overlay */}
          <Animated.View
            style={{ opacity: successAnim }}
            className={`absolute inset-0 z-0 ${
              isDarkMode
                ? 'bg-green-800 border-green-600'
                : 'bg-green-400 border-green-600 border-2'
            }`}
          />
          {value !== null ? (
            <Text
              style={{ fontSize: size * 0.6 }}
              className={`z-10 
                ${
                  isEditable
                    ? isDarkMode
                      ? 'text-blue-400 font-normal'
                      : 'text-blue-600 font-normal'
                    : isDarkMode
                    ? 'text-gray-100 font-bold'
                    : 'text-black font-bold'
                } 
                ${isInvalid ? 'text-red-500' : ''}
            `}
            >
              {value}
            </Text>
          ) : (
            candidates &&
            candidates.length > 0 && (
              <View className="flex-row flex-wrap w-full h-full z-10">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <View
                    key={num}
                    style={{
                      width: '33.33%',
                      height: '33.33%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: size * 0.22,
                        lineHeight: size * 0.24,
                      }}
                      className={`${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      } font-medium`}
                    >
                      {candidates.includes(num) ? num : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  },
);
