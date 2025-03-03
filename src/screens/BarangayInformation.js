import React, { useEffect, useState } from 'react';
import { Text, View, Image, ScrollView, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import LoadingModal from '../components/LoadingModal';
import useHandleScroll from '../hooks/useHandleScroll';
import { colors, sizes, spacing, globalStyles, fontStyles} from '../styles/theme';

const BarangayInformation = () => {
    const navigation = useNavigation();
    const handleScroll = useHandleScroll(navigation, 'Barangay Information');
    const [barangay, setBarangay] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getBarangayData = async () => {
            try {
                await AsyncStorage.getItem('barangayData');
                setBarangay(JSON.parse(await AsyncStorage.getItem('barangayData')));
            } catch (error) {
                console.error('Error fetching barangay info:', error.response || error.message);
                alert('Error fetching barangay information');
            } finally {
                setIsLoading(false);
            }
        };
        getBarangayData();
    }, []);
    
    const barangayInformation = [
        {
            label: 'Barangay',
            value: barangay.barangayName || ''
        },
        {
            label: 'City/municipality',
            value: barangay.municipality || ''
        },
        {
            label: 'Province',
            value: barangay.province || ''
        },
        {
            label: 'Contact Number',
            value: barangay.contactnumber || ''
        },
        {
            label: 'Email Address',
            value: barangay.email || ''
        },
        {
            label: 'History',
            value: barangay.history || ''
        },
        {
            label: 'Location',
            value: barangay.location || ''
        },
        {
            label: 'Population',
            value: `The household population of Barangay 52-Ipil in the 2015 Census was 1,095 broken down into 306 households or an average of 3.58 members per household. Its population as determined by the 2020 Census was 1,174. This represented 1.17% of the total population of Cavite City.\n\nThe registered resident in the database ${barangay?.population === 1 ? 'is' : 'are'} ${barangay?.population || 'Loading...'} and the total household registered in the database ${barangay?.household === 1 ? 'is' : 'are'} ${barangay?.household || 'Loading...'}`
        }
    ];

    const openFullScreenPicture = (imageUri) => {
        navigation.navigate('Full Screen Picture', { imageUri });
    };

    return (
        <View style={globalStyles.container}>
            <ScrollView onScroll={handleScroll} contentContainerStyle={[globalStyles.scrollViewContainer, {paddingTop: 0}]}>
                <Text style={fontStyles.screenTitle}>Barangay Information</Text>
                {isLoading
                    ? <LoadingModal visible={isLoading} purpose='Loading'/>
                    : barangay ? (
                    <View style={globalStyles.detailCard}>
                        <TouchableOpacity onPress={() => openFullScreenPicture(barangay.logo)}>
                            <Image source={{ uri: barangay.logo }} style={{width: '100%', height: 200, alignSelf: 'center', resizeMode: 'contain'}} />
                        </TouchableOpacity>
                        <FlatList
                            data={barangayInformation}
                            contentContainerStyle={[globalStyles.flatListContainer, {padding:0}]}
                            keyExtractor={(item, index) => index.toString()}
                            scrollEnabled={false}
                            renderItem={({ item }) => (
                                <View>
                                    <Text style={fontStyles.h3}>{item.label}</Text>
                                    <Text style={fontStyles.body}>{item.value}</Text>
                                </View>
                            )}
                        />
                    </View>
                ) : (
                    <View style={globalStyles.emptyMessageContainer}>
                        <MaterialCommunityIcons name="close-circle-outline" size={100} color={colors.gray}/>
                        <Text style={globalStyles.emptyMessageText}>Barangay Information failed to load</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default BarangayInformation;
