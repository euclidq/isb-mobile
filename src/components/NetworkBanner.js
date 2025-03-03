import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetwork } from './NetworkProvider';
import { colors, sizes, spacing } from '../styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const NoInternetBanner = () => {
  const { isConnected } = useNetwork();
  const slideAnim = useRef(new Animated.Value(100)).current; // Initial position (off-screen)

  useEffect(() => {
    if (!isConnected) {
      // Slide up the banner when there is no internet connection
      Animated.timing(slideAnim, {
        toValue: 0, // Slide to visible position
        duration: 300, // Duration of the animation
        useNativeDriver: true,
      }).start();
    } else {
      // Slide down the banner when internet is restored
      Animated.timing(slideAnim, {
        toValue: 100, // Slide out of the screen
        duration: 300, // Duration of the animation
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, slideAnim]);

  return (
    <Animated.View style={[styles.bannerContainer, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.banner}>
        <MaterialCommunityIcons name="wifi-off" size={24} color={colors.white} />
        <Text style={[sizes.bold, { color: colors.white }]}>No internet connection</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    padding: spacing.m,
  },
  banner: {
    backgroundColor: colors.red,
    padding: spacing.s,
    gap: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: 100,
  },
});

export default NoInternetBanner;