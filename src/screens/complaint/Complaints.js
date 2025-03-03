import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import useFormatShortDateTime from '../../hooks/useFormatShortDateTime';
import ComplaintsContentLoader from '../../components/content-loaders/ComplaintsContentLoader';
import AlertModal from '../../components/modals/AlertModal';
import SearchBar from '../../components/SearchBar';
import Tags from '../../components/Tags';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';

const Complaints = () => {
    const navigation = useNavigation();
    const formatShortDateTime = useFormatShortDateTime();

    const [userType, setUserType] = useState('');
    const [userData, setUserData] = useState(null);
    const [incidentReports, setIncidentReports] = useState([]);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOptionIndex, setSortOptionIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true); 
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });

    const flatListRef = useRef();
    const LEFT_OFFSET = spacing.m;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return colors.yellow;
            case 'Processing':
                return colors.blue;
            case 'Verified':
                return colors.pink;
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

    const statuses = ['All', 'Pending', 'Processing', 'Active', 'Verified', 'Settled', 'Rejected', 'Archived'];
    const sortOptions = ['Date Created: Newest to Oldest', 'Date Created: Oldest to Newest'];

    useEffect(() => {
        const getUserTypeData = async () => {
            try {
                const userType = await AsyncStorage.getItem('userType');
                const userData = JSON.parse(await AsyncStorage.getItem('userData'));
                if (userType && userData) {
                    setUserType(userType);
                    setUserData(userData);
                }
            } catch (error) {
                console.error(error);
            }
        };
        getUserTypeData();
    }, [userType]);
    
    const getIncidentReports = async (isRefresh = false) => {
        if (!isRefresh) {
            setIsLoading(true);
        }
        try {
            let response;
            if (userType === 'resident') {
                const userData = JSON.parse(await AsyncStorage.getItem('userData'));
                response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/incident-reports/history/${userData._id}`);
            } else if (userType === 'official') {
                response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/all/incident-reports`);
            } else {
                console.error('Unknown user type');
                setIncidentReports([]);
                return;
            }
    
            const sortedReports = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setIncidentReports(sortedReports.length > 0 ? sortedReports : []);
        } catch (error) {
            if (error.response?.status === 404) {
                setIncidentReports([]);
                setModalContent({
                    title: 'No Complaints Found',
                    message: 'There are currently no complaints in the system.',
                    buttons: [
                        {
                            label: 'Close',
                            onPress: () => setShowAlertModal(false)
                        }
                    ],
                });
                setShowAlertModal(true);
            } else {
                alert(`${error.response?.data?.message || 'Unknown error'}`);
            }
        } finally {
            setIsLoading(false); 
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        getIncidentReports(true);
    };

    useFocusEffect(
        useCallback(() => {
            if (userData) {
                getIncidentReports();
            }
        }, [userData])
    );
    
    const filteredRequests = incidentReports.filter(incidentReport =>
        (filterStatus === 'All' || incidentReport.status === filterStatus) &&
        (searchTerm === '' || incidentReport.ReferenceNo.includes(searchTerm))
    );

    const sortedReports = filteredRequests.sort((a, b) => {
        const sortBy = sortOptions[sortOptionIndex]; 
        const sortOrderMultiplier = sortBy === 'Date Created: Newest to Oldest' ? -1 : 1;

        if (sortBy.includes('Date Created')) {
            return (new Date(a.created_at) - new Date(b.created_at)) * sortOrderMultiplier;
        }
        return 0;
    });

    const handleFilterPress = (index) => {
        setFilterStatus(statuses[index]);
        flatListRef.current.scrollToIndex({ index, animated: true, viewOffset: LEFT_OFFSET });
    };

    const handleCreatePress = () => {
        if (userData.accountStatus === 'Pending') {
            setModalContent({
                title: 'Pending Verification',
                message: 'Your account is not verified yet. Please wait for account approval to file a complaint.',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ],
            });
            setShowAlertModal(true);
        } else if (userData.accountStatus === 'Rejected') {
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
            navigation.navigate('CreateComplaint');
        }
    };

    useLayoutEffect(() => {
        if (userType === 'resident') {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={handleCreatePress} style={{ flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[fontStyles.bold, {color: colors.primary, marginRight: 5}]}>Create</Text>
                        <MaterialCommunityIcons name="plus" size={30} color={colors.primary} />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, userType, userData]);

    return (
        <View style={globalStyles.container}>
            <View style={{ paddingHorizontal: spacing.m }}>
                <Text style={fontStyles.screenTitle}>Complaints</Text>
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder={'Search by barangay case no...'}/>
            </View>

            <View>
                <FlatList
                    ref={flatListRef}
                    data={statuses}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={globalStyles.filterFlatList}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={[
                                globalStyles.tag,
                                filterStatus === item && globalStyles.selectedTag
                            ]}
                            onPress={() => handleFilterPress(index)}
                        >
                            <Text style={filterStatus === item ? globalStyles.selectedTagText : globalStyles.tagText }>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>

            <View style={{ paddingTop: spacing.m, paddingHorizontal: spacing.m }}>
                <Dropdown
                    style={[globalStyles.inputBox, focusedInput === 'sortOption' && { borderColor: colors.primary }]}
                    label="Sort by"
                    labelField="label"
                    valueField="value"
                    data={sortOptions.map((item) => ({ label: item, value: item }))}
                    value={sortOptions[sortOptionIndex]}
                    onChange={(item) => {
                        const selectedValue = item.value;
                        const index = sortOptions.findIndex(option => option === selectedValue);
                        if (index !== -1) {
                            setSortOptionIndex(index);
                        }
                    }}
                    onFocus={() => setFocusedInput('sortOption')}
                    onBlur={() => setFocusedInput(null)}/>
            </View>

            <View style={globalStyles.filterResultsHeader}>
                <Text style={fontStyles.h3}>History</Text>
                <Text style={[fontStyles.body, {color: colors.darkgray}]}>{filteredRequests.length} result{filteredRequests.length !== 1 ? 's' : ''} found</Text>
            </View>

            {isLoading ? (
                <ComplaintsContentLoader />
            ) : (
                incidentReports && sortedReports.length > 0 ? (
                    <FlatList
                        data={sortedReports}
                        contentContainerStyle={globalStyles.flatListContainer}
                        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                        renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('ComplaintDetail', { complaintID: item._id })}
                            style={globalStyles.historyWrapper}
                        >
                            <Text style={fontStyles.body}>{formatShortDateTime(item.created_at)}</Text>
                            <Text style={fontStyles.body}>Barangay Case No. {item.ReferenceNo}</Text>
                            <Text style={fontStyles.bold}>{item.typeofcomplaint}</Text>
                            <Tags category={item.status} backgroundColor={getStatusColor(item.status)} color={colors.white}/>
                        </TouchableOpacity>
                        )}
                    />
                ) : (
                    <View style={globalStyles.emptyMessageContainer}>
                        <MaterialCommunityIcons name="magnify-remove-outline" size={100} color={colors.gray} />
                        <Text style={globalStyles.emptyMessageText}>No results found</Text>
                    </View>
                )
            )}
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

export default Complaints;