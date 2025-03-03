import React, { useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors, sizes, spacing, globalStyles, fontStyles} from '../styles/theme';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to iServe Barangay',
    message: 'Your one-stop app for all barangay services, updates, and assistance. Stay connected with your barangay like never before!',
    image: require('../assets/images/iserve-logo-blue.png'),
  },
  {
    id: '2',
    title: 'Stay Informed with Real-Time Updates',
    message: 'Receive timely notifications for important announcements directly from your barangay. Stay up-to-date with events, advisories, and barangay updates.',
    image: require('../assets/images/onboarding/notifications.png'),
  },
  {
    id: '3',
    title: 'Simplify Document Requests',
    message: 'Achieve your goals with guidance and support.',
    image: require('../assets/images/onboarding/document-requests.png'),
  },
  {
    id: '4',
    title: 'Complaint Filing Made Easy',
    message: 'File complaints quickly and securely. Track your submissions, and help improve your barangay by letting officials address issues efficiently.',
    image: require('../assets/images/onboarding/complaints.png'),
  },
  {
    id: '5',
    title: 'Get to Know Your Barangay',
    message: 'Discover essential information about your barangay, including contact details and profiles of local officials, all in one convenient directory.',
    image: require('../assets/images/onboarding/barangay-info.png'),
  },
  {
    id: '6',
    title: 'Be Prepared with Emergency Resources',
    message: 'Access evacuation maps, emergency hotlines, and immediate response services. Your safety is our priority, with resources available at your fingertips.',
    image: require('../assets/images/onboarding/emergency.png'),
  },
];

const Onboarding = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      flatListRef.current.scrollToIndex({ index: currentSlide + 1 });
    } else {
      navigation.navigate('Login');
      await AsyncStorage.setItem('hasLaunched', 'true');
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      flatListRef.current.scrollToIndex({ index: currentSlide - 1 });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={[styles.slideContainer, { width }]}>
            <View style={styles.slide}>
              <Image source={item.image} style={styles.image} />
              <View style={{gap: spacing.m}}>
                <Text style={[fontStyles.h2, {textAlign: 'center'}]}>{item.title}</Text>
                <Text style={[fontStyles.body, {textAlign: 'center'}]}>{item.message}</Text>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.indicatorButtonContainer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                currentSlide === index && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
        <View style={styles.buttonContainer}>
          {currentSlide > 0 && 
              <TouchableOpacity onPress={handleBack} style={[globalStyles.responsiveButton, {backgroundColor: colors.secondary}]}>
                  <Text style={globalStyles.buttonSecondaryText}>Back</Text>
              </TouchableOpacity>
          }
          <View style={{flex: 1}} />
          <TouchableOpacity onPress={handleNext} style={[globalStyles.responsiveButton]}>
              <Text style={globalStyles.buttonText}>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar barStyle='dark-content' backgroundColor={colors.offWhite}/>    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
  },
  slideContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
  },
  slide: {
    width: '100%',
    padding: spacing.m,
    paddingVertical: spacing.l,
    gap: spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: sizes.radius,
    backgroundColor: colors.white
  },
  image: {
    height: 200,
    resizeMode: 'contain',
  },
  indicatorButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: spacing.s
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.lightgray,
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default Onboarding;
