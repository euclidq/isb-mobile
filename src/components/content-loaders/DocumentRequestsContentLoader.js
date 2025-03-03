import { View, Text } from 'react-native'
import React from 'react'
import ContentLoader from 'react-native-easy-content-loader';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';

const DocumentRequestsContentLoader = () => {
  return (
    <View style={{padding: spacing.m, gap:spacing.m}}>
        <View style={[globalStyles.detailCard, {gap: spacing.s, paddingBottom: spacing.s, paddingHorizontal: spacing.s}]}>
            <ContentLoader active title={false} paragraphStyles={{marginTop: spacing.s}} pRows={4} pHeight={10} pWidth={"100%"} />
            <ContentLoader active tHeight={30} tWidth={"30%"} paragraphStyles={{marginTop: spacing.s}} pRows={0}/>
        </View>
        <View style={[globalStyles.detailCard, {gap: spacing.s, paddingBottom: spacing.s, paddingHorizontal: spacing.s}]}>
            <ContentLoader active title={false} paragraphStyles={{marginTop: spacing.s}} pRows={4} pHeight={10} pWidth={"100%"} />
            <ContentLoader active tHeight={30} tWidth={"30%"} paragraphStyles={{marginTop: spacing.s}} pRows={0}/>
        </View>
        <View style={[globalStyles.detailCard, {gap: spacing.s, paddingBottom: spacing.s, paddingHorizontal: spacing.s}]}>
            <ContentLoader active title={false} paragraphStyles={{marginTop: spacing.s}} pRows={4} pHeight={10} pWidth={"100%"} />
            <ContentLoader active tHeight={30} tWidth={"30%"} paragraphStyles={{marginTop: spacing.s}} pRows={0}/>
        </View>
    </View>
  )
}

export default DocumentRequestsContentLoader