import { useCallback, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, FlatList, Alert, RefreshControl, ActivityIndicator, Touchable, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import useCalculateTimeAgo from '../hooks/useCalculateTimeAgo';
import NotificationsContentLoader from '../components/content-loaders/NotificationsContentLoader';
import AlertModal from '../components/modals/AlertModal';
import { colors, sizes, spacing, fontStyles, globalStyles } from '../styles/theme';

const NotificationInbox = () => {
  const navigation = useNavigation();
  const calculateTimeAgo = useCalculateTimeAgo();
  const [userType, setUserType] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
        case 'Approved':
          return colors.green;
        case 'Settled':
            return colors.darkgray;
        case 'Released':
          return colors.darkgray;
        case 'Rejected':
            return colors.red;
        case 'Denied':
            return colors.red;
        case 'Archived':
            return colors.lightgray;
        default:
            return colors.primary;
    }
  };

  const fetchNotifications = async ( isRefreshing = false ) => {
    if (!isRefreshing) {
      setIsLoading(true);
    }
    try {
      const storedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
      const storedUserType = await AsyncStorage.getItem('userType');
      setUserType(storedUserType);

      if (storedUserType === 'official') {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/notifications`);
        setNotifications(response.data.notifications.filter(n => n.data.user === 'official'));
      } else {
        const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/notifications/user/${storedUserData._id}`);
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error.response.data.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications(true);
    }, [])
  )

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications(true);
  }

  const handleNotificationClick = async (notification) => {
    try {
      await axios.put(`${process.env.EXPO_PUBLIC_API_BASE_URL}/notifications/${notification._id}/read`, { readStatus: true });

      if (notification.data) {
        if (notification.data.type === 'Complaint') {
          navigation.navigate('ComplaintDetail', { complaintID: notification.data.reportId });
        } else if (notification.data.type === 'Document Request') {
          navigation.navigate('DocumentRequestDetail', { documentRequestID: notification.data.requestId });
        }
      }

      setNotifications(notifications.map(n => n._id === notification._id ? { ...n, readStatus: true } : n));
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleNotificationDelete = (notification) => {
    setModalContent({
      title: 'Delete Notification',
      message: 'Do you want to delete this notification?',
      buttons: [
        {
          label: 'Cancel',
          onPress: () => setShowAlertModal(false),
          buttonStyle: globalStyles.modalButtonSecondary,
          textStyle: globalStyles.modalButtonTextSecondary,
        },
        {
          label: 'Delete',
          onPress: async () => {
            try {
              const response = await axios.delete(`${process.env.EXPO_PUBLIC_API_BASE_URL}/notifications/${notification._id}`);
              
              if (response.status === 200) {
                setNotifications(notifications.filter(n => n._id !== notification._id));
                setModalContent({
                  title: 'Success',
                  message: 'Notification deleted successfully.',
                  buttons: [
                    {
                      label: 'Close',
                      onPress: () => setShowAlertModal(false),
                    }
                  ]
                });
                setShowAlertModal(true); // Show the alert modal here
              }
            } catch (error) {
              console.error('Error deleting notification:', error);
            }
          },          
          buttonStyle: globalStyles.modalButtonDanger,
          textStyle: globalStyles.modalButtonTextDanger,
        }
      ]
    });
    setShowAlertModal(true);
  };

  const unreadNotifications = notifications.filter(notification => !notification.readStatus);
  const readNotifications = notifications.filter(notification => notification.readStatus);

  return (
    <>
      <SafeAreaView style={{ backgroundColor: colors.offWhite }} />
      <View style={[globalStyles.container, {marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight}]}>
        <Text style={[fontStyles.screenTitle, {paddingHorizontal: spacing.m}]}>Notifications</Text>

        <ScrollView
          contentContainerStyle={globalStyles.scrollViewContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
        >
        {isLoading ? (
          <NotificationsContentLoader />
        ) : (
            notifications.length > 0 ? (
              <View style={styles.notificationContainer}>
                {userType === 'official' ? ( 
                  notifications.length > 0 && (
                    <View style={styles.notificationWrapper}>
                      <FlatList
                        data={notifications}
                        keyExtractor={(item) => item._id}
                        contentContainerStyle={{ flexGrow: 1, gap: spacing.m }}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <TouchableOpacity style={styles.notificationItem} onPress={() => handleNotificationClick(item)}>
                            <MaterialCommunityIcons
                              name={
                                item.data.type === 'Complaint' ? 'police-badge' :
                                item.data.type === 'Document Request' ? 'file-document' :
                                'bell'
                              }
                              size={40}
                              color={getStatusColor(item.data.status)}
                            />
                            <View style={styles.notificationText}>
                              <Text style={fontStyles.bold}>{item.title}</Text>
                              <Text style={fontStyles.body}>{item.message}</Text>
                              <Text style={[fontStyles.body, { color: colors.darkgray }]}>{calculateTimeAgo(item.timestamp)}</Text>
                            </View>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  )
                ) : (
                  <>
                    {unreadNotifications.length > 0 && (
                      <View style={styles.notificationWrapper}>
                        <Text style={fontStyles.h3}>Unread</Text>
                        <FlatList
                          data={unreadNotifications}
                          keyExtractor={(item) => item._id}
                          contentContainerStyle={{ flexGrow: 1, gap: spacing.m }}
                          scrollEnabled={false}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.notificationItem}
                              onPress={() => handleNotificationClick(item)}
                              onLongPress={() => handleNotificationDelete(item)}
                            >
                              <MaterialCommunityIcons
                                name={
                                  item.data.type === 'Complaint' ? 'police-badge' :
                                  item.data.type === 'Document Request' ? 'file-document' :
                                  'bell'
                                }
                                size={40}
                                color={getStatusColor(item.data.status)}
                              />
                              <View style={styles.notificationText}>
                                <Text style={fontStyles.bold}>{item.title}</Text>
                                <Text style={fontStyles.body}>{item.message}</Text>
                                <Text style={[fontStyles.body, { color: colors.darkgray }]}>{calculateTimeAgo(item.timestamp)}</Text>
                              </View>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    )}

                    {readNotifications.length > 0 && (
                      <View style={styles.notificationWrapper}>
                        <Text style={fontStyles.h3}>Read</Text>
                        <FlatList
                          data={readNotifications}
                          keyExtractor={(item) => item._id}
                          contentContainerStyle={{ flexGrow: 1, gap: spacing.m }}
                          scrollEnabled={false}
                          renderItem={({ item }) => (
                            <TouchableOpacity
                              style={styles.notificationItem}
                              onPress={() => handleNotificationClick(item)}
                              onLongPress={() => handleNotificationDelete(item)}
                            >
                              <MaterialCommunityIcons
                                name={
                                  item.data.type === 'Complaint' ? 'police-badge' :
                                  item.data.type === 'Document Request' ? 'file-document' :
                                  'bell'
                                }
                                size={40}
                                color={getStatusColor(item.data.status)}
                              />
                              <View style={styles.notificationText}>
                                <Text style={fontStyles.bold}>{item.title}</Text>
                                <Text style={fontStyles.body}>{item.message}</Text>
                                <Text style={[fontStyles.body, { color: colors.darkgray }]}>{calculateTimeAgo(item.timestamp)}</Text>
                              </View>
                            </TouchableOpacity>
                          )}
                        />
                      </View>
                    )}
                  </>
                )}
                
              </View>
            ) : (
              <View style={globalStyles.emptyMessageContainer}>
                <MaterialCommunityIcons name="bell-off-outline" size={100} color={colors.gray} />
                <Text style={globalStyles.emptyMessageText}>No notifications found</Text>
              </View>
            )
          )}
        </ScrollView>
      </View>
      <AlertModal
        visible={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={modalContent.title}
        message={modalContent.message}
        buttons={modalContent.buttons}
      />
    </>
  );
}

const styles = StyleSheet.create({
  notificationContainer: {
    gap: spacing.l,
  },
  notificationWrapper: {
    gap: spacing.s
  },
  notificationItem: {
    gap: spacing.m,
    padding: spacing.m,
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: sizes.radius,
    backgroundColor: colors.white,
  },
  notificationText: {
    flex: 1,
  },
});

export default NotificationInbox;