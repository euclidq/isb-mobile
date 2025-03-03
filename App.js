import { StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { colors, globalStyles } from './src/styles/theme';
import { useLoadFonts } from './src/hooks/useLoadFonts';
import { NetworkProvider } from './src/components/NetworkProvider';
import NetworkBanner from './src/components/NetworkBanner';
import FullScreenPicture from './src/components/FullScreenPicture';

import Onboarding from './src/screens/Onboarding';
import Login from './src/screens/Login';
import ForgotPassword from './src/screens/forgot-password/ForgotPassword';
import OTPVerification from './src/screens/forgot-password/OTPVerification';
import ResetPassword from './src/screens/forgot-password/ResetPassword';

import SignUp from './src/screens/SignUp';
import Home from './src/screens/Home';
import Profile from './src/screens/Profile';
import ChangePassword from './src/screens/ChangePassword';

import Announcements from './src/screens/announcement/Announcements';
import AnnouncementDetail from './src/screens/announcement/AnnouncementDetail';
import CreateAnnouncement from './src/screens/announcement/CreateAnnouncement';
import EditAnnouncement from './src/screens/announcement/EditAnnouncement';

import CreateDocumentRequest from './src/screens/document-request/CreateDocumentRequest';
import DocumentRequests from './src/screens/document-request/DocumentRequests';
import DocumentRequestDetail from './src/screens/document-request/DocumentRequestDetail';
import EditDocumentRequest from './src/screens/document-request/EditDocumentRequest';

import Complaints from './src/screens/complaint/Complaints';
import CreateComplaint from './src/screens/complaint/CreateComplaint';
import ComplaintDetail from './src/screens/complaint/ComplaintDetail';
import EditComplaint from './src/screens/complaint/EditComplaint';

import NotificationInbox from './src/screens/NotificationInbox';
import HelpCenter from './src/screens/HelpCenter';

import EmergencyServices from './src/screens/emergency-services/EmergencyServices';
import BarangayDirectory from './src/screens/BarangayDirectory';
import BarangayInformation from './src/screens/BarangayInformation';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const storedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
    const storedUserType = await AsyncStorage.getItem('userType');

    let response;
    if (storedUserType === 'official') {
      response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/notifications`);
      const filteredNotifications = response.data.notifications.filter(n => n.data.user === 'official');
    } else {
      response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/notifications/user/${storedUserData._id}`);
      setUnreadCount(response.data.notifications.filter(n => !n.readStatus).length);
    }
  };  

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);  

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Notifications') {
              iconName = focused ? 'bell' : 'bell-outline';
            } else if (route.name === 'Help Center') {
              iconName = focused ? 'information' : 'information-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'account' : 'account-outline';
            }

            return (
              <MaterialCommunityIcons
                name={iconName}
                size={35}
                color={focused ? colors.primary : 'gray'}
                style={{ paddingTop: 10, marginTop: -20 }}
              />
            );
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarStyle: {
            paddingTop: 20,
            height: 80,
          },
        })}
      >
        <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Tab.Screen
          name="Notifications"
          component={NotificationInbox}
          options={{
            headerShown: false,
            tabBarBadge: unreadCount > 0 ? unreadCount : null,
          }}
        />
        <Tab.Screen name="Help Center" component={HelpCenter} options={{ headerShown: false }} />
        <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
      </Tab.Navigator>
      <StatusBar barStyle="dark-content" backgroundColor={colors.offWhite}/>
    </>
  );
}

export default function App() {
  const { fontsLoaded, error } = useLoadFonts();
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('hasLaunched');
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkFirstLaunch();
  }, []);

  if (isLoading || !fontsLoaded) {
    return null
  }

  return (
    <NetworkProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={isFirstLaunch ? 'Onboarding' : 'Login'}>
          <Stack.Screen
            name="Onboarding"
            component={Onboarding}
            options={{ headerShown: false }} />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }} />
          <Stack.Screen
            name="SignUp"
            component={SignUp}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />
          <Stack.Screen
            name="OTPVerification"
            component={OTPVerification}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPassword}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />

          <Stack.Screen
            name="Home Screen"
            component={TabNavigator}
            options={{ headerShown: false }} />

          <Stack.Screen
            name="Announcements"
            component={Announcements}
            options={globalStyles.headerOptions} />
          <Stack.Screen
            name="AnnouncementDetail"
            component={AnnouncementDetail}
            options={globalStyles.headerOptions} />
          <Stack.Screen
            name="CreateAnnouncement"
            component={CreateAnnouncement}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />
          <Stack.Screen
            name="EditAnnouncement"
            component={EditAnnouncement}
            options={globalStyles.headerOptions} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePassword}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />

          <Stack.Screen
            name="CreateDocumentRequest"
            component={CreateDocumentRequest}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />
          <Stack.Screen
            name='DocumentRequests'
            component={DocumentRequests}
            options={globalStyles.headerOptions} />
          <Stack.Screen
            name='DocumentRequestDetail'
            component={DocumentRequestDetail}
            options={globalStyles.headerOptions} />
          <Stack.Screen
            name='EditDocumentRequest'
            component={EditDocumentRequest}
            options={globalStyles.headerOptions}
          />

          <Stack.Screen
            name="Complaints"
            component={Complaints}
            options={globalStyles.headerOptions} />
          <Stack.Screen
            name="CreateComplaint"
            component={CreateComplaint}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />
          <Stack.Screen
            name="ComplaintDetail"
            component={ComplaintDetail}
            options={globalStyles.headerOptions} />
          <Stack.Screen
            name="EditComplaint"
            component={EditComplaint}
            options={globalStyles.headerOptions} />

          <Stack.Screen
            name="BarangayDirectory"
            component={BarangayDirectory}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />
          <Stack.Screen
            name="BarangayInformation"
            component={BarangayInformation}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />
          <Stack.Screen
            name="Emergency Services"
            component={EmergencyServices}
            options={{ ...globalStyles.headerOptions, headerTitleAlign: 'center' }} />
          <Stack.Screen
            name="Full Screen Picture"
            component={FullScreenPicture}
            options={{ headerShown: false }} />
        </Stack.Navigator>
        <NetworkBanner />
        <StatusBar barStyle="dark-content" backgroundColor={colors.offWhite} />
      </NavigationContainer>
    </NetworkProvider>
  );
}