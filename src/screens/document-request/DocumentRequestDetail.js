import { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import useHandleScroll from '../../hooks/useHandleScroll';
import useFormatShortDate from '../../hooks/useFormatShortDate';
import useFormatShortDateTime from '../../hooks/useFormatShortDateTime';
import DetailsContentLoader from '../../components/content-loaders/DetailsContentLoader';
import AlertModal from '../../components/modals/AlertModal';
import Tags from '../../components/Tags';
import { colors, sizes, spacing, fontStyles, globalStyles } from '../../styles/theme';

const DocumentRequestDetail = ({ route }) => {
    const navigation = useNavigation();
    const handleScroll = useHandleScroll(navigation, 'Document Request Details');
    const formatShortDate = useFormatShortDate();
    const formatShortDateTime = useFormatShortDateTime();
    const { documentRequestID } = route.params;

    const [userData, setUserData] = useState('');
    const [userType, setUserType] = useState('');
    const [documentRequest, setDocumentRequest] = useState(null);
    const [recipientData, setRecipientData] = useState(null);
    const [householdHead, setHouseholdHead] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });

    const requestDetails = [
        { index: 1, label: 'Reference No.', value: documentRequest?.ReferenceNo },
        { index: 2, label: 'Status', value: documentRequest?.status },
        { index: 3, label: 'Remarks', value: documentRequest?.remarks },
        { index: 4, label: 'Date Submitted', translation: 'Petsa Isinumite', value: formatShortDateTime(documentRequest?.created_at) },
        { index: 5, label: 'Date Last Edited',  translation: 'Petsa Huling Binago', value: (documentRequest?.updated_at === documentRequest?.created_at) ? '' : formatShortDateTime(documentRequest?.updated_at) },
        { index: 6, label: 'Document Type',  translation: 'Uri ng Dokumento', value: documentRequest?.documentType },
        { index: 7, label: 'Purpose of Request', translation: 'Layunin ng Request', value: documentRequest?.purpose },
    ];
    
    const recipientDetails = [
        { index: 1, label: 'Requestor', translation: 'Tagapagsumite', value: documentRequest?.residentName },
        { index: 2, label: 'Recipient', translation: 'Tagatanggap', value: documentRequest?.recipient },
        { index: 3, label: 'Household Head of Recipient', value: `${householdHead.firstName}${householdHead.middleName ? ' ' + householdHead.middleName + ' ' : ' '}${householdHead.lastName}${householdHead.suffix ? ' ' + householdHead.suffix : ''}` },
        { index: 4, label: 'Age', value: recipientData?.age },
        { index: 5, label: 'Civil Status', value: recipientData?.civilStatus },
        { index: 6, label: 'Nationality', value: recipientData?.nationality },
        { index: 7, label: 'Sex', value: recipientData?.sex },
        { index: 8, label: 'Birthdate', value: formatShortDate(recipientData?.birthday) },
        { index: 9, label: 'Birthplace', value: recipientData?.birthplace },
        { index: 10, label: 'Contact Number', value: recipientData?.contactNumber },
        { index: 11, label: 'Email Address', value: recipientData?.email },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return colors.yellow;
            case 'Processing':
                return colors.blue;
            case 'Approved':
                return colors.green;
            case 'Released':
                return colors.darkgray;
            case 'Rejected':
                return colors.red;
            case 'Archived':
                return colors.lightgray;
            default:
                return colors.primary;
        }
    };

    useEffect(() => {
        const getUserData = async () => {
            try {
                const userData = JSON.parse(await AsyncStorage.getItem('userData'));
                const userType = await AsyncStorage.getItem('userType');
                setUserData(userData);
                setUserType(userType);
            } catch (error) {
                console.error('Error fetching user data and type:', error);
            }
        };
        getUserData();
    }, []);

    useEffect(() => {
        const getRecipientData = async () => {
            if (!isRefreshing) {
                setIsLoading(true);
            }
            if (documentRequest?.recipientID) {
                try {
                    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/residents/${documentRequest.recipientID}`);
                    const recipientData = response.data;
                    setRecipientData(recipientData);

                    const headResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/residents/${recipientData.householdID.householdHead}`);
                    setHouseholdHead(headResponse.data);
                } catch (error) {
                    console.error('Error fetching recipient data:', error);
                } finally {
                    setIsLoading(false);
                    setIsRefreshing(false);
                }
            }
        };
        getRecipientData();
    }, [documentRequest]);

    const getAndUpdateDocumentRequest = async (isRefresh = false) => {
        if (!isRefresh) {
            setIsLoading(true); 
        }
        try {
            const userType = await AsyncStorage.getItem('userType');
            setUserType(userType);
        
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/document-requests/${documentRequestID}`);
            const currentRequest = response.data.request;
            setDocumentRequest(currentRequest);

            if (userType === 'official' && currentRequest.status === 'Pending') {
                const formDataToSend = {
                    requestedBy: currentRequest.requestedBy._id,
                    requestID: documentRequestID,
                    ReferenceNo: currentRequest.ReferenceNo,
                    status: 'Processing',
                };

                await axios.put(`${process.env.EXPO_PUBLIC_API_BASE_URL}/document-requests/${documentRequestID}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                const updatedResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/document-requests/${documentRequestID}`);
                setDocumentRequest(updatedResponse.data.request);
            }
        } catch (error) {
            console.error('Error fetching or updating document request:', error.response ? error.response.data : error.message);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        getAndUpdateDocumentRequest(true);
    };

    useFocusEffect(
        useCallback(() => {
            getAndUpdateDocumentRequest();
        }, [documentRequestID])
    );

    const handleEditPress = () => {
        if (userData?.accountStatus === 'Pending') {
            setModalContent({
                title: 'Pending Verification',
                message: 'Your account is not verified yet. Please wait for acccount approval to edit document requests.',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
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
                ]
            });
            setShowAlertModal(true);
        } else {
            navigation.navigate('EditDocumentRequest', { documentRequestID })
        }
    }

    const openFullScreenPicture = (imageUri) => {
        navigation.navigate('Full Screen Picture', { imageUri });
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            e.preventDefault();
            navigation.navigate('DocumentRequests');
        });
    
        return unsubscribe;
    }, [navigation]);

    useLayoutEffect(() => {
        if (userType === 'resident' && documentRequest?.status === 'Pending') {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={handleEditPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[fontStyles.bold, {color: colors.primary, marginRight: 5}]}>Edit</Text>
                        <MaterialCommunityIcons name="pencil" size={30} color={colors.primary} />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, userType, documentRequest]);
    
    return (
        <View style={globalStyles.container}>
            <ScrollView 
                onScroll={handleScroll} 
                contentContainerStyle={globalStyles.scrollViewContainer} 
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
            >
                <Text style={fontStyles.screenTitle}>Document Request Details</Text>
                <View style={globalStyles.detailCard}>
                    {isLoading ? (
                        <View>
                            <DetailsContentLoader/>
                        </View>
                    ) : (
                        documentRequest ? (
                            <>
                                {requestDetails.map((item, index) => (
                                    (item.value !== undefined && item.value !== null && item.value !== '') && (
                                        <View key={index}>
                                            {item.index === 2 ? (
                                                <View>
                                                    <Text style={fontStyles.h3}>Status</Text>
                                                    <Tags category={documentRequest.status} backgroundColor={getStatusColor(documentRequest.status)} color={colors.white}/>
                                                </View>
                                            ) : (
                                            <View>
                                                {item.index === 6 && (<View style={globalStyles.divider}/>)}
                                                <Text style={fontStyles.h3}>{item.label} <Text style={globalStyles.translation}>{item.translation && `(${item.translation})`}</Text></Text>
                                                <Text style={fontStyles.body}>{item.value}</Text>
                                            </View>
                                            )}
                                        </View>
                                    )
                                ))}

                                {recipientData && recipientDetails.map((item, index) => (
                                    (item.value !== undefined && item.value !== null && item.value !== '') && (
                                        <View key={index}>
                                            <Text style={fontStyles.h3}>{item.label} <Text style={globalStyles.translation}>{item.translation && `(${item.translation})`}</Text></Text>
                                            <Text style={fontStyles.body}>{item.value}</Text>
                                        </View>
                                    )
                                ))}
                                    
                                {documentRequest.ValidID && documentRequest.ValidID.length > 0 && 
                                    <View>
                                        <Text style={fontStyles.h3}>
                                            Submitted Attachments <Text style={globalStyles.translation}>(Mga Kalakip na Dokumento)</Text>
                                        </Text>
                                        
                                        <View style={globalStyles.attachmentsDetailContainer}>
                                            {documentRequest.ValidID.map((file, index) => (
                                                file.mimetype === 'application/pdf' ? (
                                                    <View key={index} style={styles.image} >
                                                        <MaterialCommunityIcons name="file-pdf-box" size={60} color="red" />
                                                        <Text style={fontStyles.body}>{file.originalname}</Text>
                                                    </View>
                                                ) : (
                                                    <TouchableOpacity key={index} onPress={() => openFullScreenPicture(file.url)}>
                                                        <Image source={{ uri: file.url ? file.url : file.uri }} style={styles.image} />
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
                                <Text style={globalStyles.emptyMessageText}>Document request failed to load</Text>
                            </View>
                        )
                    )}
                </View>
            </ScrollView>
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

export default DocumentRequestDetail;

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: sizes.radius,
        backgroundColor: colors.secondary
    },
});