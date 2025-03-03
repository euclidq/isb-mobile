import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View, TextInput, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

import LoadingModal from '../../components/LoadingModal';
import AlertModal from '../../components/modals/AlertModal';
import { colors, sizes, spacing, globalStyles, fontStyles} from '../../styles/theme';

const ForgotPassword = ({ navigation, route }) => {
    const { activeScreen } = route.params;
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });

    const handleResetPress = async () => {
        if (!email) {
            setModalContent({
                title: 'Error',
                message: 'Please enter your email address.',
                buttons: [
                    {
                        label: 'OK',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
            });
            setShowAlertModal(true);
            return
        }

        setIsLoading(true);
        try {
            let response;

            if (activeScreen === 'resident') { 
                response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/resident/forgot-password`, { email });
            } else {
                response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/admin/forgot-password`, { email });
            }

            if (response.status === 200) {
                navigation.navigate('OTPVerification', { email, activeScreen })
            }
        } catch (error) {
            console.error('Error sending reset password email:', error);
            Alert.alert('Error', 'An error occurred. Please try again later.');
        } finally {
            setIsLoading(false); 
        }
    };

    return (
        <View style={globalStyles.container}>
            <ScrollView style={globalStyles.scrollViewContainer}>
                <Text style={fontStyles.screenTitle}>Forgot Password</Text>
                <View style={globalStyles.detailCard}>
                    <View style={globalStyles.inputContainer}>
                        <View style={[globalStyles.inputWrapper, {alignItems: 'center'}]}>
                            <MaterialCommunityIcons name='lock-reset' size={100} color={colors.primary} />
                            <Text style={[fontStyles.body, {textAlign: 'center'}]}>Please enter your email address to receive a one-time password (OTP).</Text>
                        </View>
                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>Email Address</Text>
                            <TextInput
                                style={[globalStyles.inputBox, focusedInput === 'email' && { borderColor: colors.primary }]}
                                placeholder='Email Address'
                                keyboardType='email-address'
                                autoCapitalize='none'
                                autoCompleteType='email'
                                autoCorrect={false}
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}/>
                        </View>
                        <TouchableOpacity
                            style={[globalStyles.button, isLoading && globalStyles.disabledButton]}
                            onPress={handleResetPress}
                            disabled={isLoading}
                        >
                            <Text style={globalStyles.buttonText}>Send OTP</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
            <StatusBar style='dark-content' backgroundColor={colors.offWhite}/>
            <LoadingModal visible={isLoading} purpose='Sending OTP' />
            <AlertModal
                visible={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={modalContent.title}
                message={modalContent.message}
                buttons={modalContent.buttons}
            />
        </View>
    );
}

export default ForgotPassword;