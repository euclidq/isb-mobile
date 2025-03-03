import { StatusBar } from 'expo-status-bar';
import {Dimensions} from 'react-native';

const {width, height} = Dimensions.get('window');

export const colors = {
    primary: '#1346AC',
    secondary: '#e2ecfc',


    red: '#F6655A',
    orange: '#FB982E',
    yellow:'#E5AE40',
    green: '#65B168',
    teal: '#33A9A9',
    blue: '#4F91FF',
    indigo: '#7985CB',
    pink: '#EF6292',
    
    verylightgray: '#F5F5F5',
    lightgray: '#D2D2D6',
    gray: '#B4B4BB',
    darkgray: '#9696A0',
    
    
    disabledBackground: '#A0C0E0',
    disabledText: 'white',
    white: '#fff',
    offWhite: '#F1F3F5',
    black: '#000',
    
};

export const shadow = {
    shadowColor: colors.black,
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
};

export const sizes = {
    width,
    height,
    title: {
        fontSize: 32,
        fontFamily: 'Inter-Bold',
    },
    h2: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
    },
    h3: {
        fontSize: 18,
        fontFamily: 'Inter-Bold',
    },
    p3: {
        fontSize: 18,
        fontFamily: 'Inter-Regular',
    },
    body: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    bold: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },
    radius: 16,
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 18,
    l: 24,
    xl: 40,
};

export const fontStyles = {
    h1: {
        fontSize: 32,
        fontFamily: 'Inter-Bold',
    },
    h2: {
        fontSize: 24,
        fontFamily: 'Inter-Bold',
    },
    h3: {
        fontSize: 20,
        fontFamily: 'Inter-Bold',
    },
    p3: {
        fontSize: 20,
        fontFamily: 'Inter-Regular',
    },
    body: {
        fontSize: 16,
        fontFamily: 'Inter-Regular',
    },
    bold: {
        fontSize: 16,
        fontFamily: 'Inter-Bold',
    },

    screenTitle: {
        fontSize: 32,
        fontFamily: 'Inter-Bold',
        color: colors.primary,
        marginBottom: spacing.s,
    },
};

