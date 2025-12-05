import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAlert } from '../context/AlertContext';
interface ScanScreenProps {
}
export const ScanScreen: React.FC<ScanScreenProps> = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const navigation = useNavigation<NavigationProp<any>>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showAlert } = useAlert();
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: 'Camera Permission',
              message: 'TutorSudoku needs access to your camera to scan puzzles.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.warn(err);
          return false;
        }
      }
      return true;
  };
  const handleCameraLaunch = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
        showAlert('Permission Denied', 'Camera permission is required to scan Sudoku puzzles.', [{ text: 'OK' }]);
        return;
    }
    try {
      const cropperTheme = isDarkMode ? {
          toolbar: '#1F2937',
          status: '#111827',
          widget: '#FFFFFF',
          active: '#60A5FA',
      } : {
          toolbar: '#FFFFFF',
          status: '#E5E7EB',
          widget: '#111827',
          active: '#3B82F6',
      };
      const image = await ImagePicker.openCamera({
        mediaType: 'photo',
        cropping: true,
        freeStyleCropEnabled: true,
        width: 1000, 
        height: 1000,
        includeBase64: false,
        cropperToolbarTitle: 'Align Grid Utility',
        hideBottomControls: false, 
        enableRotationGesture: true,
        cropperToolbarColor: cropperTheme.toolbar,
        cropperStatusBarColor: cropperTheme.status,
        cropperToolbarWidgetColor: cropperTheme.widget,
        cropperActiveWidgetColor: cropperTheme.active,
        showCropGuidelines: true,
      });
      if (image && image.path) {
        setImageUri(image.path);
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
          console.log('Error launching camera:', error);
          showAlert('Error', 'Could not open camera.');
      }
    }
  };
  const parseSudokuFromText = (result: any): (number | null)[][] | null => {
      const allNumbers: { val: number, centerX: number, centerY: number }[] = [];
      if (result.blocks && result.blocks.length > 0) {
          result.blocks.forEach((block: any) => {
              if (block.lines) {
                  block.lines.forEach((line: any) => {
                      if (line.elements) {
                          line.elements.forEach((element: any) => {
                              const text = element.text;
                              const frame = element.frame || element.rect || element.boundingBox;
                              if (frame) {
                                  const x = frame.x ?? frame.left ?? 0;
                                  const y = frame.y ?? frame.top ?? 0;
                                  const width = frame.width ?? (frame.right - frame.left) ?? 0;
                                  const height = frame.height ?? (frame.bottom - frame.top) ?? 0;
                                  const chars = text.split('');
                                  const charWidth = width / chars.length;
                                  chars.forEach((char: string, index: number) => {
                                      if (/[1-9]/.test(char)) {
                                          const val = parseInt(char, 10);
                                          const centerX = x + (index * charWidth) + (charWidth / 2);
                                          const centerY = y + (height / 2);
                                          if (!isNaN(centerX) && !isNaN(centerY)) {
                                              allNumbers.push({ val, centerX, centerY });
                                          }
                                      }
                                  });
                              }
                          });
                      }
                  });
              }
          });
      }
      if (allNumbers.length < 10) return null;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      allNumbers.forEach(n => {
          if (n.centerX < minX) minX = n.centerX;
          if (n.centerX > maxX) maxX = n.centerX;
          if (n.centerY < minY) minY = n.centerY;
          if (n.centerY > maxY) maxY = n.centerY;
      });
      const widthSpan = maxX - minX;
      const heightSpan = maxY - minY;
      if (widthSpan <= 0 || heightSpan <= 0) return null;
      const avgCellWidth = widthSpan / 8;
      const avgCellHeight = heightSpan / 8;
      const grid: (number | null)[][] = Array(9).fill(null).map(() => Array(9).fill(null));
      allNumbers.forEach(n => {
          const colIndex = Math.round((n.centerX - minX) / avgCellWidth);
          const rowIndex = Math.round((n.centerY - minY) / avgCellHeight);
          if (rowIndex >= 0 && rowIndex <= 8 && colIndex >= 0 && colIndex <= 8) {
              grid[rowIndex][colIndex] = n.val;
          }
      });
      return grid;
  };
  const processImage = async () => {
    if (!imageUri) return;
    setIsProcessing(true);
    try {
      const result = await TextRecognition.recognize(imageUri);
      const parsedGrid = parseSudokuFromText(result);
      if (parsedGrid) {
          showAlert(
              'Sudoku Detected',
              'We found a puzzle! Would you like to load it into the game?',
              [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                      text: 'Load Game', 
                      onPress: () => {
                          navigation.navigate('Play', { scannedBoard: parsedGrid });
                          setImageUri(null); 
                      } 
                  }
              ]
          );
      } else {
          showAlert('No Sudoku Found', 'We couldn\'t recognize enough numbers. Try to capture a clear, close-up image of the grid.', [{text: 'OK'}]);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      showAlert('Error', 'Failed to process image.');
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <View className={`flex-1 pt-12 px-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <View className="mb-6">
            <Text className={`text-3xl font-extrabold ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>Scan Puzzle</Text>
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Capture a Sudoku to solve instantly</Text>
        </View>
        <View className="flex-1 items-center justify-center">
            {imageUri ? (
                <View className="w-full aspect-square rounded-xl overflow-hidden mb-8 border-4 border-blue-500 shadow-xl relative">
                    <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                    <TouchableOpacity 
                        onPress={() => setImageUri(null)}
                        className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                    >
                        <MaterialCommunityIcons name="close" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity 
                    onPress={handleCameraLaunch}
                    className={`w-full aspect-square rounded-xl border-4 border-dashed items-center justify-center mb-8 
                        ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}
                >
                    <MaterialCommunityIcons 
                        name="camera-plus-outline" 
                        size={64} 
                        color={isDarkMode ? "#60A5FA" : "#3B82F6"} 
                    />
                    <Text className={`mt-4 font-bold text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tap to Take Photo</Text>
                </TouchableOpacity>
            )}
            {imageUri && (
                <TouchableOpacity
                    onPress={processImage}
                    disabled={isProcessing}
                    className={`w-full py-4 rounded-xl flex-row items-center justify-center 
                        ${isProcessing ? 'bg-gray-500' : 'bg-blue-600 active:bg-blue-700'}`}
                >
                    {isProcessing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="text-recognition" size={24} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">Process Image</Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
        </View>
    </View>
  );
};
