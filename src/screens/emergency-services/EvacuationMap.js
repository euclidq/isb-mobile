import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, shadow, sizes, spacing } from '../../styles/theme';

const GOOGLE_MAPS_APIKEY = 'AIzaSyDpLwDFGDAxSFaAhiJdf3zLWB0tDAJr2S8';

const EvacuationMap = () => {
  const [evacuationCenter, setEvacuationCenter] = useState({
    latitude: 14.488511949151476,
    longitude: 120.89696535750531,
  });
  const [userLocation, setUserLocation] = useState({
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({ enableHighAccuracy: true });
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    // setUserLocation({
    //   latitude: 14.489378,
    //   longitude: 120.902159,
    // });
  };

  const getMapRegion = () => {
    const latitudes = [evacuationCenter.latitude, userLocation.latitude].filter(Boolean);
    const longitudes = [evacuationCenter.longitude, userLocation.longitude].filter(Boolean);

    if (latitudes.length === 0 || longitudes.length === 0) {
      return {
        latitude: evacuationCenter.latitude,
        longitude: evacuationCenter.longitude,
        latitudeDelta: 0.010,
        longitudeDelta: 0.010,
      };
    }

    const latitudeMin = Math.min(...latitudes);
    const latitudeMax = Math.max(...latitudes);
    const longitudeMin = Math.min(...longitudes);
    const longitudeMax = Math.max(...longitudes);

    const latitudeDelta = latitudeMax - latitudeMin + 0.01;
    const longitudeDelta = longitudeMax - longitudeMin + 0.01;

    return {
      latitude: (latitudeMax + latitudeMin) / 2,
      longitude: (longitudeMax + longitudeMin) / 2,
      latitudeDelta,
      longitudeDelta,
    };
  };

  const mapRef = useRef(null);

  const handleCompassPress = () => {
    getUserLocation();
    if (userLocation.latitude && userLocation.longitude && mapRef.current) {
        const coordinates = [
          { latitude: evacuationCenter.latitude, longitude: evacuationCenter.longitude },
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
        ];
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 25, right: 25, bottom: 25, left: 25 },
          animated: true,
        });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={getMapRegion()}
      >
        <Marker
          coordinate={evacuationCenter}
          title="Evacuation Center"
          description="Your evacuation center location"
          pinColor={colors.red}
        />

        {userLocation.latitude && userLocation.longitude && (
            <Marker coordinate={userLocation}>
                <View style={styles.customMarker}>
                    
                </View>
            </Marker>
        )}

        {/* Directions */}
        {userLocation.latitude && userLocation.longitude && (
          <MapViewDirections
            origin={userLocation}
            destination={evacuationCenter}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor={colors.primary}
            onError={(errorMessage) => {
              console.error('Gmaps direction error: ', errorMessage);
            }}
          />
        )}
      </MapView>

      {/* Compass Button */}
      <TouchableOpacity style={styles.button} onPress={handleCompassPress}>
        <MaterialCommunityIcons name="compass" size={40} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    padding: spacing.s,
    borderRadius: 100,
    zIndex: 1,
  },
  customMarker: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.darkgray,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default EvacuationMap;
