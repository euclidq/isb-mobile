import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, fontStyles, globalStyles } from '../styles/theme';

const TermsModal = ({ visible, onClose, form }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}s
            statusBarTranslucent
        >
            <View style={globalStyles.modalContainer}>
                <View style={globalStyles.modalWrapper}>
                    <Text style={globalStyles.modalTitle}>Terms and Conditions</Text>
                    <ScrollView contentContainerStyle={{paddingHorizontal: spacing.s}}>
                        {form === 'signup' && (
                            <Text style={globalStyles.modalMessage}>
                                <Text style={fontStyles.bold}>Purpose of Registration:</Text> iServe Barangay allows residents to access Barangay services, including filing complaints, requesting documents, and receiving updates.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Personal Information Collection:</Text> We collect necessary information such as name, contact details, address, and valid IDs to verify your identity and provide our services.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Data Privacy:</Text> Your personal information will be processed in line with the Data Privacy Act of 2012. We are committed to protecting your privacy and only sharing your data as required by law, with your consent, or as necessary to provide our services.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>User Responsibilities:</Text> You must provide accurate and current information. Misuse of the platform, such as submitting false information or engaging in abusive conduct, may result in restricted access.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Security and Data Retention:</Text> We use security measures to protect your information and retain data only as long as necessary for service provision or as required by law.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Cookies and Tracking:</Text> We may use cookies to enhance your experience on the platform. You can manage cookies through your browser settings.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Service Limitations:</Text> While we strive to maintain platform reliability, iServe Barangay is not liable for any disruptions, errors, or delays in service.
                                {'\n\n'}
                                By completing the sign-up process, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
                            </Text>
                        )}

                        {form === 'complaint' && (
                            <Text style={globalStyles.modalMessage}>
                                <Text style={fontStyles.bold}>Purpose:</Text> iServe Barangay allows residents to file complaints for prompt Barangay action.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Accuracy:</Text> You must provide accurate and truthful information in your complaint.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Respectful Conduct:</Text> Use respectful language; abusive submissions will not be accepted.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Privacy:</Text> Your personal information is protected under the Data Privacy Act of 2012.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Platform Limitations:</Text> iServe Barangay is not liable for delays or technical issues.
                                {'\n\n'}
                                By using the service, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
                            </Text>
                        )}

                        {form === 'documentRequest' && (
                            <Text style={globalStyles.modalMessage}>
                                <Text style={fontStyles.bold}>Purpose:</Text> Use iServe Barangay to request official Barangay documents quickly and easily.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Accuracy:</Text> Ensure all details provided in your request are accurate and up-to-date.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Privacy:</Text> Personal information will be handled in compliance with the Data Privacy Act of 2012.
                                {'\n\n'}
                                <Text style={fontStyles.bold}>Platform Limitations:</Text> The Barangay is not responsible for delays or interruptions on the platform.
                                {'\n\n'}
                                By using the service, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
                            </Text>
                        )}
                    </ScrollView>
                    <View style={globalStyles.modalButtonContainer}>
                        <TouchableOpacity onPress={onClose} style={globalStyles.modalButton}>
                            <Text style={globalStyles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default TermsModal;
