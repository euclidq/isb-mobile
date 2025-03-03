import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import LoadingModal from '../components/LoadingModal';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../styles/theme';
import useHandleScroll from '../hooks/useHandleScroll';
import { useNavigation } from '@react-navigation/native';

const BarangayDirectory = () => {
    const navigation = useNavigation();
    const handleScroll = useHandleScroll(navigation, 'Barangay Directory');
    const [barangayOfficials, setBarangayOfficials] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const getBarangayOfficialData = async () => {
            try {
                const storedDirectoryData = JSON.parse(await AsyncStorage.getItem('directoryData'));
                if (storedDirectoryData) {
                    // Sort officials by role in Barangay with desired priority
                    const sortedOfficials = storedDirectoryData.sort((a, b) => {
                        const rolePriority = {
                            'Barangay Captain': 1,
                            'Secretary': 2,
                            'Treasurer': 3,
                            'Kagawad': 4
                        };

                        return (rolePriority[a.roleinBarangay] || 5) - (rolePriority[b.roleinBarangay] || 5);
                    });

                    setBarangayOfficials(sortedOfficials);
                }
            } catch (error) {
                console.error('Error fetching barangay directory:', error.response || error.message);
                alert('Error fetching barangay directory');
            } finally {
                setIsLoading(false);
            }
        };
        getBarangayOfficialData();
    }, []);

    return (
        <View style={globalStyles.container}>
            <ScrollView onScroll={handleScroll} contentContainerStyle={[globalStyles.scrollViewContainer,]}>
                <Text style={fontStyles.screenTitle}>Barangay Directory</Text>
                {isLoading ? <LoadingModal visible={isLoading} purpose={'Loading'} />
                : barangayOfficials.length > 0 ? (
                    <View style={{gap: spacing.m}}>
                        {barangayOfficials.map((user, index) => (
                            <View key={index} style={[globalStyles.detailCard, {flexDirection: 'row', alignItems: 'center'}]}>
                                {user.profilepic
                                ? <Image source={{ uri: user.profilepic || null }} style={styles.profilePic}/>
                                : <View style={styles.profilePic}><MaterialCommunityIcons name="account" size={70} color={colors.white}/></View>}
                                <View style={{flex: 1}}>
                                    <Text style={fontStyles.h3}>{`${user.firstName}${user.middleName ? ' ' + user.middleName + ' ' : ' '}${user.lastName}${user.suffix ? ' ' + user.suffix : ''}`}</Text>
                                    <Text style={fontStyles.body}>{user.roleinBarangay}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={globalStyles.emptyMessageContainer}>
                        <MaterialCommunityIcons name="close-circle-outline" size={100} color={colors.gray}/>
                        <Text style={globalStyles.emptyMessageText}>Barangay Directory failed to load</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    profilePic: {
        width: 80,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        backgroundColor: colors.primary
    },
});

export default BarangayDirectory;