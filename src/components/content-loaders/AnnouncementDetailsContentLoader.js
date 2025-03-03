import { View, Text } from 'react-native'
import React from 'react'
import ContentLoader from 'react-native-easy-content-loader';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../../styles/theme';

const AnnouncementsContentLoader = () => {
  return (
    <View style={[globalStyles.detailCard, {gap: 0}]}>
        <ContentLoader active tHeight={300} tWidth={"100%"} titleStyles={{marginTop: spacing.s}} pRows={0} containerStyles={{width: "100%"}}/>
        <ContentLoader active tHeight={30} tWidth={"30%"} titleStyles={{marginTop: spacing.m}} pRows={2} pHeight={10} pWidth={["30", "50%"]} paragraphStyles={{marginVertical:10}} containerStyles={{width: "100%"}}/>
        <ContentLoader active tHeight={10} tWidth={"100%"} titleStyles={{marginTop: spacing.m}} pRows={5} pHeight={10} pWidth={"100%"} paragraphStyles={{marginVertical:10}} containerStyles={{width: "100%", marginTop: spacing.m}}/>
        <ContentLoader active tHeight={10} tWidth={"100%"} titleStyles={{marginTop: spacing.s}} pRows={0} containerStyles={{width: "70%", marginTop: spacing.m, alignSelf: 'center'}}/>
    </View>
  )
}

export default AnnouncementsContentLoader