import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Image, Alert, StatusBar, Platform, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard, TextInput, Linking} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

import { useLoadFonts } from '../hooks/useLoadFonts';
import LoadingModal from '../components/LoadingModal';
import AlertModal from '../components/modals/AlertModal'
import { colors, sizes, spacing, fontStyles, globalStyles } from '../styles/theme';

const Login = ({ navigation }) => {
  const { fontsLoaded, error } = useLoadFonts();

  const [isLogging, setIsLogging] = useState(false);
  const [activeScreen, setActiveScreen] = useState('resident');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });

  useEffect(() => {
    const checkForSavedCredentials = async () => {
      const savedToken = await AsyncStorage.getItem('userToken');
      if (savedToken) {
        navigation.navigate('Home Screen'); 
      }
    };
    checkForSavedCredentials();
  }, []);

  useEffect(() => {
    setErrors({});
  }, [activeScreen]);

  useEffect(()=> {
    const requestAllPermissions = async () => {
      await requestMediaPermissions();
      await requestLocationPermission();
    };
    requestAllPermissions();
  }, []);

  const requestMediaPermissions = async () => {
    const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();

    if (!mediaLibraryStatus || !cameraStatus) {
      setModalContent({
        title: 'Media and Camera Permissions Required',
        message: 'You need to enable permissions in the settings to access the camera and media library.',
        buttons: [
          {
            label: 'Close',
            onPress: () => {
              setShowAlertModal(false)
            },
            buttonStyle: globalStyles.modalButtonSecondary,
            textStyle: globalStyles.modalButtonTextSecondary,
          },
          {
            label: 'Open Settings',
            onPress: () => {
              setShowAlertModal(false)
              Linking.openSettings();
            },
          },
        ],
      });
      setShowAlertModal(true);
    }
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setModalContent({
        title: 'Location Permissions Required',
        message: 'You need to enable location permissions in the settings to use the Evacuation Map feature.',
        buttons: [
          {
            label: 'Close',
            onPress: () => {
              setShowAlertModal(false)
            },
            buttonStyle: globalStyles.modalButtonSecondary,
            textStyle: globalStyles.modalButtonTextSecondary,
          },
          {
            label: 'Open Settings',
            onPress: () => {
              setShowAlertModal(false)
              Linking.openSettings();
            },
          },
        ],
      });
      setShowAlertModal(true);
    }
  };

  const validateForm = () => {
    let formErrors = {};
    let isValid = true;
    if (!email) {
      formErrors.email = 'Please enter your Email Address.';
      isValid = false;
    }
    if (!password) {
      formErrors.password = 'Please enter your Password.';
      isValid = false;
    }
    setErrors(formErrors);
    return isValid;
  };

  const handleLoginPress = async () => {
    if (!validateForm()) return;
    setIsLogging(true);
    const endpoint = activeScreen === 'resident' ? '/login/resident' : '/admin/login';
    const userType = activeScreen;
    
    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}${endpoint}`, { email, password });
      if (response.status === 200) {
        const { token, user } = response.data;
        
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userType', userType);
        await AsyncStorage.setItem('fullName', `${user.firstName}${user.middleName ? ' ' + user.middleName + ' ' : ' '}${user.lastName}${user.suffix ? ' ' + user.suffix : ''}`);
        
        const profileEndpoint = userType === 'official' ? `/admin/id/` : `/residents/`;
        const profileResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}${profileEndpoint}${user._id}`);
        if (response) {
          await AsyncStorage.setItem('userData', JSON.stringify(profileResponse.data));
        }
        
        navigation.navigate('Home Screen');
      }
    } catch (error) {
      if (error.response) {
        let formErrors = {};
        const { status, data } = error.response;
        if (status === 401) {
          formErrors.password = 'The password you entered is incorrect. Please try again.';
        } else if (status === 403) {
          formErrors.email = 'Email is unverified. Please check your inbox to verify your email and try again.';
        } else if (status === 404) {
          formErrors.email = 'The email you entered does not belong to any account.';
        } else if (data && data.message) {
          errorMessage = data.message;
        }
        setErrors(formErrors);
      } else if (error.request) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }
    } finally {
      setIsLogging(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <KeyboardAvoidingView behavior={"padding"} style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <SafeAreaView style={{ backgroundColor: colors.primary }} />
        <ScrollView style={{ flex:1}}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={require('../assets/images/iserve-logo.png')} />
          </View>

          <View style={[globalStyles.container, {padding: spacing.m}]}>
            <View style={globalStyles.detailCard}>
              <View style={globalStyles.tabWrapper}>
                <TouchableOpacity style={[globalStyles.tab, activeScreen === 'resident' && globalStyles.activeTab]} onPress={() => setActiveScreen('resident')}>
                  <Text style={[globalStyles.tabText, activeScreen === 'resident' && globalStyles.activeTabText]}>
                    Resident
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[globalStyles.tab, activeScreen === 'official' && globalStyles.activeTab]} onPress={() => setActiveScreen('official')}>
                  <Text style={[globalStyles.tabText, activeScreen === 'official' && globalStyles.activeTabText]}>
                    Official
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.loginContainer}>
                <Text style={[fontStyles.h3, {marginBottom: spacing.m}]}>{activeScreen === 'resident' ? 'Resident' : 'Official'} Login</Text>

                <View style={globalStyles.inputContainer}>
                  <View style={globalStyles.inputWrapper}>
                    <Text style={fontStyles.body}>Email Address</Text>
                    <TextInput
                      style={[globalStyles.inputBox, focusedInput === 'email' && globalStyles.inputBoxFocused]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Email Address"
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                    />
                    {errors.email && <Text style={globalStyles.errorText}>{errors.email}</Text>}
                  </View>

                  <View style={globalStyles.inputWrapper}>
                    <Text style={fontStyles.body}>Password</Text>
                    <View style={[globalStyles.inputBoxContainer, focusedInput === 'password' && globalStyles.inputBoxFocused]}>
                      <TextInput
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        style={globalStyles.inputPasswordBox}
                        placeholder="Password"
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                      />
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={24}
                        color="#aaa"
                        style={globalStyles.visibilityButton}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    </View>
                    {errors.password && <Text style={globalStyles.errorText}>{errors.password}</Text>}
                  </View>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={globalStyles.button} onPress={handleLoginPress} disable={isLogging}>
                    <Text style={globalStyles.buttonText}>Log In</Text>
                  </TouchableOpacity>

                  {activeScreen === 'resident' &&
                    <TouchableOpacity style={globalStyles.buttonSecondary} onPress={() => navigation.navigate('SignUp')}>
                      <Text style={globalStyles.buttonSecondaryText}>Sign Up</Text>
                    </TouchableOpacity>
                  }

                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword', { activeScreen })}
                    style={{ alignItems: 'center' }}
                  >
                    <Text style={globalStyles.hyperlinkText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>
              </View>

            </View>
          </View>
        </ScrollView>
      <LoadingModal visible={isLogging} purpose={'Logging in'} />
      <AlertModal
        visible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={modalContent.title}
        message={modalContent.message}
        buttons={modalContent.buttons}
      />
      <StatusBar barStyle='light-content' backgroundColor={colors.primary} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    gap: spacing.s,
    padding: spacing.m,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  logo: {
    height: 200,
    resizeMode: 'contain',
  },
  loginContainer: {
    width: '100%',
    paddingTop: spacing.m,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.m,
    gap: spacing.s,
    alignItems: 'center',
  },
});

export default Login;