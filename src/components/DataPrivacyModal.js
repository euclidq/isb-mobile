import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { colors, sizes, spacing, globalStyles } from '../styles/theme';

const DataPrivacyModal = ({ visible, onClose }) => {
  return (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        statusBarTranslucent
    >
        <View style={globalStyles.modalContainer}>
            <View style={globalStyles.modalWrapper}>
                <Text style={globalStyles.modalTitle}>Data Privacy Agreement</Text>
                <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.s}}>
                    <Text style={globalStyles.modalMessage}>
                        I hereby certify that the information I have provided is true and correct to the best of my knowledge. I understand that in order for the Barangay to fulfill its mandate under Section 394(d)(6) of the Local Government Code of 1991, they must process my personal information.
                        {'\n\n'}
                        This processing is essential for:{'\n'}
                        - Identifying inhabitants more efficiently{'\n'}
                        - Serving as a tool for planning{`\n`}
                        - Keeping an updated reference of the Barangay’s population
                        {`\n\n`}
                        I grant my consent and recognize the authority of the Barangay to process my personal information in accordance with the Philippine Data Privacy Act of 2012. I acknowledge that this information will be processed in compliance with the relevant data protection regulations.
                    </Text>
                </ScrollView>
                <View style={globalStyles.modalButtonContainer}>
                    <TouchableOpacity onPress={onClose} style={globalStyles.modalButton}>
                        <Text style={globalStyles.modalButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
  )
}

export default DataPrivacyModal