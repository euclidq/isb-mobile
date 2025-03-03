import { View, Text } from 'react-native'
import React from 'react'
import ContentLoader from 'react-native-easy-content-loader';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';

const NotificationsContentLoader = () => {
  return (
    <View style={{gap:spacing.s}}>
        <Text style={fontStyles.h3}>Unread</Text>
        <View style={{gap:spacing.m}}>
            <View style={[globalStyles.detailCard, {flexDirection: 'row', padding: spacing.s, alignItems: 'center'}]}>
                <ContentLoader active tHeight={40} tWidth={40} titleStyles={{marginTop: spacing.s}} pRows={0} containerStyles={{width: 40}}/>
                <ContentLoader active title={false} paragraphStyles={{marginTop: spacing.s}} pRows={4} pHeight={10} pWidth={["100%", "100%", "100%", "50%",]} containerStyles={{flex: 1}} />
            </View>
            <View style={[globalStyles.detailCard, {flexDirection: 'row', padding: spacing.s, alignItems: 'center'}]}>
                <ContentLoader active tHeight={40} tWidth={40} titleStyles={{marginTop: spacing.s}} pRows={0} containerStyles={{width: 40}}/>
                <ContentLoader active title={false} paragraphStyles={{marginTop: spacing.s}} pRows={4} pHeight={10} pWidth={["100%", "100%", "100%", "50%",]} containerStyles={{flex: 1}} />
            </View>
            <View style={[globalStyles.detailCard, {flexDirection: 'row', padding: spacing.s, alignItems: 'center'}]}>
                <ContentLoader active tHeight={40} tWidth={40} titleStyles={{marginTop: spacing.s}} pRows={0} containerStyles={{width: 40}}/>
                <ContentLoader active title={false} paragraphStyles={{marginTop: spacing.s}} pRows={4} pHeight={10} pWidth={["100%", "100%", "100%", "50%",]} containerStyles={{flex: 1}} />
            </View>
        </View>
    </View>
  )
}

export default NotificationsContentLoader