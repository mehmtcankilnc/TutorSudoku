import { useWindowDimensions } from 'react-native';

export const useResposive = () => {
  const { width } = useWindowDimensions();

  return {
    isTablet: width > 500,
  };
};
