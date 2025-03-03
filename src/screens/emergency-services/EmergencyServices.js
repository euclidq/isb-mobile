import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import EmergencyHotlines from './EmergencyHotlines';
import EvacuationMap from './EvacuationMap';

import { colors, sizes, spacing, globalStyles } from '../../styles/theme';
import { StatusBar } from 'expo-status-bar';

const EmergencyServices = () => {
  const [activeScreen, setActiveScreen] = useState('hotlines');

  const tabWrapperStyle = [
    styles.tabWrapper,
    activeScreen === 'evacuation map' && styles.fixedTabWrapper,
  ];

  return (
    <View style={globalStyles.container}>
      <View style={tabWrapperStyle}>
        <TouchableOpacity
          style={[styles.tab, activeScreen === 'hotlines' && styles.activeTab, {borderTopRightRadius: 0, borderBottomRightRadius: 0}]}
          onPress={() => setActiveScreen('hotlines')}
        >
          <Text style={[styles.tabText, activeScreen === 'hotlines' && styles.activeTabText]}>
            Hotlines
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeScreen === 'evacuation map' && styles.activeTab, {borderTopLeftRadius: 0, borderBottomLeftRadius: 0}]}
          onPress={() => setActiveScreen('evacuation map')}
        >
          <Text style={[styles.tabText, activeScreen === 'evacuation map' && styles.activeTabText]}>
            Evacuation Map
          </Text>
        </TouchableOpacity>
      </View>

      {activeScreen === 'hotlines' ? <EmergencyHotlines /> : <EvacuationMap />}
      <StatusBar barStyle="dark-content" backgroundColor={colors.offWhite}/>
    </View>
  );
};

const styles = StyleSheet.create({
  tabWrapper: {
    margin: spacing.m,
    justifyContent: 'space-between',
    flexDirection: 'row',
    borderRadius: 100,
    backgroundColor: colors.white,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 100,
  },
  fixedTabWrapper: {
    position: 'absolute',
    zIndex: 1,
  },
  tabText: {
    ...sizes.h3,
    color: colors.primary,
  },
  activeTab: {
    backgroundColor: colors.primary,
    borderRadius: 100,
  },
  activeTabText: {
    ...sizes.h3,
    color: colors.white,
  },
});

export default EmergencyServices;
