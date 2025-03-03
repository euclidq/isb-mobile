import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View, TextInput, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import LoadingModal from '../components/LoadingModal';
import AlertModal from '../components/modals/AlertModal';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../styles/theme';

const ChangePassword = ({ navigation, route }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });

    const handleSubmit = async () => {
        const weakPasswords = ['123456', 'password', '123456789', '12345678', 'qwerty', 'abc123', '111111'];

        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please enter the password.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Password Too Short', 'Password must be at least 6 characters long.');
            return;
        }

        if (weakPasswords.includes(newPassword)) {
            Alert.alert('Unsecure Password', 'Please choose a more secure password.');
            return;
        }

        setIsLoading(true);
        try {
            // Retrieve the token from AsyncStorage
            const token = await AsyncStorage.getItem('userToken');

            // Ensure the token exists
            if (!token) {
                Alert.alert('Authentication Error', 'You must be logged in to change your password.');
                return;
            }

            // Send the change password request with the token in the Authorization header
            const response = await axios.put(
                `${process.env.EXPO_PUBLIC_API_BASE_URL}/residents/change-password`,
                { oldPassword: currentPassword, newPassword },  // Sending both old and new passwords
                { headers: { Authorization: `Bearer ${token}` } }  // Include token in Authorization header
            );

            if (response.status === 200) {
                setModalContent({
                    title: 'Success',
                    message: 'Your password has been changed successfully.',
                    buttons: [{
                        label: 'Close',
                        onPress: async () => {
                            try {
                                const fcmToken = await AsyncStorage.getItem('fcmToken');
                                const userToken = await AsyncStorage.getItem('userToken');
                                
                                if (fcmToken && userToken) {
                                    try {
                                        // Attempt to remove the specific FCM token
                                        await axios.post(
                                            `${process.env.EXPO_PUBLIC_API_BASE_URL}/remove-fcm-token`, 
                                            { fcmToken },
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${userToken}`
                                                }
                                            }
                                        );
                                    } catch (error) {
                                        console.error('Failed to remove specific FCM token:', error.response);
                                        // If removal of specific token fails, remove all FCM tokens
                                        await axios.post(
                                            `${process.env.EXPO_PUBLIC_API_BASE_URL}/remove-all-fcm-tokens`, 
                                            {},
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${userToken}`
                                                }
                                            }
                                        );
                                    } finally {
                                        // Clear all user-related data from AsyncStorage
                                        await AsyncStorage.removeItem('userType');
                                        await AsyncStorage.removeItem('userData');
                                        await AsyncStorage.removeItem('userToken');
                                        await AsyncStorage.removeItem('fullName');
                                        await AsyncStorage.removeItem('barangayData');
                                        await AsyncStorage.removeItem('directoryData');
                                        await AsyncStorage.removeItem('hotlinesData');
                                        await AsyncStorage.removeItem('fcmToken');
                
                                        navigation.navigate('Login');
        
                                    }
                                } 
        
                            } catch (error) {
                                console.error('Error during logout:', error.response);
                            }
                        }
                    }]
                });
                setShowAlertModal(true);
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            if (error.response?.status === 400) {
                Alert.alert('Error', 'Old password is incorrect.');
            } else if (error.response?.status === 404) {
                Alert.alert('Error', 'Resident not found.');
            } else {
                Alert.alert('Error', 'An error occurred. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={globalStyles.container}>
            <ScrollView style={globalStyles.scrollViewContainer}>
                <Text style={fontStyles.screenTitle}>Change Password</Text>
                <View style={globalStyles.detailCard}>
                    <View style={globalStyles.inputContainer}>
                        <View style={[globalStyles.inputWrapper, { alignItems: 'center' }]}>
                            <MaterialCommunityIcons name='form-textbox-password' size={100} color={colors.primary} />
                            <Text style={fontStyles.body}>Enter your current and new password.</Text>
                        </View>
                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>Current Password {!currentPassword && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                            <View style={[globalStyles.inputBoxContainer, focusedInput === 'currentPassword' && globalStyles.inputBoxFocused]}>
                                <TextInput
                                    secureTextEntry={!showCurrentPassword}
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    style={globalStyles.inputPasswordBox}
                                    placeholder="Current Password"
                                    onFocus={() => setFocusedInput('currentPassword')}
                                    onBlur={() => setFocusedInput(null)} />
                                <MaterialCommunityIcons
                                    name={showCurrentPassword ? 'eye' : 'eye-off'}
                                    size={24}
                                    color="#aaa"
                                    style={globalStyles.visibilityButton}
                                    onPress={() => setShowCurrentPassword(!showCurrentPassword)} />
                            </View>
                        </View>
                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>New Password {!newPassword && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                            <View style={[globalStyles.inputBoxContainer, focusedInput === 'newPassword' && globalStyles.inputBoxFocused]}>
                                <TextInput
                                    secureTextEntry={!showNewPassword}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    style={globalStyles.inputPasswordBox}
                                    placeholder="New Password"
                                    onFocus={() => setFocusedInput('newPassword')}
                                    onBlur={() => setFocusedInput(null)} />
                                <MaterialCommunityIcons
                                    name={showNewPassword ? 'eye' : 'eye-off'}
                                    size={24}
                                    color="#aaa"
                                    style={globalStyles.visibilityButton}
                                    onPress={() => setShowNewPassword(!showNewPassword)} />
                            </View>
                        </View>
                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>Re-enter New Password {!confirmPassword && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                            <View style={[globalStyles.inputBoxContainer, focusedInput === 'confirmPassword' && globalStyles.inputBoxFocused]}>
                                <TextInput
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    style={globalStyles.inputPasswordBox}
                                    placeholder="Re-enter New Password"
                                    onFocus={() => setFocusedInput('confirmPassword')}
                                    onBlur={() => setFocusedInput(null)} />
                                <MaterialCommunityIcons
                                    name={showConfirmPassword ? 'eye' : 'eye-off'}
                                    size={24}
                                    color="#aaa"
                                    style={globalStyles.visibilityButton}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)} />
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[globalStyles.button, isLoading && globalStyles.buttonDisabled]}
                            onPress={handleSubmit}
                            disabled={isLoading}>
                            <Text style={globalStyles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <LoadingModal visible={isLoading} purpose={'Resetting Password'} />
            <AlertModal
                visible={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={modalContent.title}
                message={modalContent.message}
                buttons={modalContent.buttons}
            />
        </View>
    )
}

export default ChangePassword;