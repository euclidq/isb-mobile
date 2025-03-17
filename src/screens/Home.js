import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, StatusBar, TouchableOpacity, ScrollView, FlatList, RefreshControl, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import axios from 'axios';

import { useLoadFonts } from '../hooks/useLoadFonts';
import useCalculateTimeAgo from '../hooks/useCalculateTimeAgo';
import Tags from '../components/Tags';
import AlertModal from '../components/modals/AlertModal';
import AnnouncementsContentLoader from '../components/content-loaders/AnnouncementsContentLoader';
import { colors, sizes, spacing, fontStyles, globalStyles } from '../styles/theme';

const Home = () => {
    const navigation = useNavigation();
    const { fontsLoaded, error } = useLoadFonts();
    const calculateTimeAgo = useCalculateTimeAgo();

    const [userData, setUserData] = useState({});
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [barangayLogo, setBarangayLogo] = useState('');
    const [notificationsCount, setNotificationsCount] = useState(0);

    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });

    const services = [
        { id: '1', title: 'Document Requests', icon: 'file-document', screen: 'DocumentRequests' },
        { id: '2', title: 'Complaints', icon: 'police-badge', screen: 'Complaints' },
        { id: '3', title: 'Barangay Directory', icon: 'account-group', screen: 'BarangayDirectory' },
        { id: '4', title: 'Barangay Information', icon: 'home-city', screen: 'BarangayInformation' },
    ];

   useFocusEffect(
        useCallback(() => {
            const getUserData = async () => {
                try {
                    const storedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
                    const storedUserType = await AsyncStorage.getItem('userType');
                    
                    if (storedUserData && storedUserType) {
                        const profileEndpoint = storedUserType === 'official' ? `/admin/id/` : `/residents/`;
                        const profileResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}${profileEndpoint}${storedUserData._id}`);
                        if (profileResponse) {
                            await AsyncStorage.setItem('userData', JSON.stringify(profileResponse.data));
                            setUserData(profileResponse.data);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching stored userData:', error);
                }
            };
            getUserData();
        }, [])
    );

    // useEffect(() => {
    //     const getDocumentRequestsAndIncidentReports = async () => {
    //         if (!userData._id) {
    //             setIsLoading(true);
    //         }
    
    //         try {
    //             const documentResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/document-requests/history/${userData._id}`);
    //             const incidentResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/incident-reports/history/${userData._id}`);
    //             const sortedIncidentReports = incidentResponse.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                
    //             const approvedDocumentRequests = documentResponse.data
    //                 .filter((request) => request.status === 'Approved')
    //                 .map((request) => request.ReferenceNo);
    
    //             const verifiedIncidentReports = sortedIncidentReports
    //                 .filter((report) => report.status === 'Verified')
    //                 .map((report) => report.ReferenceNo);

    //             // Combined ReferenceNo for both approved document requests and verified complaints
    //             if (approvedDocumentRequests.length > 0 && verifiedIncidentReports.length > 0) {
    //                 setModalContent({
    //                     title: 'Document Request(s) Approved and Complaint(s) Verified',
    //                     message: `You have ${approvedDocumentRequests.length} approved document request(s) and ${verifiedIncidentReports.length} verified complaint(s).\n\nYou may now visit the barangay to collect your document(s) and further process your complaint(s).`,
    //                     buttons: [
    //                         {
    //                             label: 'Close',
    //                             onPress: () => setShowAlertModal(false)
    //                         }
    //                     ]
    //                 });
    //                 setShowAlertModal(true);
    //             } 
    //             // Only approved document requests
    //             else if (approvedDocumentRequests.length > 0) {
    //                 setModalContent({
    //                     title: 'Document Request(s) Approved',
    //                     message: `You have ${approvedDocumentRequests.length} approved document request(s).\n\nYou may now visit the barangay to collect your document(s).`,
    //                     buttons: [
    //                         {
    //                             label: 'Close',
    //                             onPress: () => setShowAlertModal(false)
    //                         }
    //                     ]
    //                 });
    //                 setShowAlertModal(true);
    //             }
    //             // Only verified complaints
    //             else if (verifiedIncidentReports.length > 0) {
    //                 setModalContent({
    //                     title: 'Complaint(s) Verified',
    //                     message: `You have ${verifiedIncidentReports.length} verified complaint(s).\n\nYou may now visit the barangay to further process your complaint(s).`,
    //                     buttons: [
    //                         {
    //                             label: 'Close',
    //                             onPress: () => setShowAlertModal(false)
    //                         }
    //                     ]
    //                 });
    //                 setShowAlertModal(true);
    //             }
    
    //         } catch (error) {
    //             if (error.response?.status === 404) {
    //                 console.error('No document requests or incident reports found.');
    //             } else {
    //                 console.error(`${error.response?.data?.message || 'Unknown error'}`);
    //             }
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    
    //     getDocumentRequestsAndIncidentReports();
    // }, [userData._id]);

    useEffect(() => {
        const getNotificationsModal = async () => {
            const storedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
            const storedUserType = await AsyncStorage.getItem('userType');

            
            try {
                if (storedUserType === 'resident') {
                    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/notifications/user/${storedUserData._id}`);
                    setNotificationsCount(response.data.notifications.filter(n => !n.readStatus).length);
                }
                if (notificationsCount && notificationsCount > 0) {
                    setModalContent({
                        title: 'Unread Notifications',
                        message: `You have ${notificationsCount} unread notification(s).`,
                        buttons: [
                            {
                                label: 'Close',
                                onPress: () => setShowAlertModal(false)
                            }
                        ]
                    });
                    setShowAlertModal(true);
                }
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        }
        getNotificationsModal();
    }, [notificationsCount]);

    const getAnnouncements = async (isRefreshing = false) => {
        if (!isRefreshing) {
            setIsLoading(true);
        }
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/announcements`);
            const activeAnnouncements = response.data.announcements
                .filter((announcement) => announcement.status === 'Active')
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
            setAnnouncements(activeAnnouncements);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };    

    useFocusEffect(
        useCallback(() => {
            getAnnouncements(true);
        }, [])
    );

    const getBarangayData = async (isRefreshing = false) => {
        if (!isRefreshing) {
            setIsLoading(true);
        }
        try {
            try {
                const barangayResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/barangay/${userData.barangay}`);
                await AsyncStorage.setItem('barangayData', JSON.stringify(barangayResponse.data.barangay || barangayResponse.data));
                setBarangayLogo(barangayResponse.data.barangay.logo || barangayResponse.data.logo);
            } catch (error) {
                console.error('Error fetching barangay data:', error);
            }

            try {
                const directoryResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/all/admins`);
                await AsyncStorage.setItem('directoryData', JSON.stringify(directoryResponse.data.admins));
            } catch (error) {
                console.error('Error fetching directory data:', error);
            }
        } catch (error) {
            console.error('Error fetching barangay data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (userData.barangay) {
                getBarangayData(true);
            }
        }, [userData])
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        getAnnouncements(true);
        getBarangayData(true);
    };

    if (!fontsLoaded) {
        return null;
    }

    return (
        <>
            <View style={globalStyles.container}>
                <View style={[styles.header, {marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight}]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', flex: 1, gap: spacing.s, height: 50}}>
                        {barangayLogo && (<Image source={{ uri: barangayLogo }} style={{ width: 50, height: 50 }}/>)}
                        <Image source={require('../assets/images/isb-logo.png')} style={{ width: 150}} resizeMode='contain'/>
                    </View>
                    <TouchableOpacity style={styles.emergencyButton} onPress={() => navigation.navigate('Emergency Services')}>
                        <MaterialCommunityIcons name="alarm-light" size={30} color={colors.white} />
                        {/* <MaterialCommunityIcons name="alert" size={50} color={'#b22222'} /> */}
                    </TouchableOpacity>
                </View>
                <ScrollView style={globalStyles.scrollViewContainer} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
                    <TouchableOpacity style={styles.userRow} onPress={()=>navigation.navigate('Profile')}>
                        {userData.profilepic ? (
                            <Image source={{ uri: userData.profilepic }} style={styles.profilePicture} />
                        ) : (
                            <View style={styles.profilePicture}>
                                <MaterialCommunityIcons name="account" size={40} color={colors.white} />
                            </View>
                        )}
                        <View style={{flex: 1}}>
                            <Text style={fontStyles.h3}>{userData.firstName} {userData.lastName}</Text>
                            <Text style={fontStyles.body}>{userData.roleinBarangay}</Text>
                        </View>
                    </TouchableOpacity>

                    <FlatList
                        data={services}
                        numColumns={2}
                        scrollEnabled={false}
                        contentContainerStyle={{ marginVertical: spacing.s }}
                        columnWrapperStyle={{ gap: spacing.m }}
                        ItemSeparatorComponent={() => <View style={{ height: spacing.m }} />}
                        keyExtractor={(item) => item.id}
                        estimatedItemSize={4}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => navigation.navigate(item.screen)} style={styles.serviceButton}>
                                <MaterialCommunityIcons name={item.icon} size={40} color={colors.white} />
                                <Text style={styles.serviceButtonText}>{item.title}</Text>
                            </TouchableOpacity>
                        )}
                    />

                    {/* <View style={{paddingTop: spacing.m}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={fontStyles.h2}>Announcements</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                                <Text style={[fontStyles.bold, {color: colors.primary}]}>View all</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={announcements}
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ flexGrow: 1 }}
                            style={{ flexGrow: 1 }}
                            renderItem={({ item }) => 
                                <TouchableOpacity onPress={() => navigation.navigate('AnnouncementDetail', { announcementID: item._id })} style={styles.announcementCard}>
                                    <ImageBackground source={{ uri: item.attachments }} style={styles.announcementImage}>
                                        <View style={{padding: spacing.m}}>
                                            <Tags category={item.announcementCategory} importance={item.Importance} backgroundColor={colors.secondary}/>
                                        </View>
                                    </ImageBackground>
                                    <View style={styles.announcementText}>
                                        <Text style={fontStyles.h3} numberOfLines={1}>{item.title}</Text>
                                        <Text style={[fontStyles.body, { color: colors.darkgray }]}>{formatLongDate(item.created_at)} ∙ {calculateTimeAgo(item.created_at)}</Text>
                                        <Text style={fontStyles.body} numberOfLines={2}>{item.content}</Text>
                                    </View>
                                </TouchableOpacity>
                            }/>
                    </View> */}

                    <View style={styles.announcementContainer}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={fontStyles.h3}>Announcements</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                                <Text style={[fontStyles.bold, {color: colors.primary}]}>{`View all -->`}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexGrow: 1, paddingTop: spacing.s, gap: spacing.m }}>
                        {isLoading ? (
                            <AnnouncementsContentLoader />
                        ) : (
                            announcements.length > 0 ? (
                                <>
                                    {announcements.slice(0, 5).map((item, index) => (
                                        <TouchableOpacity 
                                            key={index}
                                            onPress={() => navigation.navigate('AnnouncementDetail', { announcementID: item._id })} 
                                            style={globalStyles.announcementCard}
                                        >
                                        {item.attachments ? (
                                            <Image source={{ uri: item.attachments }} style={globalStyles.announcementImage} />
                                        ) : (
                                            <View style={globalStyles.announcementImage}>
                                                <MaterialCommunityIcons name="bullhorn-variant" size={40} color={colors.white}/>
                                                <Text style={[fontStyles.body, {color: colors.white}]}>No Image</Text>
                                            </View>
                                        )}
                                            <View style={globalStyles.announcementText}>
                                                <Tags category={item.announcementCategory} importance={item.Importance} backgroundColor={colors.secondary} color={colors.primary} />
                                                <Text style={[fontStyles.h3, { marginTop: spacing.s }]} numberOfLines={1}>{item.title}</Text>
                                                <Text style={[fontStyles.body, { color: colors.darkgray }]}>{calculateTimeAgo(item.created_at)}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))}

                                    
                                    <TouchableOpacity onPress={() => navigation.navigate('Announcements')}>
                                        <Text style={[fontStyles.bold, { color: colors.primary, textAlign: 'center', paddingBottom: spacing.m }]}>
                                            {`View all -->`}
                                        </Text>
                                    </TouchableOpacity>
                                    
                                </>
                            ) : (
                                <View style={{ height: '100%' }}>
                                    <Text style={[fontStyles.body, { textAlign: 'center' }]}>No announcements available</Text>
                                </View>
                            )
                        )}
                        </View>
                    </View>
                </ScrollView>
            </View>
            <AlertModal
                visible={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={modalContent.title}
                message={modalContent.message}
                buttons={modalContent.buttons}
            />
            <StatusBar barStyle="dark-content" backgroundColor={colors.offWhite} />
        </>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingBottom: spacing.s,
        paddingHorizontal: spacing.m,
        flexDirection: 'row',
        alignContent: 'flex-start',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emergencyButton: {
        alignItems: 'center',
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.l,
        borderRadius: 50,
        backgroundColor: '#F7241D',
    },

    userRow: {
        flexDirection: 'row',
        gap: spacing.m,
        alignItems: 'center',
        padding: spacing.m,
        marginVertical: spacing.s,
        borderRadius: 100,
        backgroundColor: colors.white,
    },
    profilePicture: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        backgroundColor: colors.primary
    },

    serviceButton: {
        flex: 1,
        padding: spacing.m,
        gap: spacing.s,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: sizes.radius,
        backgroundColor: colors.primary
    },
    serviceButtonText: {
        flex: 1,
        fontSize: 16,
        //fontWeight: 'bold',
        color: colors.white,
    },

    announcementContainer: {
        marginTop: spacing.m,
    },
});

export default Home;