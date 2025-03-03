import { View, Text } from 'react-native'
import React from 'react'
import ContentLoader from 'react-native-easy-content-loader';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';

const DetailsContentLoader = () => {
  return (
    <View>
        <ContentLoader active tHeight={10} tWidth={"50%"} paragraphStyles={{marginTop: spacing.m}} pRows={1} pHeight={10} pWidth={"100"} containerStyles={{flex: 1, marginTop: spacing.s, paddingHorizontal: 0}} />
        <ContentLoader active tHeight={10} tWidth={"50%"} paragraphStyles={{marginTop: spacing.m}} pRows={1} pHeight={10} pWidth={"100"} containerStyles={{flex: 1, marginTop: spacing.xl, paddingHorizontal: 0}} />
        <ContentLoader active tHeight={10} tWidth={"50%"} paragraphStyles={{marginTop: spacing.m}} pRows={1} pHeight={10} pWidth={"100"} containerStyles={{flex: 1, marginTop: spacing.xl, paddingHorizontal: 0}} />
        <ContentLoader active tHeight={10} tWidth={"50%"} paragraphStyles={{marginTop: spacing.m}} pRows={1} pHeight={10} pWidth={"100"} containerStyles={{flex: 1, marginTop: spacing.xl, paddingHorizontal: 0}} />
        <ContentLoader active tHeight={10} tWidth={"50%"} paragraphStyles={{marginTop: spacing.m}} pRows={1} pHeight={10} pWidth={"100"} containerStyles={{flex: 1, marginTop: spacing.xl, marginBottom: spacing.s, paddingHorizontal: 0}} />
    </View>
  )
}

export default DetailsContentLoader