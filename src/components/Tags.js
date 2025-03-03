import { View, Text } from 'react-native';
import { colors, sizes, globalStyles } from '../styles/theme';

const Tags = ({ category, importance, status, backgroundColor, color }) => {
    return (
        <View style={globalStyles.tagsContainer}>
            <View style={[globalStyles.tag, backgroundColor !== '' && { backgroundColor: backgroundColor }]}>
                <Text style={[color !== '' && {color}, sizes.body]}>{category}</Text>
            </View>
            {importance && importance !== "Not Important" && (
                <View style={globalStyles.importantTag}>
                    <Text style={globalStyles.importantTagText}>{importance}</Text>
                </View>
            )}
            {status && status === 'Inactive' && (
                <View style={[globalStyles.tag, backgroundColor !== '' && { backgroundColor: colors.lightgray }]}>
                    <Text style={[{color: colors.darkgray}, sizes.body]}>{status}</Text>
                </View>
            )}
        </View>
    );
};

export default Tags;
