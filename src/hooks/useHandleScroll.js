// useScrollHandler.js
import { useCallback } from 'react';
import { StatusBar } from 'react-native'; // Import StatusBar
import { colors } from '../styles/theme';

const useHandleScroll = (navigation, headerTitle) => {
  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    if (scrollY > 50) {
      navigation.setOptions({
        headerTitle: headerTitle,
        headerShadowVisible: true,
        headerStyle: { backgroundColor: colors.white }
      });
      StatusBar.setBackgroundColor(colors.white); // Set StatusBar to white
    } else {
      navigation.setOptions({
        headerTitle: '',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.offWhite }
      });
      StatusBar.setBackgroundColor(colors.offWhite); // Set StatusBar to offWhite
    }
  }, [navigation, headerTitle]);

  return handleScroll;
};

export default useHandleScroll;
