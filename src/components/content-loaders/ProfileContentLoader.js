import { View, Text } from 'react-native'
import React from 'react'
import ContentLoader from 'react-native-easy-content-loader';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';

const ProfileContentLoader = () => {
  return (
    <View style={{gap:spacing.l}}>
        <View style={{gap: spacing.s, alignItems: 'center'}}>
            <ContentLoader active title={false} pRows={1} pWidth={"100%"} pHeight={120} paragraphStyles={{borderRadius: 100}} containerStyles={{width:140, height: 130}}/>
            <ContentLoader active title={false} pRows={1} pWidth={"100%"} pHeight={10} paragraphStyles={{}} containerStyles={{width: "80%"}}/>
            <ContentLoader active title={false} pRows={1} pWidth={"100%"} pHeight={10} paragraphStyles={{}} containerStyles={{width: "50%"}}/>
        </View>
        <View style={[globalStyles.detailCard, {gap: spacing.s, paddingBottom: spacing.s, paddingHorizontal: spacing.s}]}>
            <ContentLoader active title={false} paragraphStyles={{marginTop: spacing.s}} pRows={5} pHeight={10} pWidth={["60%", "100%"]} containerStyles={{marginBottom: spacing.s}}/>
        </View>
        <View style={[globalStyles.detailCard, {gap: spacing.s, paddingBottom: spacing.s, paddingHorizontal: spacing.s}]}>
            <ContentLoader active title={false} paragraphStyles={{marginTop: spacing.s}} pRows={5} pHeight={10} pWidth={["60%", "100%"]} containerStyles={{marginBottom: spacing.s}}/>
        </View>
        <View style={[globalStyles.detailCard, {gap: spacing.s, paddingBottom: spacing.s, paddingHorizontal: spacing.s}]}>
            <ContentLoader active title={false} paragraphStyles={{marginTop: spacing.s}} pRows={5} pHeight={10} pWidth={["60%", "100%"]} containerStyles={{marginBottom: spacing.s}}/>
        </View>
    </View>
  )
}

export default ProfileContentLoader