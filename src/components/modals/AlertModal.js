import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { colors, sizes, spacing, fontStyles, globalStyles } from '../../styles/theme';

const AlertModal = ({ visible, title, message, buttons = [] }) => {
    const isColumnLayout = buttons.length > 2;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            statusBarTranslucent
            >
            <View style={globalStyles.modalContainer}>
                <View style={globalStyles.modalWrapper}>
                    <Text style={globalStyles.modalTitle}>{title}</Text>
                    <Text style={globalStyles.modalMessage}>{message}</Text>
                    <View
                        style={[
                            globalStyles.modalButtonContainer,
                            isColumnLayout && { flexDirection: 'column'}
                        ]}>
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={button.onPress}
                                style={[globalStyles.modalButton, button.buttonStyle]}>
                                <Text style={[globalStyles.modalButtonText, button.textStyle]}>{button.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default AlertModal;