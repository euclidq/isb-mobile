import React, { useLayoutEffect, useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, RefreshControl, Alert, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Video } from 'expo-av';
import * as VideoThumbnails from 'expo-video-thumbnails';

import useHandleScroll from '../../hooks/useHandleScroll';
import useFormatShortDateTime from '../../hooks/useFormatShortDateTime';
import DetailsContentLoader from '../../components/content-loaders/DetailsContentLoader';
import AlertModal from '../../components/modals/AlertModal';
import Tags from '../../components/Tags';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';

const ComplaintDetail = ({ route }) => {
    const { complaintID } = route.params;
    const navigation = useNavigation();
    const handleScroll = useHandleScroll(navigation, 'Complaint Details');
    const formatShortDateTime = useFormatShortDateTime();

    const [userData, setUserData] = useState('');
    const [userType, setUserType] = useState('');
    const [complaint, setComplaint] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [thumbnails, setThumbnails] = useState({});
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideoUri, setSelectedVideoUri] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return colors.yellow;
            case 'Processing':
                return colors.blue;
            case 'Verified':
                return colors.teal;
            case 'Active':
                return colors.green;
            case 'Settled':
                return colors.darkgray;
            case 'Rejected':
                return colors.red;
            case 'Archived':
                return colors.lightgray;
            default:
                return colors.primary;
        }
    };

    const complaintDetail = [
        { index: 1, label: 'Barangay Case No.', value: complaint?.ReferenceNo },
        { index: 2, label: 'Status', value: complaint?.status },
        { index: 3, label: 'Remarks', translation: 'Mga Puna', value: complaint?.remarks },
        { index: 4, label: 'Date Submitted', translation: 'Petsa Isinumite', value: formatShortDateTime(complaint?.created_at) },
        { index: 5, label: 'Date Last Edited', translation: 'Petsa Huling Binago', value: (complaint?.updated_at === complaint?.created_at) ? '' : formatShortDateTime(complaint?.updated_at)},
        { index: 6, label: 'Nature of Complaint', translation: 'Usapin Ukol', value: complaint?.typeofcomplaint },
        { index: 7, label: 'Date and Time of Incident', translation: 'Petsa at Oras ng Insidente', value: formatShortDateTime(complaint?.dateAndTimeofIncident) },
        { index: 8, label: 'Complainant/s', translation: 'Mga Nagrereklamo', value: complaint?.complainantname },
        { index: 9, label: 'Respondent/s', translation: 'Mga Inirereklamo', value: complaint?.respondentname },
        { index: 10, label: 'Statement of Complaint', translation: 'Pahayag ng Reklamo', value: complaint?.incidentdescription },
        { index: 11, label: 'Prayer for Relief', translation: 'Hiling na Kalunasan', value: complaint?.relieftobegranted },
    ];

    useEffect(() => {
        const getUserDataType = async () => {
            try {
                const userData = JSON.parse(await AsyncStorage.getItem('userData'));
                const userType = await AsyncStorage.getItem('userType');
                setUserData(userData);
                setUserType(userType);
            } catch (error) {
                console.error('Error fetching user data and type:', error);
            }
        };
        getUserDataType();
    }, []);

    // const getComplaintDetails = async (isRefreshing = false) => {
    //     if (!isRefreshing) {
    //         setIsLoading(true);
    //     }
    //     try {
    //         const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/incident-reports/${complaintID}`);
    //         setComplaint(response.data);
    //         generateThumbnails(response.data.Attachment);
    //     } catch (error) {
    //         console.error('Error fetching complaint details:', error);
    //     } finally {
    //         setIsLoading(false);
    //         setIsRefreshing(false);
    //     }
    // };

    const getAndUpdateComplaint = async (isRefresh = false) => {
        if (!isRefresh) {
            setIsLoading(true); 
        }
        try {
            const userType = await AsyncStorage.getItem('userType');
            setUserType(userType);
        
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/incident-reports/${complaintID}`);
            const currentRequest = response.data;
            setComplaint(currentRequest);
            generateThumbnails(response.data.Attachment);

            if (userType === 'official' && currentRequest.status === 'Pending') {
                const formDataToSend = {
                    complainantID: currentRequest.complainantID,
                    reportId: currentRequest._id,
                    ReferenceNo: currentRequest.ReferenceNo,
                    status: 'Processing',
                };

                await axios.put(`${process.env.EXPO_PUBLIC_API_BASE_URL}/incident-reports/${complaintID}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
    
                const updatedResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/incident-reports/${complaintID}`);
                setComplaint(updatedResponse.data);
            }
        } catch (error) {
            console.error('Error fetching or updating complaint:', error.response ? error.response.data : error.message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        getAndUpdateComplaint(true);
    };

    useFocusEffect(
        useCallback(() => {
            getAndUpdateComplaint();
        }, [complaintID])
    );

    const handleEditPress = () => {
        if (userData?.accountStatus === 'Pending') {
            setModalContent({
                title: 'Pending Verification',
                message: 'Your account is not verified yet. Please wait for account approval to edit complaints.',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ],
            });
            setShowAlertModal(true);
        } else if (userData?.accountStatus === 'Rejected') {
            setModalContent({
                title: 'Account Rejected',
                message: 'Your account has been rejected. Please contact the barangay hall for more information.',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ],
            });
            setShowAlertModal(true);
        } else {
            navigation.navigate('EditComplaint', { complaintID });
        }
    };

    const generateThumbnails = async (attachments) => {
        const newThumbnails = {};
        for (const attachment of attachments) {
            if (attachment.mimetype && attachment.mimetype.startsWith('video/')) {
                try {
                    const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(attachment.url, {
                        time: 2000,
                    });
                    newThumbnails[attachment._id] = thumbnailUri;
                } catch (error) {
                    console.error('Failed to generate thumbnail:', error);
                }
            }
        }
        setThumbnails(newThumbnails);
    };

    const handleVideoPress = (videoUri) => {
        setSelectedVideoUri(videoUri);
        setShowVideoModal(true);
    };

    const handleCloseVideoModal = () => {
        setShowVideoModal(false);
        setSelectedVideoUri(null);
    };

    const openFullScreenPicture = (imageUri) => {
        navigation.navigate('Full Screen Picture', { imageUri });
    };

    useLayoutEffect(() => {
        if (userType === 'resident' && complaint?.status === 'Pending') {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={handleEditPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[fontStyles.bold, {color: colors.primary, marginRight: 5}]}>Edit</Text>
                        <MaterialCommunityIcons name="pencil" size={30} color={colors.primary} />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, userType, complaint]);

    return (
        <View style={globalStyles.container}>
            <ScrollView 
                onScroll={handleScroll} 
                contentContainerStyle={globalStyles.scrollViewContainer} 
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}  // Use isRefreshing for RefreshControl
            >
                <Text style={fontStyles.screenTitle}>Complaint Details</Text>
                <View style={globalStyles.detailCard}>
                    {isLoading ? (
                        <DetailsContentLoader/>
                    ) : (
                        complaint ? (
                            <>
                                {complaintDetail.map((item, index) => (
                                    (item.value !== undefined && item.value !== null && item.value !== '') && (
                                        <View key={index}>
                                            {item.index === 2 ? (
                                                <View>
                                                    <Text style={fontStyles.h3}>Status</Text>
                                                    <Tags category={complaint.status} backgroundColor={getStatusColor(complaint.status)} color={colors.white} />
                                                </View>
                                            ) : (
                                                <View>
                                                    {item.index === 6 && <View style={globalStyles.divider} />}
                                                    <Text style={fontStyles.h3}>{item.label} <Text style={globalStyles.translation}>{item.translation && `(${item.translation})`}</Text></Text>
                                                    <Text style={fontStyles.body}>{item.value}</Text>
                                                </View>
                                            )}
                                        </View>
                                    )
                                ))}

                                {complaint.Attachment && complaint.Attachment.length > 0 &&
                                    <View>
                                        <Text style={fontStyles.h3}>
                                            Supporting Evidences <Text style={globalStyles.translation}>(Mga Ebidensya)</Text>
                                        </Text>
                                        <View style={globalStyles.attachmentsDetailContainer}>
                                            {complaint.Attachment.map((attachment, index) => (
                                                attachment.mimetype && attachment.mimetype.startsWith('video/') ? (
                                                    <TouchableOpacity key={index} onPress={() => handleVideoPress(attachment.url)}>
                                                        <Image 
                                                            source={{ uri: thumbnails[attachment._id] || 'https://example.com/default-video-thumbnail.png' }} 
                                                            style={styles.image} 
                                                        />
                                                        <View style={globalStyles.playIconOverlay}>
                                                            <MaterialCommunityIcons name="play-circle" size={48} color={colors.white} />
                                                        </View>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <TouchableOpacity key={index} onPress={() => openFullScreenPicture(attachment.url)}>
                                                        <Image source={{ uri: attachment.url }} style={styles.image} />
                                                    </TouchableOpacity>
                                                )
                                            ))}
                                        </View>
                                    </View>
                                }
                            </>
                        ) : (
                            <View style={globalStyles.emptyMessageContainer}>
                                <MaterialCommunityIcons name="close-circle-outline" size={100} color={colors.gray} />
                                <Text style={globalStyles.emptyMessageText}>Complaint failed to load</Text>
                            </View>
                        )
                    )}
                </View>
            </ScrollView>
            <Modal visible={showVideoModal} animationType="slide" onRequestClose={handleCloseVideoModal}>
                <View style={globalStyles.videoModal}>
                    <Video
                        source={{ uri: selectedVideoUri }}
                        style={globalStyles.videoPlayer}
                        useNativeControls
                        resizeMode="contain"
                        shouldPlay
                    />
                    <TouchableOpacity onPress={handleCloseVideoModal} style={globalStyles.videoModalCloseButton}>
                        <Text style={globalStyles.videoModalCloseText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
            <AlertModal
                visible={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={modalContent.title}
                message={modalContent.message}
                buttons={modalContent.buttons}
            />
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

export default ComplaintDetail;