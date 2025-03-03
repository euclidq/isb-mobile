import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, sizes, spacing, globalStyles } from '../styles/theme';
import { useState } from 'react';

const SearchBar = ({ searchTerm, setSearchTerm, placeholder }) => {
    const [focusedInput, setFocusedInput] = useState(null);

    return (
        <View style={[styles.searchBarContainer, focusedInput === 'searchBar' && { borderColor: colors.primary }]}>
            <MaterialCommunityIcons name="magnify" size={24} color="black" />
            <TextInput
                style={styles.searchBar}
                value={searchTerm}
                placeholder={placeholder}
                placeholderTextColor={colors.darkgray}
                onChangeText={(term) => setSearchTerm(term)}
                onFocus={() => setFocusedInput('searchBar')}
                onBlur={() => setFocusedInput(null)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        borderRadius: 100,
        height: 50,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.lightgray,
    },
    searchBar: {
        ...sizes.body,
        flex: 1,
        marginLeft: 10,
    },
});

export default SearchBar;
