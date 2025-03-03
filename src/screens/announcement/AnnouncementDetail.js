import { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import useHandleScroll from '../../hooks/useHandleScroll';
import useFormatShortDateTime from '../../hooks/useFormatShortDateTime';
import useFormatLongDate from '../../hooks/useFormatLongDate';
import useCalculateTimeAgo from '../../hooks/useCalculateTimeAgo';
import AnnouncementDetailsContentLoader from '../../components/content-loaders/AnnouncementDetailsContentLoader';
import Tags from '../../components/Tags';
import {colors, sizes, spacing, fontStyles, globalStyles} from '../../styles/theme';

const AnnouncementDetail = ({ route }) => {
    const { announcementID } = route.params;
    const navigation = useNavigation();
    const formatLongDate = useFormatLongDate();
    const formatShortDateTime = useFormatShortDateTime();
    const calculateTimeAgo = useCalculateTimeAgo();
    
    const [userType, setUserType] = useState('');
    const [announcement, setAnnouncement] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        const getUserType = async () => {
            try {
                const userType = await AsyncStorage.getItem('userType');
                if (userType) {
                    setUserType(userType);
                }
            } catch (error) {
                console.error('Error getting user type:', error);
            }
        };
        getUserType();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const fetchAnnouncementDetail = async () => {
                setIsLoading(true);
                try {
                    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/announcements/${announcementID}`);
                    setAnnouncement(response.data.announcement);
                } catch (error) {
                    console.error('Error fetching announcement detail:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAnnouncementDetail();
        }, [announcementID])
    );

    useLayoutEffect(() => {
        if (userType && announcementID) {
            navigation.setOptions({
                headerRight: () => (
                    userType === 'official' &&
                    <TouchableOpacity onPress={() => navigation.navigate('EditAnnouncement', { announcementID })} style={{ flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[fontStyles.bold, {color: colors.primary, marginRight: 5}]}>Edit</Text>
                        <MaterialCommunityIcons name="pencil" size={30} color={colors.primary} />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, userType, announcementID]);
    

    const handleScroll = useHandleScroll(navigation, announcement?.title || '');

    const openFullScreenPicture = (imageUri) => {
        navigation.navigate('Full Screen Picture', { imageUri });
    };

    return (
        <View style={globalStyles.container}>
            <ScrollView onScroll={handleScroll} contentContainerStyle={globalStyles.scrollViewContainer}>
                {isLoading ? (
                    <AnnouncementDetailsContentLoader />
                ) : (
                    announcement ? (
                            <View style={globalStyles.detailCard}>
                                <View>
                                    {announcement.attachments && (
                                        <TouchableOpacity onPress={() => openFullScreenPicture(announcement.attachments)}>
                                            <Image 
                                                source={announcement.attachments ? { uri: announcement.attachments } : null} 
                                                style={[styles.image, { marginBottom: spacing.m }]} 
                                            />
                                        </TouchableOpacity>
                                    )}
                                    <Tags category={announcement.announcementCategory} importance={announcement.Importance} status={announcement.status} backgroundColor={colors.secondary} color={colors.primary} />
                                    <Text style={fontStyles.h2}>{announcement.title}</Text>
                                    <Text style={[fontStyles.body, {color: colors.darkgray}]}>{formatLongDate(announcement.created_at)} - {calculateTimeAgo(announcement.created_at)}</Text>
                                </View>
                                <Text style={fontStyles.body}>{announcement.content}</Text>
                                <View>
                                    <Text style={[fontStyles.body, {color: colors.darkgray, textAlign: 'center'}]}>{`Last Updated: ${formatShortDateTime(announcement.updated_at)}`}</Text>
                                    <Text style={[fontStyles.body, {color: colors.darkgray, textAlign: 'center'}]}>{`End Date: ${formatShortDateTime(announcement.endDate)}`}</Text>
                                </View>
                            </View>
                    ) : (
                        <View style={globalStyles.emptyMessageContainer}>
                            <MaterialCommunityIcons name="magnify-remove-outline" size={100} color={colors.gray} />
                            <Text style={globalStyles.emptyMessageText}>Announcement failed to load</Text>
                        </View>
                    )
                )}
            </ScrollView>
        </View>
    );    
};

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 300,
        borderRadius: sizes.radius,
    },
});

export default AnnouncementDetail;