export const globalStyles = {
    headerOptions: {
        headerTitle: '',
        headerTitleStyle: { ...sizes.h3 },
        headerTintColor: colors.primary,
        headerBackTitleVisible: false,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.offWhite, },
    },

    container: {
        flex: 1,
        backgroundColor: colors.offWhite,
    },
    scrollViewContainer: {
        flexGrow: 1,
        paddingHorizontal: spacing.m,
        paddingBottom: spacing.m
    },

    flatListContainer: {
        padding: spacing.m,
        gap: spacing.m,
    },
    filterFlatList: {
        paddingTop: spacing.m,
        paddingHorizontal: spacing.m,
        gap: spacing.s,
    },
    filterResultsHeader: {
        paddingHorizontal: spacing.m,
        paddingTop: spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    buttonWrapper: {
        width: '100%',
        gap: spacing.s,
        padding: spacing.m
    },
    buttonWrapperRow: {
        flex: 1,
        gap: spacing.s,
        flexDirection: 'row',
    },
    buttonRow: {
        gap: spacing.s,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    button: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        backgroundColor: colors.primary,
    },
    buttonText: {
        ...sizes.h3,
        color: colors.white,
    },
    buttonSecondary: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        borderColor: colors.primary,
        backgroundColor: colors.secondary
    },
    buttonSecondaryText: {
        ...sizes.h3,
        color: colors.primary,
    },
    responsiveButton: {
        height: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        backgroundColor: colors.primary,
    },
    disabledButton: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        backgroundColor: colors.disabledBackground,
    },
    disabledButtonText: {
        ...sizes.h3,
        color: colors.disabledText,
    },

    hyperlinkText: {
        ...sizes.body,
        color: colors.primary,
        textDecorationLine: 'underline'
    },
    errorText: {
        ...sizes.body,
        color: colors.red
    },
    translation: {
        ...fontStyles.body,
        color: colors.darkgray,
        fontStyle: 'italic',
    },
    removeButtonText: {
        ...sizes.bold,
        color: colors.primary
    },

    contentRow: {
        gap: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        paddingVertical: 20,
        borderBottomColor: 'gray',
        backgroundColor: 'white',
    },

    inputContainer: {
        width: '100%',
    },
    inputWrapper: {
        width: '100%',
        marginBottom: spacing.m,
    },
    inputBoxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.lightgray,
        backgroundColor: colors.white,
    },
    inputBox: {
        width: '100%',
        minHeight: 50,
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: 10,
        ...sizes.body,
        color: 'black',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.lightgray,
        backgroundColor: colors.white,
    },
    inputBoxFocused: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    inputBoxDisabled: {
        borderWidth: 2,
        borderColor: colors.lightgray,
        backgroundColor: colors.lightgray,
    },
    inputPasswordBox: {
        flex: 1,
        width: '100%',
        height: 50,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10, 
        ...sizes.body,
        backgroundColor: '#FFFFFF',
    },
    inputBoxPlaceholder: {
        ...sizes.body,
        color: colors.darkgray
    },
    visibilityButton: {
        marginHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        gap: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },

    checkboxWrapper: {
        gap: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkboxUnchecked: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#000',
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary
    },



    tagsContainer: {
        gap: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.s,
        justifyContent: 'center',
        borderRadius: 100,
        backgroundColor: colors.white,
        alignSelf: 'flex-start',
    },
    tagText: {
        color: colors.black,
        ...sizes.body
    },
    selectedTag: {
        padding: spacing.s,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        borderRadius: 100,
        backgroundColor: colors.primary,
    },
    selectedTagText: {
        color: colors.white,
        ...sizes.body
    },
    importantTag: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        borderRadius: 100,
        backgroundColor: colors.red,
    },
    importantTagText: {
        color: colors.white,
        ...sizes.body
    },

    historyWrapper: {
        gap: spacing.s,
        padding: spacing.m,
        borderRadius: sizes.radius,
        backgroundColor: colors.white,
    },
    
    tabWrapper: {
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabText: {
        ...fontStyles.p3,
        textAlign: 'center'
    },
    activeTab: {
        borderBottomWidth: 3,
        borderBottomColor: colors.primary
    },
    activeTabText: {
        ...fontStyles.h3,
        color: colors.primary
    },
    
    attachmentsDetailContainer: {
        width: '100%',
        gap: spacing.m,
    },
    attachmentsContainer: {
        marginTop: spacing.m,
        flexDirection: 'row',
        gap: spacing.m,
        flexWrap: 'wrap',
    },
    attachmentsWrapper: {
        width: 100,
        height: 100,
    },
    pdfAttachmentsWrapper: {
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: colors.lightgray,
        borderRadius: sizes.radius,
    },
    attachmentsImage: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        borderRadius: sizes.radius,
        backgroundColor: colors.lightgray,
    },
    attachmentsRemoveButton: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: colors.red,
        padding: 5,
        zIndex: 1,
        borderRadius: sizes.radius,
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        position: 'absolute',
        zIndex: 1,
        width: '100%',
        height: '100%',
        top: 0,
    },
    modalWrapper: {
        maxHeight: '70%',
        marginHorizontal: spacing.m,
        paddingHorizontal: spacing.m,
        borderRadius: sizes.radius,
        backgroundColor: 'white',
    },
    modalTitle: {
        ...sizes.h2,
        marginVertical: spacing.m,
        paddingHorizontal: spacing.m,
        textAlign: 'center',
    },
    modalMessage: {
        ...sizes.body,
        paddingHorizontal: spacing.m,
    },
    modalCloseButton: {
        ...sizes.h3,
        marginVertical: spacing.m,
        textAlign: 'center',
        color: colors.primary
    },

    modalButtonContainer: {
        marginTop: spacing.l,
        marginBottom: spacing.m,
        gap: spacing.s,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    modalButton: {
        paddingVertical: spacing.s,
        paddingHorizontal: spacing.m,
        borderRadius: 100,
        backgroundColor: colors.primary,
    },
    modalButtonText: {
        ...sizes.h3,
        textAlign: 'center',
        color: colors.white
    },
    modalButtonSecondary: {
        backgroundColor: colors.secondary,
    },
    modalButtonTextSecondary: {
        color: colors.primary
    },
    modalButtonDanger: {
        backgroundColor: colors.red,
    },
    modalButtonTextDanger: {
        color: colors.white
    },

    videoModal: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoPlayer: {
        width: '100%',
        height: '100%',
    },
    videoModalCloseButton: {
        position: 'absolute',
        bottom: 100,
        zIndex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    videoModalCloseText: {
        color: 'black',
        fontSize: 16,
        textAlign: 'center',
    },
    playIconOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -24 }, { translateY: -24 }],
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        borderTopWidth: 1,
        borderTopColor: colors.gray,
        marginBottom: spacing.m,
    },
    emptyMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyMessageText: {
        ...sizes.h3,
        color: colors.gray,
        textAlign: 'center',
    },
    detailCard: {
        padding: spacing.m,
        gap: spacing.m,
        borderRadius: sizes.radius,
        backgroundColor: colors.white,
    },

    announcementCard: {
        minHeight: 150,
        width: '100%',
        padding: spacing.m,
        gap: spacing.m,
        flexDirection: 'row',
        borderRadius: sizes.radius,
        backgroundColor: colors.white,
    },
    announcementImage: {
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: sizes.radius,
        overflow: 'hidden',
        backgroundColor: colors.primary,
    },
    announcementText: {
        flex: 1,
        justifyContent: 'space-between',
    },
};