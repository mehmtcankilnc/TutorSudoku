import { useWindowDimensions } from 'react-native';

export const useResponsive = () => {
  const { width } = useWindowDimensions();

  return {
    isTablet: width > 500,
  };
};
