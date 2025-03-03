import { View, Text, TouchableOpacity } from 'react-native';
import { colors, sizes, spacing, fontStyles, globalStyles } from '../styles/theme';

const TermsDataPrivacy = ({ termsDataPrivacyAccepted, setTermsDataPrivacyAccepted, setShowTermsModal, setShowDataPrivacyModal }) => {
  return (
    <View>
      <TouchableOpacity 
        style={globalStyles.checkboxWrapper}
        onPress={() => setTermsDataPrivacyAccepted(!termsDataPrivacyAccepted)}
      >
        <View 
          style={[globalStyles.checkboxUnchecked, termsDataPrivacyAccepted && globalStyles.checkboxChecked]} 
        />
        
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingRight: spacing.m }}>
          <Text style={fontStyles.body}>I agree to the </Text>
          
          <TouchableOpacity onPress={() => setShowTermsModal(true)}>
            <Text style={globalStyles.hyperlinkText}>Terms and Conditions</Text>
          </TouchableOpacity>
          
          <Text style={fontStyles.body}> and </Text>
          
          <TouchableOpacity onPress={() => setShowDataPrivacyModal(true)}>
            <Text style={globalStyles.hyperlinkText}>Data Privacy Agreement</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      {!termsDataPrivacyAccepted && (
        <Text style={globalStyles.errorText}>
          You must agree to the Terms and Conditions and Data Privacy Agreement
        </Text>
      )}
    </View>
  );
};

export default TermsDataPrivacy;
