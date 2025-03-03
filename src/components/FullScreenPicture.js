import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, sizes } from '../styles/theme';

const FullScreenPicture = ({ route, navigation }) => {
    const { imageUri } = route.params;

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={30} color={colors.white} />
            </TouchableOpacity>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
            <StatusBar barStyle="light-content" backgroundColor={colors.black}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
});

export default FullScreenPicture;