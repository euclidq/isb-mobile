import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View, TextInput, StatusBar, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

import LoadingModal from '../../components/LoadingModal';
import AlertModal from '../../components/modals/AlertModal';
import { colors, sizes, spacing, globalStyles, fontStyles} from '../../styles/theme';

const ResetPassword = ({ navigation, route }) => {
    const { email, activeScreen, securityCode } = route.params;

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });

    const handleSubmit = async () => {
        const weakPasswords = ['123456', 'password', '123456789', '12345678', 'qwerty', 'abc123', '111111'];
        
        if (!newPassword || !confirmPassword) {
            setModalContent({
                title: 'Error',
                message: 'Please enter the password.',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
            });
            setShowAlertModal(true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setModalContent({
                title: 'Error',
                message: 'Passwords do not match.',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
            });
            setShowAlertModal(true);
            return;
        }

        if (newPassword.length < 6) {
            setModalContent({
                title: 'Error',
                message: 'Password must be at least 6 characters long.',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
            });
            setShowAlertModal(true);
            return;
        }

        if (weakPasswords.includes(newPassword)) {
            setModalContent({
                title: 'Error',
                message: 'Please choose a more secure password.',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
            });
            setShowAlertModal(true);
            return;
        }

        setIsLoading(true);
        try {
            let response;
            let resetCode = securityCode;
            if (activeScreen === 'resident') {
              response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/resident/reset-password`, { email, resetCode, newPassword });
            } else {
              response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/admin/reset-password`, { email, resetCode, newPassword });
            }

            if (response.status === 200) {
                setModalContent({
                    title: 'Success',
                    message: 'Password has been reset successfully',
                    buttons: [
                        {
                            label: 'OK',
                            onPress: () => {
                                setShowAlertModal(false);
                                navigation.navigate('Login')
                            }
                        }
                    ]
                });
                setShowAlertModal(true);
            }
        } catch (error) {
            setModalContent({
                title: 'Error',
                message: 'An error occurred. Please try again later.',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
            });
            setShowAlertModal(true);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={globalStyles.container}>
            <ScrollView style={globalStyles.scrollViewContainer}>
                <Text style={fontStyles.screenTitle}>Reset Password</Text>
                <View style={globalStyles.detailCard}>
                    <View style={globalStyles.inputContainer}>
                        <View style={[globalStyles.inputWrapper, {alignItems: 'center'}]}>
                            <MaterialCommunityIcons name='form-textbox-password' size={100} color={colors.primary} />
                            <Text style={fontStyles.body}>Enter your new password.</Text>
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
                                onBlur={() => setFocusedInput(null)}/>
                            <MaterialCommunityIcons
                                name={showNewPassword ? 'eye' : 'eye-off'}
                                size={24}
                                color="#aaa"
                                style={globalStyles.visibilityButton}
                                onPress={() => setShowNewPassword(!showNewPassword)}/>
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
                                onBlur={() => setFocusedInput(null)}/>
                            <MaterialCommunityIcons
                                name={showConfirmPassword ? 'eye' : 'eye-off'}
                                size={24}
                                color="#aaa"
                                style={globalStyles.visibilityButton}
                                onPress={() => setShowConfirmPassword(!showConfirmPassword)}/>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[globalStyles.button, isLoading && globalStyles.buttonDisabled]}
                            onPress={handleSubmit}
                            disable={isLoading}>
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

export default ResetPassword;