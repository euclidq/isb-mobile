import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

export const useLoadFonts = () => {
  SplashScreen.preventAutoHideAsync();
  
  const [fontsLoaded, error] = useFonts({
    'Inter-Bold': require('../assets/fonts/Inter-Bold.otf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.otf'),
  });

  useEffect(() => {
    const hideSplashScreen = async () => {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    };
    hideSplashScreen();
  }, [fontsLoaded]);

  return { fontsLoaded, error };
};
