import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Swiper from 'react-native-swiper';
import axios from 'axios';

import { colors, sizes, spacing } from '../../styles/theme';
import useCalculateTimeAgo from '../../hooks/useCalculateTimeAgo';
import Tags from '../../components/Tags';

const AnnouncementSwiper = () => {
    const calculateTimeAgo = useCalculateTimeAgo();
    const [announcements, setAnnouncements] = useState([]);
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            const fetchAnnouncements = async () => {
                try {
                    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/announcements`);
                    setAnnouncements(response.data.announcements);
                } catch (error) {
                    console.error('Error fetching announcements:', error);
                }
            };

            fetchAnnouncements();
        }, [])
    );

    if (!announcements.length) {
        return (
            <View style={[styles.announcementSection, {backgroundColor: colors.darkgray}]}>
                <Text style={[sizes.h3, { color: colors.white }]}>No announcements available</Text>
            </View>
        )
    }

    return (
        <View style={styles.announcementSection}>
            <Swiper
                showsPagination={true}
                paginationStyle={styles.pagination}
                dotColor="rgba(255, 255, 255, 0.5)"
                activeDotColor="white"
                showsButtons
                autoplay
                prevButton={<MaterialCommunityIcons name='chevron-left' size={40} color={'white'} />}
                nextButton={<MaterialCommunityIcons name='chevron-right' size={40} color={'white'} />}
                loop>
                {announcements &&
                    announcements.map((announcement) => (
                        <TouchableOpacity
                            key={announcement._id}
                            onPress={() => navigation.navigate('AnnouncementDetail', { announcementID: announcement._id })}
                        >
                            {announcement.attachments ? (
                                <ImageBackground source={{ uri: announcement.attachments }} style={styles.announcementImage}>
                                    <View style={styles.announcementTextContainer}>
                                        <Tags category={announcement.announcementCategory} importance={announcement.Importance} backgroundColor={colors.secondary}/>
                                        <Text
                                            style={[sizes.h3, styles.announcementText]}
                                            numberOfLines={2}
                                            ellipsizeMode="tail"
                                        >
                                            {announcement.title}
                                        </Text>
                                        <Text style={[sizes.body, styles.announcementText]}>
                                            {calculateTimeAgo(announcement.updated_at)}
                                        </Text>
                                    </View>
                                </ImageBackground>
                            ) : (
                                <View style={[styles.announcementImage, { backgroundColor: colors.primary }]}>
                                    <View style={styles.announcementTextContainer}>
                                        <Tags category={announcement.announcementCategory} importance={announcement.Importance} backgroundColor={colors.secondary}/>
                                        <Text
                                            style={[sizes.h3, styles.announcementText]}
                                            numberOfLines={2}
                                            ellipsizeMode="tail"
                                        >
                                            {announcement.title}
                                        </Text>
                                        <Text style={[sizes.body, styles.announcementText]}>
                                            {calculateTimeAgo(announcement.updated_at)}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
            </Swiper>
        </View>
    );
};

export default AnnouncementSwiper;

const styles = StyleSheet.create({
    announcementSection: {
        flex: 0,
        height: 200,
        margin: spacing.m,
        borderRadius: sizes.radius,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    announcementImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    announcementTextContainer: {
        flex: 1,
        gap: spacing.m,
        paddingHorizontal: 60,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(2, 41, 98, 0.5)',
    },
    announcementText: {
        textAlign: 'center',
        color: 'white',
    },
    pagination: {
        bottom: spacing.s,
    },
});