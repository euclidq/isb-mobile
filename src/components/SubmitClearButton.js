import { View, TouchableOpacity, Text } from 'react-native';
import { colors, sizes, spacing, globalStyles } from '../styles/theme';

const SubmitClearButton = ({ edit, onSubmit, onClear, disable }) => {
  return (
    <View style={globalStyles.buttonWrapperRow}>
      <TouchableOpacity
        onPress={onSubmit}
        style={[globalStyles.button, { flex: 1 }]}
        disable={disable}
      >
        <Text style={globalStyles.buttonText}>{edit ? 'Save' : 'Submit'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onClear}
        style={[globalStyles.buttonSecondary, { flex: 1 }]}
        disable={disable}
      >
        <Text style={globalStyles.buttonSecondaryText}>Clear</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SubmitClearButton;