import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export interface AlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message?: string;
    buttons?: AlertButton[];
    onDismiss?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ 
    visible, 
    title, 
    message, 
    buttons = [{ text: 'OK', style: 'default' }],
    onDismiss 
}) => {
    const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
    const [fadeAnim] = React.useState(new Animated.Value(0));

    React.useEffect(() => {
        if (visible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
            <View className="flex-1 justify-center items-center bg-black/50 px-6">
                <Animated.View 
                    style={{ opacity: fadeAnim }}
                    className={`w-full max-w-sm p-6 rounded-2xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                    <Text className={`text-xl font-bold mb-2 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                    </Text>
                    {message && (
                        <Text className={`text-base text-center mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {message}
                        </Text>
                    )}
                    
                    <View className={`flex-row justify-center gap-3 ${buttons.length > 2 ? 'flex-col' : ''}`}>
                        {buttons.map((btn, index) => {
                            const isCancel = btn.style === 'cancel';
                            const isDestructive = btn.style === 'destructive';
                            
                            // Base style logic
                            let bgClass = isDarkMode ? 'bg-gray-700' : 'bg-gray-100';
                            let textClass = isDarkMode ? 'text-white' : 'text-gray-800';
                            
                            if (!isCancel && !isDestructive) { // Primary/Default
                                bgClass = 'bg-blue-600';
                                textClass = 'text-white';
                            } else if (isDestructive) {
                                bgClass = isDarkMode ? 'bg-red-900' : 'bg-red-100';
                                textClass = 'text-red-500';
                            }

                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        if (btn.onPress) btn.onPress();
                                        if (onDismiss) onDismiss();
                                    }}
                                    className={`px-4 py-3 rounded-xl min-w-[100px] items-center ${bgClass} ${buttons.length === 1 ? 'w-full' : 'flex-1'}`}
                                >
                                    <Text className={`font-bold ${textClass}`}>
                                        {btn.text}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};
