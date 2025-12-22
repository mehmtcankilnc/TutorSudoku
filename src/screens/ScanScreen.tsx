import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAlert } from '../context/AlertContext';
import { VerificationView } from '../components/VerificationView';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTranslation } from 'react-i18next';

interface ScanScreenProps {}

export const ScanScreen: React.FC<ScanScreenProps> = () => {
  const { t } = useTranslation();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const navigation = useNavigation<NavigationProp<any>>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationBoard, setVerificationBoard] = useState<
    (number | null)[][] | null
  >(null);
  const { showAlert } = useAlert();

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t('cameraPermissionTitle'),
            message: t('cameraPermissionMsg'),
            buttonNeutral: t('askMeLater'),
            buttonNegative: t('cancel'),
            buttonPositive: t('ok'),
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
      showAlert(t('permissionDenied'), t('cameraPermissionRequired'), [
        { text: t('ok') },
      ]);
      return;
    }

    try {
      const cropperTheme = isDarkMode
        ? {
            toolbar: '#1F2937',
            status: '#111827',
            widget: '#FFFFFF',
            active: '#60A5FA',
          }
        : {
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
        cropperToolbarTitle: t('alignGrid'),
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
        setImageDims({ width: image.width, height: image.height });
        setVerificationBoard(null); // Reset any previous verification
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Error launching camera:', error);
        showAlert(t('error'), t('openCameraError'));
      }
    }
  };

  const handleGalleryLaunch = async () => {
    try {
      const cropperTheme = isDarkMode
        ? {
            toolbar: '#1F2937',
            status: '#111827',
            widget: '#FFFFFF',
            active: '#60A5FA',
          }
        : {
            toolbar: '#FFFFFF',
            status: '#E5E7EB',
            widget: '#111827',
            active: '#3B82F6',
          };

      const image = await ImagePicker.openPicker({
        mediaType: 'photo',
        cropping: true,
        freeStyleCropEnabled: true,
        width: 1000,
        height: 1000,
        includeBase64: false,
        cropperToolbarTitle: t('alignGrid'),
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
        setImageDims({ width: image.width, height: image.height });
        setVerificationBoard(null);
      }
    } catch (error: any) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log('Error launching gallery:', error);
        showAlert(t('error'), t('openGalleryError'));
      }
    }
  };

  const parseSudokuFromText = (
    result: any,
    imgWidth: number,
    imgHeight: number,
  ): (number | null)[][] | null => {
    const allNumbers: { val: number; centerX: number; centerY: number }[] = [];

    if (result.blocks && result.blocks.length > 0) {
      result.blocks.forEach((block: any) => {
        if (block.lines) {
          block.lines.forEach((line: any) => {
            if (line.elements) {
              line.elements.forEach((element: any) => {
                const text = element.text;
                const frame =
                  element.frame || element.rect || element.boundingBox;

                if (frame) {
                  const x = frame.x ?? frame.left ?? 0;
                  const y = frame.y ?? frame.top ?? 0;
                  const width = frame.width ?? frame.right - frame.left;
                  const height = frame.height ?? frame.bottom - frame.top;

                  const chars = text.split('');
                  const charWidth = width / chars.length;

                  chars.forEach((char: string, index: number) => {
                    if (/[1-9]/.test(char)) {
                      const val = parseInt(char, 10);
                      const centerX = x + index * charWidth + charWidth / 2;
                      const centerY = y + height / 2;

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

    if (allNumbers.length < 5) return null; // We need at least a few numbers to form a board

    const cellWidth = imgWidth / 9;
    const cellHeight = imgHeight / 9;

    const grid: (number | null)[][] = Array(9)
      .fill(null)
      .map(() => Array(9).fill(null));

    allNumbers.forEach(n => {
      // Map coordinates to 0-8 indices
      // We add a small buffer/clamping to ensure center points near edges don't overflow
      const colIndex = Math.min(
        8,
        Math.max(0, Math.floor(n.centerX / cellWidth)),
      );
      const rowIndex = Math.min(
        8,
        Math.max(0, Math.floor(n.centerY / cellHeight)),
      );

      // If we have multiple numbers in same cell, we might want to prioritize central ones?
      // For now, simply overwriting is a reasonable heuristic or taking the last detected one.
      grid[rowIndex][colIndex] = n.val;
    });

    return grid;
  };

  const processImage = async () => {
    if (!imageUri || !imageDims) return;
    setIsProcessing(true);

    try {
      const result = await TextRecognition.recognize(imageUri);
      const parsedGrid = parseSudokuFromText(
        result,
        imageDims.width,
        imageDims.height,
      );

      if (parsedGrid) {
        setVerificationBoard(parsedGrid);
      } else {
        showAlert(t('noSudokuFound'), t('noSudokuFoundMsg'), [
          { text: t('ok') },
        ]);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      showAlert(t('error'), t('processingError'));
    } finally {
      setIsProcessing(false);
    }
  };

  if (verificationBoard) {
    return (
      <VerificationView
        initialBoard={verificationBoard}
        onConfirm={finalBoard => {
          setVerificationBoard(null);
          setImageUri(null);
          navigation.navigate('Play', { scannedBoard: finalBoard });
        }}
        onCancel={() => {
          setVerificationBoard(null);
        }}
      />
    );
  }

  return (
    <View
      className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}
      style={{ paddingHorizontal: wp(6), paddingTop: hp(4) }}
    >
      <View style={{ marginBottom: wp(2) }}>
        <Text
          className={`font-extrabold ${
            isDarkMode ? 'text-blue-400' : 'text-blue-900'
          }`}
          style={{ fontSize: wp(8) }}
        >
          {t('scanPuzzle')}
        </Text>
        <Text
          className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          style={{ fontSize: wp(3) }}
        >
          {t('scanPuzzleDesc')}
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        {imageUri ? (
          <View
            className="w-full aspect-square overflow-hidden border-4 border-blue-500 shadow-xl relative"
            style={{ borderRadius: wp(4), marginBottom: wp(4) }}
          >
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              className="absolute top-2 right-2 bg-red-500 rounded-full"
              style={{ padding: wp(2) }}
            >
              <MaterialCommunityIcons name="close" size={wp(6)} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="w-full" style={{ gap: wp(4) }}>
            <TouchableOpacity
              onPress={handleCameraLaunch}
              className={`w-full border-4 border-dashed items-center justify-center 
                              ${
                                isDarkMode
                                  ? 'border-gray-700 bg-gray-800'
                                  : 'border-gray-300 bg-white'
                              }`}
              style={{ height: hp(20), borderRadius: wp(5), gap: wp(3) }}
            >
              <MaterialCommunityIcons
                name="camera-plus-outline"
                size={wp(12)}
                color={isDarkMode ? '#60A5FA' : '#3B82F6'}
              />
              <Text
                className={`font-bold text-center ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                style={{ fontSize: wp(4.5) }}
              >
                {t('tapToCapture')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleGalleryLaunch}
              className={`w-full border-4 border-dashed items-center justify-center
                              ${
                                isDarkMode
                                  ? 'border-gray-700 bg-gray-800'
                                  : 'border-gray-300 bg-white'
                              }`}
              style={{ height: hp(20), borderRadius: wp(5), gap: wp(3) }}
            >
              <MaterialCommunityIcons
                name="image-multiple-outline"
                size={wp(12)}
                color={isDarkMode ? '#60A5FA' : '#3B82F6'}
              />
              <Text
                className={`font-bold text-center ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
                style={{ fontSize: wp(4.5) }}
              >
                {t('pickFromGallery')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {imageUri && (
          <TouchableOpacity
            onPress={processImage}
            disabled={isProcessing}
            className={`w-full flex-row items-center justify-center 
                            ${
                              isProcessing
                                ? 'bg-gray-500'
                                : 'bg-blue-600 active:bg-blue-700'
                            }`}
            style={{ paddingVertical: wp(4), borderRadius: wp(4) }}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="text-recognition"
                  size={wp(6)}
                  color="white"
                />
                <Text
                  className="text-white font-bold text-lg ml-2"
                  style={{ fontSize: wp(4.5), marginLeft: wp(2) }}
                >
                  {t('processImage')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
