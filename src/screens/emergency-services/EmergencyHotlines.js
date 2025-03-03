import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { colors, spacing } from '../../styles/theme';

const EmergencyHotlines = () => {
    const [columns] = useState(4);
    const [hotlines, setHotlines] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getHotlines = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/all/hotlines`);
            await AsyncStorage.setItem('hotlinesData', JSON.stringify(response.data));

            const activeHotlines = response.data.filter(item => item.isActive);
            setHotlines(activeHotlines);
        } catch (error) {
            console.error('Error fetching hotlines:', error.response || error.message);
            alert('Error fetching hotlines');
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            getHotlines();
        }, [])
    );

    const dialNumber = (number) => {
        const phoneNumber = `tel:${number}`;
        Linking.openURL(phoneNumber);
    };

    return (
        <View style={styles.container}>
            {isLoading ? (
                <Text>Loading...</Text>
            ) : hotlines.length > 0 ? (
                <FlatList
                    data={hotlines}
                    keyExtractor={(item, index) => index.toString()}
                    numColumns={columns}
                    contentContainerStyle={styles.hotlineList}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.hotlineContainer} onPress={() => dialNumber(item.contactNo)}>
                            <Image source={{ uri: item.photo }} style={styles.hotlineImage} resizeMode="contain" />
                            <Text style={styles.hotlineTitle}>{item.name}</Text>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <Text>No active hotlines available.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.m,
        justifyContent: 'center',
    },
    hotlineList: {
        gap: spacing.s,
        justifyContent: 'center',
    },
    hotlineContainer: {
        flex: 1,
        padding: 5,
        maxWidth: '25%',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    hotlineImage: {
        width: 80,
        height: 80,
        borderRadius: 100,
        borderWidth: 3,
        borderColor: colors.primary,
        backgroundColor: colors.secondary,
    },
    hotlineTitle: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default EmergencyHotlines;