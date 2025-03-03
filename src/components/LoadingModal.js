import { Modal, View, Text, StyleSheet, StatusBar } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { colors, sizes, spacing, globalStyles } from '../styles/theme';

const LoadingModal = ({ visible, purpose }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            statusBarTranslucent
            >
            <View style={globalStyles.modalContainer}>
                <View style={styles.wrapper}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{...sizes.body}}>{purpose}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create ({
    wrapper: {
        gap: spacing.m,
        padding: spacing.l,
        flexDirection: 'row',
        justifyContent:'center',
        alignItems: 'center',
        borderRadius: sizes.radius,
        backgroundColor: colors.white
    },
})

export default LoadingModal;
