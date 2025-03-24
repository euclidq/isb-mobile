import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import Tags from '../../components/Tags';
import SearchBar from '../../components/SearchBar';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';
import useCalculateTimeAgo from '../../hooks/useCalculateTimeAgo';
import AnnouncementsContentLoader from '../../components/content-loaders/AnnouncementsContentLoader';
import { Dropdown } from 'react-native-element-dropdown';

const Announcements = () => {
    const navigation = useNavigation();
    const calculateTimeAgo = useCalculateTimeAgo();

    const [userType, setUserType] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [filterCategory, setFilterCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    const flatListRef = useRef();
    const LEFT_OFFSET = spacing.m;
    const categories = [ 'All', 'Health and Safety', 'Community Assistance', 'Public Services', 'Events', 'Public Advisory', 'Others', ];

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

    const getAnnouncements = async ( isRefreshing = false) => {
        if (!isRefreshing) {
            setIsLoading(true);
        }
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/announcements`);
            
            const sortedAnnouncements = response.data.announcements.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );
            setAnnouncements(sortedAnnouncements);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setFilterCategory('All');
        }
    };    

    useFocusEffect(
        useCallback(() => {
            getAnnouncements();
        }, [])
    );

    const handleRefresh = () => {
        setIsRefreshing(true);
        getAnnouncements(true);
    };

    const filteredAnnouncements = announcements.filter(announcement => {
        const validCategory = categories.includes(announcement.announcementCategory) ? announcement.announcementCategory : 'Others';
        return (
            (filterCategory === 'All' || validCategory === filterCategory) &&
            (searchTerm === '' || announcement.title.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === 'All' || announcement.status === statusFilter)
        );
    });
    
    const handleCategoryPress = (index) => {
        setFilterCategory(categories[index]);
        flatListRef.current.scrollToIndex({ index, animated: true, viewOffset: LEFT_OFFSET });
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            e.preventDefault();
            navigation.navigate('Home Screen');
        });
    
        return unsubscribe;
    }, [navigation]);

    useLayoutEffect(() => {
        if (userType) {
            navigation.setOptions({
                headerRight: () => (
                    userType === 'official' &&
                    <TouchableOpacity onPress={() => navigation.navigate('CreateAnnouncement')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: colors.primary, marginRight: 5, ...sizes.bold}}>Create</Text>
                        <MaterialCommunityIcons name="plus" size={30} color={colors.primary} />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, userType]);
    
    return (
        <View style={globalStyles.container}>
            <View style={{ paddingHorizontal: spacing.m}}>
                <Text style={fontStyles.screenTitle}>Announcements</Text>
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder={'Search'}/>
                {/* <View style={globalStyles.inputWrapper}>
                    <Text style={{...sizes.body}}>Filter by Category</Text>
                    <Dropdown
                        label="Category"
                        style={[globalStyles.inputBox, focusedInput === 'category' && globalStyles.inputBoxFocused]}
                        placeholderStyle={globalStyles.inputBoxPlaceholder}
                        selectedTextStyle={{ ...sizes.body }}
                        labelField="label"
                        valueField="value"
                        placeholder="Select category..."
                        data={categories.map((category) => ({ label: category, value: category }))}
                        value={filterCategory}
                        onChange={(item) => {
                            const selectedValue = item.value;
                            if (selectedValue !== '') {
                                setFilterCategory(selectedValue);
                            }
                        }}
                        onFocus={() => setFocusedInput('category')}
                        onBlur={() =>setFocusedInput(null)}/>
                </View> */}
            </View>

            <View>
                <FlatList
                    ref={flatListRef}
                    data={categories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={globalStyles.filterFlatList}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => 
                        <TouchableOpacity style={[globalStyles.tag, filterCategory === item && globalStyles.selectedTag]} onPress={() => handleCategoryPress(index)}>
                            <Text style={filterCategory === item ? globalStyles.selectedTagText : globalStyles.tagText }>{item}</Text>
                        </TouchableOpacity>
                    }
                />
            </View>

            <View style={{ paddingTop: spacing.m, paddingHorizontal: spacing.m }}>
                <Dropdown
                    style={[globalStyles.inputBox, focusedInput === 'statusFilter' && { borderColor: colors.primary }]}
                    label="Status"
                    labelField="label"
                    valueField="value"
                    data={[
                        { label: 'All', value: 'All' },
                        { label: 'Active', value: 'Active' },
                        { label: 'Inactive', value: 'Inactive' },
                    ]}
                    value={statusFilter}
                    onChange={(item) => setStatusFilter(item.value)}
                    onFocus={() => setFocusedInput('statusFilter')}
                    onBlur={() => setFocusedInput(null)}
                />
            </View>
    
            <View style={globalStyles.filterResultsHeader}>
                <Text style={fontStyles.h3}>What's Latest?</Text>
                <Text style={[fontStyles.body, { color: colors.darkgray }]}>{filteredAnnouncements.length} result{filteredAnnouncements.length !== 1 ? 's' : ''} found</Text>
            </View>

            {isLoading ? (
                <View style={{padding: spacing.m}}>
                    <AnnouncementsContentLoader />
                </View>
            ) : (
                filteredAnnouncements && filteredAnnouncements.length > 0 ? (
                    <FlatList
                        data={filteredAnnouncements}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={globalStyles.flatListContainer}
                        style={{ flexGrow: 1 }}
                        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh}/>}
                        renderItem={({ item }) => 
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AnnouncementDetail', { announcementID: item._id })}
                                style={globalStyles.announcementCard}
                            >
                                {item.attachments ? 
                                <Image source={{ uri: item.attachments }} style={globalStyles.announcementImage}/> : <View style={globalStyles.announcementImage}>
                                    <MaterialCommunityIcons name="bullhorn-variant" size={50} color={colors.white}/>
                                    <Text style={[fontStyles.body, { color: colors.white }]}>No Image</Text>
                                </View>
                                }
                                <View style={globalStyles.announcementText}>
                                    <Tags category={item.announcementCategory} importance={item.Importance} status={item.status} backgroundColor={colors.secondary} color={colors.primary}/>
                                    <Text style={fontStyles.h3} numberOfLines={2}>{item.title}</Text>
                                    <Text style={[fontStyles.body, { color: colors.darkgray }]}>{calculateTimeAgo(item.created_at)}</Text>
                                </View>
                            </TouchableOpacity>
                        }/>
                ) : (
                    <View style={{flex: 1, justifyContent: 'center'}}>
                        <Text style={[fontStyles.h3, {textAlign: 'center', color: colors.darkgray}]}>No results found</Text>
                    </View>
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    announcementWrapper: {
        minHeight: 150,
        flexDirection: 'row',
        borderRadius: 10,
        gap: spacing.m,
    },
});

export default Announcements;