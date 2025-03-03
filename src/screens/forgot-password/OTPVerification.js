import React, { useState, useEffect, useRef } from 'react';
import { Alert, Text, TouchableOpacity, View, TextInput, StatusBar, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

import LoadingModal from '../../components/LoadingModal';
import AlertModal from '../../components/modals/AlertModal';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';

const OTPVerification = ({ navigation, route }) => {
    const { email, activeScreen } = route.params;
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [focusedInput, setFocusedInput] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });
    const inputRefs = useRef([]);

    useEffect(() => {
        let timer = null;
        if (resendTimer > 0 && resendDisabled) {
            timer = setInterval(() => {
                setResendTimer(prevTime => prevTime - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [resendTimer, resendDisabled]);

    const handleSubmit = async () => {
        const securityCode = otp.join('');

        setIsLoading(true);
        try {
            const endpoint = activeScreen === 'resident' ? '/resident/verify-security-code' : '/admin/verify-security-code';
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}${endpoint}`, { email, securityCode });

            if (response.status === 200) {
                navigation.navigate('ResetPassword', { email, activeScreen, securityCode });
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setModalContent({
                    title: 'Invalid OTP',
                    message: 'Please enter a valid 6-digit OTP. Please try again',
                    buttons: [
                        {
                            label: 'Close',
                            onPress: () => setShowAlertModal(false)
                        }
                    ]
                });
                setShowAlertModal(true);
            } else {
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
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (otp.every(digit => digit !== '')) {
            handleSubmit();
        }
    }, [otp]);
    
    const handleOtpChange = (text, index) => {
        if (/^\d$/.test(text) || text === '') {
            const newOtp = [...otp];
            newOtp[index] = text;
            setOtp(newOtp);
    
            if (text && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleFocus = (index) => setFocusedInput(index);

    const resendOTP = async () => {
        if (resendDisabled) {
            setModalContent({
                title: 'Resend OTP',
                message: `Please wait ${resendTimer} seconds before resending.`,
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
            const endpoint = activeScreen === 'resident' ? '/resident/forgot-password' : '/admin/forgot-password';
            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}${endpoint}`, { email });

            if (response.status === 200) {
                setModalContent({
                    title: 'Success',
                    message: `A new OTP has been sent to your ${email}.`,
                    buttons: [
                        {
                            label: 'Close',
                            onPress: () => setShowAlertModal(false)
                        }
                    ]
                });
                setShowAlertModal(true);
                setResendTimer(100);
                setResendDisabled(true);

                const timer = setInterval(() => {
                    setResendTimer(prevTime => prevTime - 1);
                }, 1000);

                setTimeout(() => {
                    clearInterval(timer);
                    setResendDisabled(false);
                    setResendTimer(0);
                }, 100000);
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
    };

    return (
        <View style={globalStyles.container}>
            <ScrollView style={globalStyles.scrollViewContainer}>
                <Text style={fontStyles.screenTitle}>OTP Verification</Text>
                <View style={globalStyles.detailCard}>
                    <View style={globalStyles.inputContainer}>
                        <View style={[globalStyles.inputWrapper, {alignItems: 'center'}]}>
                            <MaterialCommunityIcons name='email' size={100} color={colors.primary} />
                            <Text style={[fontStyles.body, {textAlign: 'center'}]}>Enter the 6-digit one-time password (OTP) that was sent to {email}</Text>
                        </View>

                        <View style={[globalStyles.inputWrapper, {flexDirection: 'row', justifyContent: 'space-between'}]}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    style={[
                                        globalStyles.inputBox,
                                        { width: 50, textAlign: 'center' },
                                        focusedInput === index && { borderColor: colors.primary, borderWidth: 2 },
                                    ]}
                                    keyboardType='number-pad'
                                    maxLength={1}
                                    value={digit}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    ref={(ref) => inputRefs.current[index] = ref}
                                    onFocus={() => handleFocus(index)}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            ))}
                        </View>

                        <View style={globalStyles.buttonWrapperRow}>
                            <TouchableOpacity
                                style={[globalStyles.button, {flex:1}]}
                                onPress={handleSubmit}
                                disable={isLoading}>
                                <Text style={globalStyles.buttonText}>Submit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[globalStyles.buttonSecondary, resendDisabled && globalStyles.disabledButton, { flex:1 }]}
                                onPress={resendOTP}>
                                <Text style={[globalStyles.buttonSecondaryText, resendDisabled && globalStyles.disabledButtonText]}>
                                    {resendDisabled ? `Resend OTP (${resendTimer})` : 'Resend OTP'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <LoadingModal visible={isLoading} purpose='Loading' />
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

export default OTPVerification;