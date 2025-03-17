import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, Image, TouchableOpacity, ScrollView, StyleSheet, StatusBar, RefreshControl, Platform} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import useFormatShortDate from '../hooks/useFormatShortDate';
import ProfileContentLoader from '../components/content-loaders/ProfileContentLoader';
import AlertModal from '../components/modals/AlertModal';
import Tags from '../components/Tags';
import {colors, sizes, spacing, globalStyles, fontStyles} from '../styles/theme';

const Profile = () => {
    const navigation = useNavigation();
    const formatShortDate = useFormatShortDate();
    
    const [userType, setUserType] = useState('');
    const [userData, setUserData] = useState('');
    const [fullName, setFullName] = useState('');
    const [householdData, setHouseholdData] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
            return colors.yellow;
            case 'Approved':
            return colors.green;
            case 'Denied':
            return colors.red;
            default:
            return colors.primary;
        }
    };
    const isPresentAddressEmpty = !userData.presentAddress?.region && !userData.presentAddress?.province && !userData.presentAddress?.city && !userData.presentAddress?.barangay;
    const userPersonalInfo = [
        {
            index: 1,
            section: userType === 'official' ? 'Official ID No.' : 'Resident ID No.',
            info: userType === 'official' ? userData.adminID : userData.residentID,
        },
        {
            index: 2,
            section: 'Birthdate',
            info: formatShortDate(userData.birthday) || '',
        },        
        {
            index: 3,
            section: 'Sex',
            info: userData.sex || '',
        },
        {
            index: 4,
            section: 'Age',
            info: userData.age || '',
        },
        {
            index: 5,
            section: 'Birthplace',
            info: userData.birthplace || '',
        },
        {
            index: 6,
            section: 'Occupation Status',
            info: userData.occupation || '',
        },
        {
            index: 7,
            section: 'Nationality',
            info: userData.nationality || '',
        },
        {
            index: 8,
            section: 'Civil Status',
            info: userData.civilStatus || '',
        },
        {
            index: 9,
            section: 'Email Address',
            info: userData.email || '',
        },
        {
            index: 10,
            section: 'Contact Number',
            info: userData.contactNumber || '',
        },
    ];
    const specialStatus = [
        { index: 1, section: 'Voter', info: userData.voter || '' },
        { index: 2, section: 'Indigent', info: userData.indigent || '' },
        { index: 3, section: '4Ps Member', info: userData.fourpsmember || '' },
        { index: 4, section: 'Out of School Children', info: userData.outofschoolchildren || '' },
        { index: 5, section: 'Out of School Youth', info: userData.outofschoolyouth || '' },
        { index: 6, section: 'Indigenous People', info: userData.indigenouspeople || '' },
        { index: 7, section: `PWD: ${userData.typeofdisability}`, info: userData.pwd || '' },
        { index: 8, section: 'Solo Parent', info: userData.soloParent || '' },
        { index: 9, section: 'Senior Citizen', info: userData.seniorCitizen || '' },
    ]
    const permanentAddress = [
        {
            index: 1,
            section: 'House No.',
            info: userData.permanentAddress?.houseNo || '',
        },
        {
            index: 2,
            section: 'Street',
            info: userData.permanentAddress?.street || '',
        },
        {
            index: 3,
            section: 'Unit/Floor/Room No.',
            info: userData.permanentAddress?.unitFloorRoomNo || '',
        },
        {
            index: 4,
            section: 'Building',
            info: userData.permanentAddress?.building || '',
        },
        {
            index: 5,
            section: 'Block No.',
            info: userData.permanentAddress?.blockNo || '',
        },
        {
            index: 6,
            section: 'Lot No.',
            info: userData.permanentAddress?.lotNo || '',
        },
        {
            index: 7,
            section: 'Phase No.',
            info: userData.permanentAddress?.phaseNo || '',
        },
        {
            index: 8,
            section: 'Subdivision',
            info: userData.permanentAddress?.subdivision || '',
        },
        {
            index: 9,
            section: 'Barangay',
            info: userData.permanentAddress?.barangay || '',
        },
        {
            index: 10,
            section: 'City/Municipality',
            info: userData.permanentAddress?.city || '',
        },
        {
            index: 11,
            section: 'Province',
            info: userData.permanentAddress?.province || '',
        },
        {
            index: 12,
            section: 'Region',
            info: userData.permanentAddress?.region || '',
        },
    ];
    const presentAddress = [
        {
            index: 1,
            section: 'House No.',
            info: userData.presentAddress?.houseNo || '',
        },
        {
            index: 2,
            section: 'Street',
            info: userData.presentAddress?.street || '',
        },
        {
            index: 3,
            section: 'Unit/Floor/Room No.',
            info: userData.presentAddress?.unitFloorRoomNo || '',
        },
        {
            index: 4,
            section: 'Building',
            info: userData.presentAddress?.building || '',
        },
        {
            index: 5,
            section: 'Block No.',
            info: userData.presentAddress?.blockNo || '',
        },
        {
            index: 6,
            section: 'Lot No.',
            info: userData.presentAddress?.lotNo || '',
        },
        {
            index: 7,
            section: 'Phase No.',
            info: userData.presentAddress?.phaseNo || '',
        },
        {
            index: 8,
            section: 'Subdivision',
            info: userData.presentAddress?.subdivision || '',
        },
        {
            index: 9,
            section: 'Barangay',
            info: userData.presentAddress?.barangay || '',
        },
        {
            index: 10,
            section: 'City/Municipality',
            info: userData.presentAddress?.city || '',
        },
        {
            index: 11,
            section: 'Province' || '',
            info: userData.presentAddress?.province || '',
        },
        {
            index: 12,
            section: 'Region',
            info: userData.presentAddress?.region || '',
        },
    ];
    const householdInfo = [
        {
            index: 1,
            section: 'Household No.',
            info: userType === 'resident' && householdData ? householdData.householdID : '',
        },
        {
            index: 2,
            section: 'Household Head',
            info: userType === 'resident' && householdData.householdHead
                ? `${householdData.householdHead.firstName} ${householdData.householdHead.lastName}`
                : '',
        },
        {
            index: 3,
            section: 'Contact Number',
            info: userType === 'resident' && householdData.householdHead
                ? `${householdData.householdHead.contactNumber}`
                : '',
        },
        {
            index: 4,
            section: 'Household Members',
            info: userType === 'resident' && Array.isArray(householdData.members)
                ? householdData.members
                : [],
        },
    ];
    const otherInfo = [
        { index: 1, section: 'PWD ID No.', info: userData.pwdid_num || '' },
        { index: 2, section: 'Solo Parent ID No.', info: userData.soloParentID || '' },
        { index: 3, section: 'Senior Citizen ID No.', info: userData.seniorcitizenid_num || '' },
        { index: 4, section: 'PhilSys No.', info: userData.philsys_num || '' },
        { index: 5, section: `Voter's ID no`, info: userData.voters_id || '' },
        { index: 6, section: 'SSS', info: userData.sss_num || '' },
        { index: 7, section: 'Pag-IBIG', info: userData.pagibig_num || '' },
        { index: 8, section: 'PhilHealth', info: userData.philhealth_num || '' },
        { index: 9, section: 'TIN', info: userData.tin_num || '' },
    ]
    const getUserData = async (isRefreshing = false) => {
        if (!isRefreshing) {
            setIsLoading(true);
        }
        try {
            const userDataString = JSON.parse(await AsyncStorage.getItem('userData'));
            if (userDataString) {
                const endpoint = userType === 'official' ? `/admin/id/` : `/residents/`;
                const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}${endpoint}${userDataString._id}`);
                if (response) {
                    setUserData(response.data);
                    await AsyncStorage.removeItem('userData');
                    await AsyncStorage.setItem('userData', JSON.stringify(response.data));
                }
            } else {
                console.warn('No user data found in AsyncStorage');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        getUserData(true);
    };

    useEffect(() => {
        const getUserType = async () => {
            try {
                const userType = await AsyncStorage.getItem('userType');
                const fullName = await AsyncStorage.getItem('fullName');
                if (userType && fullName) {
                    setUserType(userType);
                    setFullName(fullName);
                }
            } catch (error) {
                console.error('Error fetching userType:', error);
            }
        };
        getUserType();
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (userType) {
                getUserData(false);
            }
        }, [userType])
    )

    const getHouseholdData = async (householdID) => {
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/household/id/${householdID}`);
            if (response.data) {
                setHouseholdData(response.data);
            } else {
                console.error('Error fetching household info:', response.data);
                alert('Error fetching household information');
            }
        } catch (error) {
            console.error('Error fetching household info:', error.response || error.message);
            alert('Error fetching household information');
        }
    };

    useEffect(() => {
        if (userData && userData.householdID) {
            const householdID = userData.householdID._id;
            getHouseholdData(householdID);
        }
    }, [userData]);

    const openFullScreenPicture = (imageUri) => {
        navigation.navigate('Full Screen Picture', { imageUri });
    };

    const handleLogout = async () => {
        setModalContent({
            title: 'Confirm Log out',
            message: 'Are you sure you want to log out?',
            buttons: [
                {
                    label: 'Cancel',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary,
                },
                {
                    label: 'Log out',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('userType');
                            await AsyncStorage.removeItem('userData');
                            await AsyncStorage.removeItem('userToken');
                            await AsyncStorage.removeItem('fullName');
                            await AsyncStorage.removeItem('barangayData');
                            await AsyncStorage.removeItem('directoryData');
                            await AsyncStorage.removeItem('hotlinesData');
                            await AsyncStorage.removeItem('fcmToken');
    
                            navigation.navigate('Login');
    
                        } catch (error) {
                            console.error('Error during logout:', error.response);
                        }
                    },
                    buttonStyle: globalStyles.modalButtonDanger,
                    textStyle: globalStyles.modalButtonTextDanger,
                },
            ],
        });
        setShowAlertModal(true);
    };    

    return (
        <View style={globalStyles.container}>
            <View style={[styles.headerContainer, {marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight}]}>
                <Text style={fontStyles.screenTitle}>Profile</Text>
                <TouchableOpacity onPress={handleLogout} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[fontStyles.bold, {color: colors.primary, marginRight: 5}]}>Log out</Text>
                    <MaterialCommunityIcons name="logout" size={30} color={colors.primary} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={globalStyles.scrollViewContainer} refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh}/>}>
                {isLoading ? (
                        <ProfileContentLoader/>
                ) : ( 
                    userData !== '' ? (
                        <>
                            <View style={styles.profileHeaderContainer}>
                                {userData.profilepic ? (
                                    <TouchableOpacity onPress={() => openFullScreenPicture(userData.profilepic)}>
                                        <Image source={{ uri: userData.profilepic }} style={styles.profilePicture} />
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.profilePicture}>
                                        <MaterialCommunityIcons name="account" size={40} color={colors.white} />
                                    </View>
                                )}
                                <Text style={fontStyles.h2}>{fullName}</Text>
                                <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.s}}>
                                    {(userType === 'resident' && userData.accountStatus !== '') && <Tags category={userData.accountStatus} backgroundColor={getStatusColor(userData.accountStatus)} color={colors.white}/>}
                                    <Text style={fontStyles.body}>{userData.roleinBarangay}</Text>
                                </View>
                            </View>

                            {userData.accountStatus === 'Denied' && (
                                <View style={{marginBottom: spacing.m}}>
                                    <Text style={[fontStyles.bold, {color: colors.red}]}>Your account has been denied</Text>
                                    <Text style={fontStyles.body}>Reason: {userData.remarks}</Text>
                                </View>
                            )}

                            <View style={styles.profileSectionContainer}>
                                <View style={styles.profileSectionWrapper}>
                                    <View style={styles.profileSectionHeader}>
                                        <Text style={fontStyles.h3}>Personal Information</Text>
                                    </View>
                                    {userPersonalInfo.map((item) => (
                                        (item.info !== '') && (
                                            <View key={item.index} style={styles.profileContent}>
                                                <Text style={fontStyles.body}><Text style={fontStyles.bold}>{item.section}</Text>: {String(item.info)}</Text>
                                            </View>
                                        )
                                    ))}
                                </View>

                                {specialStatus.some(item => item.info) && (
                                <View style={styles.profileSectionWrapper}>
                                    <View style={styles.profileSectionHeader}>
                                        <Text style={fontStyles.h3}>Special Status</Text>
                                    </View>
                                    {specialStatus.map((item) => (
                                        (item.info !== '') && (
                                            <View key={item.index} style={styles.profileContent}>
                                                <Text style={fontStyles.body}><Text style={fontStyles.bold}>{item.section}</Text></Text>
                                            </View>
                                        )
                                    ))}
                                </View>
                                )}
                                
                                {isPresentAddressEmpty ? (
                                    // Render Permanent Address as both Permanent and Present Address
                                    <View style={styles.profileSectionWrapper}>
                                        <View style={styles.profileSectionHeader}>
                                            <Text style={fontStyles.h3}>Permanent and Present Address</Text>
                                        </View>
                                        {permanentAddress.map((item) => (
                                            (item.info !== '') && (
                                                <View key={item.index} style={styles.profileContent}>
                                                    <Text style={fontStyles.body}><Text style={fontStyles.bold}>{item.section}</Text>: {String(item.info)}</Text>
                                                </View>
                                            )
                                        ))}
                                    </View>
                                ) : (
                                    <>
                                        {/* Render Permanent Address */}
                                        <View style={styles.profileSectionWrapper}>
                                            <View style={styles.profileSectionHeader}>
                                                <Text style={fontStyles.h3}>Permanent Address</Text>
                                            </View>
                                            {permanentAddress.map((item) => (
                                                (item.info !== '') && (
                                                    <View key={item.index} style={styles.profileContent}>
                                                        <Text style={fontStyles.body}><Text style={fontStyles.bold}>{item.section}</Text>: {String(item.info)}</Text>
                                                    </View>
                                                )
                                            ))}
                                        </View>

                                        {/* Render Present Address */}
                                        <View style={styles.profileSectionWrapper}>
                                            <View style={styles.profileSectionHeader}>
                                                <Text style={fontStyles.h3}>Present Address</Text>
                                            </View>
                                            {presentAddress.map((item) => (
                                                (item.info !== '') && (
                                                    <View key={item.index} style={styles.profileContent}>
                                                        <Text style={fontStyles.body}><Text style={fontStyles.bold}>{item.section}</Text>: {String(item.info)}</Text>
                                                    </View>
                                                )
                                            ))}
                                        </View>
                                    </>
                                )}
                                    
                                {userType === 'resident' && (
                                    <View style={styles.profileSectionWrapper}>
                                        <View style={styles.profileSectionHeader}>
                                            <Text style={fontStyles.h3}>Household Information</Text>
                                        </View>
                                        {householdInfo.map((item) => (
                                            <View key={item.index} style={styles.profileSectionContent}>
                                                <View>
                                                    <Text style={fontStyles.body}>
                                                        <Text style={fontStyles.bold}>{item.section}: </Text>

                                                    {item.index === 4 ? '' : (
                                                        <Text style={fontStyles.body}>{String(item.info)}</Text>
                                                    )}
                                                    </Text>
                                                
                                                    {item.index === 4 && (
                                                        <View>
                                                            {Array.isArray(item.info) && (
                                                                item.info
                                                                    .filter((_, index) => index !== 0)
                                                                    .map((member, index) => (
                                                                        <Text key={index} style={fontStyles.body}>
                                                                            {index + 1}. {member.firstName} {member.lastName} ({member.reltohouseholdhead})
                                                                        </Text>
                                                                    ))
                                                            )}
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {otherInfo.some(item => item.info) && (
                                    <View style={styles.profileSectionWrapper}>
                                        <View style={styles.profileSectionHeader}>
                                            <Text style={fontStyles.h3}>Other Information</Text>
                                        </View>
                                        {otherInfo.map((item) => (
                                            (item.info !== '') && (
                                                <View key={item.index} style={styles.profileContent}>
                                                    <Text style={fontStyles.body}><Text style={fontStyles.bold}>{item.section}</Text>: {String(item.info)}</Text>
                                                </View>
                                            )
                                        ))}
                                    </View>
                                )}

                                <View style={styles.profileSectionWrapper}>
                                    <View style={styles.profileSectionHeader}>
                                        <Text style={fontStyles.h3}>Valid IDs</Text>
                                    </View>
                                    <View style={styles.profileSectionContent}>
                                        <View style={{flexDirection: 'row', gap: spacing.m, flexWrap: 'wrap'}}>
                                            {(userData.validIDs && userData.validIDs.length > 0) && (
                                                userData.validIDs.map((item, index) => (
                                                    <TouchableOpacity key={index} onPress={() => openFullScreenPicture(item)} style={styles.validID}>
                                                        <Image key={index} source={{ uri: item }} style={styles.validID}/>
                                                    </TouchableOpacity>
                                                ))
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                                <TouchableOpacity style={[globalStyles.button, {flex: 1}]} onPress={()=> navigation.navigate('ChangePassword')}>
                                    <Text style={globalStyles.buttonText}>Change Password</Text>
                                </TouchableOpacity>
                        </>
                    ) : (
                        <View style={globalStyles.emptyMessageContainer}>
                            <MaterialCommunityIcons name="close-circle-outline" size={100} color={colors.gray}/>
                            <Text style={globalStyles.emptyMessageText}>Profile failed to load</Text>
                        </View>
                    )
                )}
            </ScrollView>
            <AlertModal
                visible={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={modalContent.title}
                message={modalContent.message}
                buttons={modalContent.buttons}
            />
            <StatusBar barStyle="dark-content" backgroundColor={colors.offWhite} />
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileHeaderContainer: {
        gap: spacing.s,
        marginBottom: spacing.m,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profilePicture: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        backgroundColor: colors.primary,
        borderWidth: 3,
        borderColor: colors.primary,
    },

    profileSectionContainer: {
        gap: spacing.l,
        marginBottom: spacing.m
    },
    profileSectionWrapper: {
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.l,
        borderRadius: sizes.radius,
        backgroundColor: colors.white
    },
    profileSectionHeader: {
        paddingBottom: spacing.s,
        marginBottom: spacing.s,
        borderBottomWidth: 3,
        borderBottomColor: colors.primary,
    },
    profileSectionContent: {
        gap: 20
    },

    validID: {
        width: '100%',
        height: 200,
        borderRadius: sizes.radius
    }
});

export default Profile;