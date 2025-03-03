import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import axios from 'axios';

import useCalculateTimeAgo from '../../hooks/useCalculateTimeAgo';
import { colors, sizes, spacing } from '../../styles/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CARD_WIDTH = sizes.width - 100;
const CARD_HEIGHT = 200;
const CARD_WIDTH_SPACING = CARD_WIDTH + spacing.l;

const AnnouncementCarousel = () => {
    const navigation = useNavigation();
    const calculateTimeAgo = useCalculateTimeAgo();

    const [announcements, setAnnouncements] = useState([]);

    useFocusEffect(
        useCallback(() => {
            const fetchAnnouncements = async () => {
                try {
                    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/announcements`);
                    const sortedAnnouncements = response.data.announcements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    const limitedAnnouncements = sortedAnnouncements.slice(0, 3);
                    setAnnouncements([...limitedAnnouncements, { _id: 'viewAllAnnouncements' }]);
                } catch (error) {
                    console.error('Error fetching announcements:', error);
                }
            };
            fetchAnnouncements();
        }, [])
    );

    return (
        <View style={{ paddingVertical: spacing.m }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.m }}>
                <Text style={{ ...sizes.h2 }}>What's Latest?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                    <Text style={{ ...sizes.body, color: colors.primary }}>View All</Text>
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={announcements}
                keyExtractor={(item) => item._id}
                horizontal
                snapToInterval={CARD_WIDTH_SPACING}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cardContainer}
                renderItem={({ item }) => {
                    if (item._id === 'viewAllAnnouncements') {
                        return (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('Announcements')}
                                style={[styles.cardWrapper, styles.viewAllCard]}>
                                <View style={[styles.cardTextContainer, {justifyContent: 'center', alignItems: 'center'}]}>
                                    <Text style={styles.cardTitle}>View All Announcements</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }

                    return (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AnnouncementDetail', { announcementID: item._id })}
                            style={styles.cardWrapper}>
                            <ImageBackground source={{ uri: item.attachments || null }} style={styles.card} imageStyle={{ borderRadius: sizes.radius }}>
                                <View style={styles.cardTextContainer}>
                                    <View style={{alignSelf: 'flex-end'}}>
                                        {!item.attachments && <MaterialCommunityIcons name="bullhorn-variant" size={50} color={colors.white}/>}
                                    </View>
                                    <View>
                                        <Text style={styles.cardTitle}>{item.title}</Text>
                                        <Text style={styles.cardDate}>{calculateTimeAgo(item.created_at)}</Text>
                                    </View>
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

export default AnnouncementCarousel;

const styles = StyleSheet.create({
    cardContainer: {
        paddingTop: spacing.s,
        paddingHorizontal: spacing.m,
        gap: spacing.l,
    },
    cardWrapper: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: sizes.radius,
        backgroundColor: colors.primary,
    },
    viewAllCard: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    cardTextContainer: {
        flex: 1,
        width: '100%',
        padding: spacing.m,
        justifyContent: 'space-between',
        borderRadius: sizes.radius,
        backgroundColor: 'rgba(2, 41, 98, 0.5)',
    },
    cardTitle: {
        color: colors.white,
        ...sizes.h3,
    },
    cardDate: {
        color: colors.white,
        ...sizes.body,
    },
});