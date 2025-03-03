import { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { Text, View, FlatList, TouchableOpacity, Alert, RefreshControl, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import useFormatShortDateTime  from '../../hooks/useFormatShortDateTime';
import DocumentRequestsContentLoader from '../../components/content-loaders/DocumentRequestsContentLoader';
import AlertModal from '../../components/modals/AlertModal';
import SearchBar from '../../components/SearchBar';
import Tags from '../../components/Tags';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';

const DocumentRequests = () => {
    const navigation = useNavigation();
    const formatShortDateTime = useFormatShortDateTime();

    const [userData, setUserData] = useState('');
    const [userType, setUserType] = useState('');
    const [documentRequests, setDocumentRequests] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [sortOptionIndex, setSortOptionIndex] = useState(0);
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

    const statuses = ['All', 'Pending', 'Processing', 'Approved', 'Released', 'Rejected', 'Archived'];
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
                console.error('Error', 'An error occurred. Please try again later.');
            }
        };
        getUserTypeData();
    }, []);

    const getDocumentRequests = async (isRefresh = false) => {
        if (!isRefresh) {
            setIsLoading(true);
        }
        try {
            if (userType === 'resident') {
                const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/document-requests/history/${userData._id}`);
                setDocumentRequests(response.data);
                setFilterStatus('All');
            } else if (userType === 'official') {
                const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/all/document-requests`);
                setDocumentRequests(response.data.requests);
                setFilterStatus('Pending');
            } else {
                console.error('Unknown user type');
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setDocumentRequests([]);
                setModalContent({
                    title: 'No Document Requests Found',
                    message: 'There are currently no document requests in the system.',
                    buttons: [
                        {
                            label: 'Close',
                            onPress: () => setShowAlertModal(false)
                        }
                    ]
                });
                setShowAlertModal(true);
            }
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setIsRefreshing(true); 
        getDocumentRequests(true);
    };

    useFocusEffect(
        useCallback(() => {
            if (userData) {
                getDocumentRequests();
            }
        }, [userData])
    );

    const filteredRequests = documentRequests.filter(documentRequest => 
        (filterStatus === 'All' 
            ? (userType === 'resident' ? documentRequest.status !== 'Archived' : true) 
            : documentRequest.status === filterStatus
        ) &&
        (searchTerm === '' || 
            documentRequest.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
            documentRequest.ReferenceNo.toString().includes(searchTerm))
    );    

    const sortedRequests = filteredRequests.sort((a, b) => {
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
        if (userData?.accountStatus === 'Pending') {
            setModalContent({
                title: 'Pending Verification',
                message: 'Your account is not verified yet. Please wait for account approval to create a document request.',
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
            navigation.navigate('CreateDocumentRequest');
        }
    };

    useLayoutEffect(() => {
        if (userData && userType === 'resident') {
            navigation.setOptions({
                headerRight: () => (
                    <TouchableOpacity onPress={handleCreatePress} style={{ flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[fontStyles.bold, {color: colors.primary, marginRight: 5}]}>Create</Text>
                        <MaterialCommunityIcons name="plus" size={30} color={colors.primary} />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, userData, userType]);

    return (
        <View style={globalStyles.container}>
            <View style={{ paddingHorizontal: spacing.m }}>
                <Text style={fontStyles.screenTitle}>Document Requests</Text>
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder={'Search by reference no./recipient...'} />
            </View>

            <View>
                <FlatList
                    ref={flatListRef}
                    data={statuses}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={globalStyles.filterFlatList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            style={[
                                globalStyles.tag,
                                filterStatus === item && globalStyles.selectedTag
                            ]}
                            onPress={() => handleFilterPress(index)}
                        >
                            <Text style={filterStatus === item ? globalStyles.selectedTagText : globalStyles.tagText}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
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
                <Text style={[fontStyles.body, {color: colors.darkgray}]}>{sortedRequests.length} result{sortedRequests.length !== 1 ? 's' : ''} found</Text>
            </View>

            {isLoading ? (
                <DocumentRequestsContentLoader />
            ) : (
                sortedRequests && sortedRequests.length > 0 ? (
                    <FlatList
                        data={sortedRequests}
                        contentContainerStyle={globalStyles.flatListContainer}
                        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => navigation.navigate('DocumentRequestDetail', { documentRequestID: item._id })}
                                style={globalStyles.historyWrapper}
                            >
                                <Text style={[fontStyles.body, {color: colors.darkgray}]}>{formatShortDateTime(item.created_at)}</Text>
                                <Text style={fontStyles.body}>Reference No. {item.ReferenceNo}</Text>
                                <Text style={fontStyles.body}>{item.recipient}</Text>
                                <Text style={fontStyles.bold}>{item.documentType}</Text>
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

export default DocumentRequests;