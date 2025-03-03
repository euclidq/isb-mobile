import { View, Text } from 'react-native'
import React from 'react'
import ContentLoader from 'react-native-easy-content-loader';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';

const AnnouncementsContentLoader = () => {
  return (
    <View style={{gap:spacing.m}}>
        <View style={[globalStyles.detailCard, {flexDirection: 'row', padding: spacing.s}]}>
            <ContentLoader active tHeight={100} tWidth={100} titleStyles={{marginTop: spacing.s}} pRows={0} containerStyles={{width: 100}}/>
            <ContentLoader active tHeight={30} tWidth={100} paragraphStyles={{marginTop: spacing.m}} pRows={2} pHeight={10} pWidth={["100%", "30%"]} containerStyles={{flex: 1, marginTop: spacing.s}} />
        </View>
        <View style={[globalStyles.detailCard, {flexDirection: 'row', padding: spacing.s}]}>
            <ContentLoader active tHeight={100} tWidth={100} titleStyles={{marginTop: spacing.s}} pRows={0} containerStyles={{width: 100}}/>
            <ContentLoader active tHeight={30} tWidth={100} paragraphStyles={{marginTop: spacing.m}} pRows={2} pHeight={10} pWidth={["100%", "30%"]} containerStyles={{flex: 1, marginTop: spacing.s}} />
        </View>
        <View style={[globalStyles.detailCard, {flexDirection: 'row', padding: spacing.s}]}>
            <ContentLoader active tHeight={100} tWidth={100} titleStyles={{marginTop: spacing.s}} pRows={0} containerStyles={{width: 100}}/>
            <ContentLoader active tHeight={30} tWidth={100} paragraphStyles={{marginTop: spacing.m}} pRows={2} pHeight={10} pWidth={["100%", "30%"]} containerStyles={{flex: 1, marginTop: spacing.s}} />
        </View>
    </View>
  )
}

export default AnnouncementsContentLoader