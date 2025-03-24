import { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Image, Platform, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import useHandleScroll from '../../hooks/useHandleScroll';
import LoadingModal from '../../components/LoadingModal';
import AlertModal from '../../components/modals/AlertModal';
import SubmitClearButton from '../../components/SubmitClearButton';
import { colors, spacing, globalStyles, fontStyles } from '../../styles/theme';
import { Video } from 'expo-av';

const EditComplaint = ({ route, navigation }) => {
    const handleScroll = useHandleScroll(navigation, 'Edit Complaint');
    const { complaintID } = route.params;

    const [userToken, setUserToken] = useState('');
    const [complaint, setComplaint] = useState('');

    const [statementInputHeight, setStatementInputHeight] = useState(50);
    const [prayerInputHeight, setPrayerInputHeight] = useState(50);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });
    const [focusedInput, setFocusedInput] = useState('');
    const [formData, setFormData] = useState({
        complainantID: '',
        ReferenceNo: '',
        status: '',
        remarks: '',
        complainantByType: 'Resident',
        complainantInput: '',
        complainantname: [],
        respondentInput: '',
        respondentname: [],
        typeofcomplaint: '',
        othertypeofcomplaint: '',
        incidentdescription: '',
        relieftobegranted: '',
        dateAndTimeofIncident: '',
        Attachment: [],
        removedAttachments: [],
    });
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [selectedVideoUri, setSelectedVideoUri] = useState(null);

    const incidentTypes = ['Vehicular Accident', 'Disturbance of Peace', 'Physical Altercation', 'Harrassment', 'Property Damage', 'Unsettled Debts', 'Petty Crimes', 'Others'];

    useEffect(() => {
        const getUserToken = async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                setUserToken(userToken);
            } catch (error) {
                console.error('Error fetching user token:', error);
            }
        };
        getUserToken();
    }, []);

    useEffect(() => {
        const getComplaintDetail = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/incident-reports/${complaintID}`);
                const data = response.data;
                const updatedAttachments = await generateThumbnailsForAttachments(data.Attachment || []);
                
                setComplaint(data);
                setFormData({
                    ...formData,
                    complainantID: data.complainantID._id,
                    ReferenceNo: data.ReferenceNo,
                    status: data.status,
                    remarks: data.remarks,
                    complainantByType: data.complainantByType,
                    typeofcomplaint: incidentTypes.includes(data.typeofcomplaint) ? data.typeofcomplaint : 'Others',
                    othertypeofcomplaint: data.typeofcomplaint,
                    complainantname: Array.isArray(data.complainantname) ? data.complainantname : [data.complainantname],
                    respondentname: Array.isArray(data.respondentname) ? data.respondentname : [data.respondentname],
                    incidentdescription: data.incidentdescription,
                    relieftobegranted: data.relieftobegranted,
                    dateAndTimeofIncident: data.dateAndTimeofIncident,
                    Attachment: updatedAttachments,
                });
            } catch (error) {
                console.error('Error fetching complaint detail:', error);
            } finally {
                setIsLoading(false);
            }
        };
        getComplaintDetail();
    }, [complaintID]);
    
    const generateThumbnailsForAttachments = async (attachments) => {
        const updatedAttachments = await Promise.all(
            attachments.map(async (attachment) => {
                if (attachment.mimetype.startsWith('video/') && !attachment.thumbnailUri) {
                    try {
                        const thumbnailUri = await generateVideoThumbnail(attachment.uri ? attachment.uri : attachment.url);
                        return {
                            ...attachment,
                            thumbnailUri,
                        };
                    } catch (error) {
                        console.error('Error generating thumbnail for attachment:', error);
                        return attachment;
                    }
                }
                return attachment;
            })
        );
        return updatedAttachments;
    };

    const generateVideoThumbnail = async (uri) => {
        try {
            const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, { time: 2000 });
            return thumbnailUri;
        } catch (error) {
            console.error('Failed to generate thumbnail:', error);
            return null;
        }
    };

    const handleAttachmentUpload = async () => {
        const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    
        if (mediaLibraryPermission.granted === false || cameraPermission.granted === false) {
            setModalContent({
                title: 'Permission Denied',
                message: 'You need to enable permissions to access the camera and media library.',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
            });
            setShowAlertModal(true);
            return;
        }

        const MAX_TOTAL_SIZE_MB = 50;
        const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
    
        const calculateTotalSize = (attachments) => {
            return attachments.reduce((total, file) => total + (file.size || 0), 0);
        };
    
        const currentTotalSize = calculateTotalSize(formData.Attachment);

        setModalContent({
            title: 'Upload Supporting Evidences',
            message: `Accepted formats: Images (JPG, JPEG, PNG) and Videos (MP4)\nMaximum file size limit: ${MAX_TOTAL_SIZE_MB}MB`,
            buttons: [
                {
                    label: 'Take Photo or Video',
                    onPress: async () => {
                        const pickerResult = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.All, // This allows both images and videos
                            allowsEditing: true,
                            quality: 1,
                        });
                
                        if (!pickerResult.canceled) {
                            const asset = pickerResult.assets[0];
                            const uri = asset.uri;
                            const type = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
                            const fileSize = pickerResult.assets[0].fileSize || 0;
                            const newTotalSize = currentTotalSize + fileSize;
                
                            if (newTotalSize > MAX_TOTAL_SIZE_BYTES) {
                                setModalContent({
                                    title: 'Total File Size Exceeded',
                                    message: `The total size of all attachments exceeds the ${MAX_TOTAL_SIZE_MB}MB limit.`,
                                    buttons: [
                                        {
                                            label: 'Close',
                                            onPress: () => setShowAlertModal(false)
                                        }
                                    ]
                                });
                                setShowAlertModal(true);
                                return;
                            }
                
                            let thumbnailUri = null;
                            if (asset.type === 'video') {
                                thumbnailUri = await generateVideoThumbnail(uri);
                            }
                
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                Attachment: [
                                    ...prevFormData.Attachment,
                                    {
                                        uri,
                                        name: `ComplaintAttachment-${Date.now()}${asset.type === 'video' ? '.mp4' : '.jpg'}`,
                                        type,
                                        thumbnailUri,
                                    },
                                ],
                            }));
                        }
                        setShowAlertModal(false);
                    },
                },
                {
                    label: 'Choose from Library',
                    onPress: async () => {
                        const pickerResult = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.All,
                            allowsEditing: false,
                            quality: 1,
                        });
    
                        if (!pickerResult.canceled) {
                            const asset = pickerResult.assets[0];
                            const uri = asset.uri;
                            const type = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
                            const fileSize = pickerResult.assets[0].fileSize || 0;
    
                            const newTotalSize = currentTotalSize + fileSize;
    
                            if (newTotalSize > MAX_TOTAL_SIZE_BYTES) {
                                setModalContent({
                                    title: 'Total File Size Exceeded',
                                    message: `The total size of all attachments exceeds the ${MAX_TOTAL_SIZE_MB}MB limit.`,
                                    buttons: [
                                        {
                                            label: 'Close',
                                            onPress: () => setShowAlertModal(false)
                                        }
                                    ]
                                });
                                setShowAlertModal(true);
                                return;
                            }
    
                            let thumbnailUri = null;

                            if (asset.type === 'video') {
                                thumbnailUri = await generateVideoThumbnail(uri);
                            }
    
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                Attachment: [
                                    ...prevFormData.Attachment,
                                    {
                                        uri,
                                        name: `ComplaintAttachment-${Date.now()}${asset.type === 'video' ? '.mp4' : '.jpg'}`,
                                        type,
                                        thumbnailUri,
                                    },
                                ],
                            }));
                        }
                        setShowAlertModal(false);
                    },
                },
                {
                    label: 'Choose from Files',
                    onPress: async () => {
                        try {
                            const pickerResult = await DocumentPicker.getDocumentAsync({
                                type: ['image/*', 'video/*'],
                                copyToCacheDirectory: true,
                            });
    
                            if (pickerResult.assets && pickerResult.assets.length > 0) {
                                const { uri, mimeType, size } = pickerResult.assets[0];

                                const newTotalSize = currentTotalSize + size;
    
                                if (newTotalSize > MAX_TOTAL_SIZE_BYTES) {
                                    setModalContent({
                                        title: 'Total File Size Exceeded',
                                        message: `The total size of all attachments exceeds the ${MAX_TOTAL_SIZE_MB}MB limit.`,
                                        buttons: [
                                            {
                                                label: 'Close',
                                                onPress: () => setShowAlertModal(false)
                                            }
                                        ]
                                    });
                                    setShowAlertModal(true);
                                    return;
                                }
    
                                const type = mimeType || (uri.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');
                                let thumbnailUri = null;
    
                                if (type.startsWith('video/')) {;
                                    thumbnailUri = await generateVideoThumbnail(uri);
                                }
    
                                setFormData((prevFormData) => ({
                                    ...prevFormData,
                                    Attachment: [
                                        ...prevFormData.Attachment,
                                        {
                                            uri,
                                            name: `ComplaintAttachment-${Date.now()}${uri.endsWith('.mp4') ? '.mp4' : '.jpg'}`,
                                            type,
                                            thumbnailUri,
                                        },
                                    ],
                                }));
                            }
                        } catch (error) {
                            console.error('Error during file selection:', error);
                            setModalContent({
                                title: 'Error',
                                message: 'An error occurred while picking a file. Please try again.',
                                buttons: [
                                    {
                                        label: 'Close',
                                        onPress: () => setShowAlertModal(false)
                                    }
                                ]
                            });
                            setShowAlertModal(true);
                        }
                        setShowAlertModal(false);
                    }
                },
                {
                    label: 'Cancel',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary
                },
            ]
        });
        setShowAlertModal(true);
    };

    const handleVideoPress = (videoUri) => {
        setSelectedVideoUri(videoUri);
        setShowVideoModal(true);
    };

    const handleCloseVideoModal = () => {
        setShowVideoModal(false);
        setSelectedVideoUri(null);
    };

    const handleRemoveAttachment = (indexToRemove) => {
        const removedAttachment = formData.Attachment[indexToRemove];
        setFormData((prevFormData) => ({
            ...prevFormData,
            Attachment: prevFormData.Attachment.filter((_, index) => index !== indexToRemove),
            removedAttachments: [
                ...prevFormData.removedAttachments,
                removedAttachment.url ? { url: removedAttachment.url } : { uri: removedAttachment.uri }
            ],
        }));
    };

    const handleDateAndTimeChange = (event, selectedDate) => {
        if (selectedDate) {
            if (showDatePicker) {
                setFormData({
                    ...formData,
                    dateAndTimeofIncident: selectedDate,
                });
                setShowDatePicker(false);
                setShowTimePicker(true);
            } else if (showTimePicker) {
                const currentDate = new Date(formData.dateAndTimeofIncident);
                currentDate.setHours(selectedDate.getHours());
                currentDate.setMinutes(selectedDate.getMinutes());

                setFormData({
                    ...formData,
                    dateAndTimeofIncident: currentDate.toISOString(),
                });
                setShowTimePicker(false);
            }
        }
    };

    const handleUpdate = async () => {
        const { complainantID, ReferenceNo, status, remarks, typeofcomplaint, othertypeofcomplaint, complainantname, respondentname, incidentdescription, relieftobegranted, dateAndTimeofIncident, Attachment, removedAttachments } = formData;

        const requiredFields = [
            { field: complainantname, label: 'Complainant/s' },
            { field: respondentname, label: 'Respondent/s' },
            { field: typeofcomplaint, label: 'Nature of Complaint' },
            { field: incidentdescription, label: 'Statement of Complaint' },
            { field: relieftobegranted, label: 'Prayer for Relief' },
            { field: dateAndTimeofIncident, label: 'Date and Time of Incident' },
        ];

        if (typeofcomplaint === 'Others' && !othertypeofcomplaint) {
            requiredFields.push({ field: othertypeofcomplaint, label: 'Other Type of Complaint' });
        }

        if (!Array.isArray(Attachment) ||Attachment.length === 0) {
            requiredFields.push({ field: Attachment, label: 'Supporting Evidences' });
        }

        const missingFields = requiredFields
            .filter(({ field }) => !field || (Array.isArray(field) && field.length === 0))
            .map(({ label }) => label);

        if (missingFields.length > 0) {
            setModalContent({
                title: 'Validation Error',
                message: `The following fields are required:\n- ${missingFields.join('\n- ')}`,
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
            });
            setShowAlertModal(true);
            setIsSubmitting(false);
            return;
        }

        setModalContent({
            title: 'Confirm Edit',
            message: 'Are you sure you want to save your changes?\n\nOnce the complaint is processed, you won’t be able to make any changes.',
            buttons: [
                {
                    label: 'Cancel',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary
                },
                {
                    label: "Save",
                    onPress: async () => {
                        setIsSubmitting(true);

                        const formDataToSend = new FormData();
                        formDataToSend.append('complainantID', complainantID);
                        formDataToSend.append('ReferenceNo', ReferenceNo);
                        formDataToSend.append('complainantname', JSON.stringify(complainantname));
                        formDataToSend.append('respondentname', JSON.stringify(respondentname));
                        formDataToSend.append('typeofcomplaint', typeofcomplaint === 'Others' ? othertypeofcomplaint : typeofcomplaint);
                        formDataToSend.append('relieftobegranted', relieftobegranted);
                        formDataToSend.append('incidentdescription', incidentdescription);
                        formDataToSend.append('dateAndTimeofIncident', dateAndTimeofIncident);
                        formDataToSend.append('removedAttachments', JSON.stringify(removedAttachments));
                        
                        Attachment.forEach((file) => {
                            url = file.uri ? file.uri : file.uri
                            if (url) {
                                formDataToSend.append('attachments', {
                                    uri: Platform.OS === 'android' ? url : url.replace('file://', ''),
                                    type: file.type || 'image/jpeg',
                                    name: file.name || `photo-${Date.now()}.jpg`,
                                });
                            }
                        });

                        try {
                            const response = await axios.put(`${process.env.EXPO_PUBLIC_API_BASE_URL}/incident-reports/${complaintID}`, formDataToSend, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });

                            if (response.status === 200) {
                                setIsSubmitting(false);
                                setModalContent({
                                    title: 'Success',
                                    message: 'Complaint edited successfully.',
                                    buttons: [
                                        {
                                            label: 'Close',
                                            onPress: () => navigation.goBack(),
                                        }
                                    ]
                                });
                                setShowAlertModal(true);
                            }
                        } catch (error) {
                            console.error('Error submitting the complaint:', error);
                            setModalContent({
                                title: 'Error',
                                message: `Failed to submit the complaint: ${error.message}`,
                                buttons: [
                                    {
                                        label: 'Close',
                                        onPress: () => setShowAlertModal(false)
                                    }
                                ]
                            });
                            setShowAlertModal(true);
                        } finally {
                            setIsSubmitting(false);
                        }
                    },
                }
            ]
        });
        setShowAlertModal(true);
    };

    const handleArchive = async () => {
        setModalContent({
            title: 'Confirm Archive',
            message: 'Are you sure you want to archive this complaint?',
            buttons: [
                {
                    label: 'No',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary
                },
                {
                    label: 'Yes',
                    onPress: async () => {
                        setIsArchiving(true);
                        try {
                            const response = await axios.put(`${process.env.REACT_APP_BACKEND_API_KEY}/api/incident-reports/${incident._id}`, { status: 'Archived' });
    
                            if (response.status === 200) {
                                setModalContent({
                                    title: 'Success',
                                    message: 'Complaint cancelled successfully.',
                                    buttons: [
                                        {
                                            label: 'Close',
                                            onPress: () => {
                                                setShowAlertModal(false);
                                                navigation.navigate('Complaints')
                                            },
                                        }
                                    ]
                                });
                                setShowAlertModal(true);
                            }
                        } catch {
                            console.error('Error cancelling the complaint:', error);
                            setModalContent({
                                title: 'Error',
                                message: 'Failed to cancel the complaint. Please try again.',
                                buttons: [
                                    {
                                        label: 'Close',
                                        onPress: () => setShowAlertModal(false)
                                    }
                                ]
                            });
                            setShowAlertModal(true);
                        } finally {
                            setIsArchiving(false);
                        }
                    },
                    buttonStyle: globalStyles.modalButtonDanger,
                    textStyle: globalStyles.modalButtonTextDanger,
                }
            ]
        });
        setShowAlertModal(true);
    };

    const clearForm = () => {
        setModalContent({
            title: 'Confirm Clear Form',
            message: 'Are you sure you want to clear all form data? This action cannot be undone.',
            buttons: [
                {
                    label: 'Cancel',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary
                },
                {
                    label: 'Clear',
                    onPress: () => {
                        setFormData({
                            typeofcomplaint: '',
                            othertypeofcomplaint: '',
                            complainantname: [],
                            respondentname: [],
                            incidentdescription: '',
                            dateAndTimeofIncident: '',
                            Attachment: [],
                        });
                        setShowAlertModal(false);
                    },
                }
            ]
        });
        setShowAlertModal(true);
    };

    const openFullScreenPicture = (imageUri) => {
        navigation.navigate('Full Screen Picture', { imageUri });
    };

    useLayoutEffect(() => {
        if (formData.status === "Archived") {
            navigation.setOptions({ headerRight: () => null });
            return;
        }

        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleArchive} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[fontStyles.bold, {color: colors.red, marginRight: 5}]}>Cancel</Text>
                    <MaterialCommunityIcons name="trash-can-outline" size={30} color={colors.red} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (
        <KeyboardAvoidingView behavior="padding" style={globalStyles.container}>
            <ScrollView onScroll={handleScroll} contentContainerStyle={globalStyles.scrollViewContainer}>
                <Text style={fontStyles.screenTitle}>Edit Complaint</Text>
                
                {isLoading ? (
                    <LoadingModal visible={isLoading} purpose="Loading" />
                ) : complaint ? (
                <View style={globalStyles.detailCard}>
                    <View style={globalStyles.inputContainer}>
                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Nature of Complaint <Text style={globalStyles.translation}>(Usapin Ukol)</Text>
                            </Text>
                            <Dropdown
                                style={[globalStyles.inputBox, focusedInput === 'typeofcomplaint' && globalStyles.inputBoxFocused]}
                                placeholderStyle={globalStyles.inputBoxPlaceholder}
                                selectedTextStyle={fontStyles.body}
                                labelField="label"
                                valueField="value"
                                placeholder="Nature of Complaint"
                                data={incidentTypes.map((type) => ({ label: type, value: type }))}
                                value={formData.typeofcomplaint}
                                onChange={(item) => {
                                    const selectedValue = item.value;
                                    setFormData({ ...formData, typeofcomplaint: selectedValue });
                                }}
                                onFocus={() => setFocusedInput('typeofcomplaint')}
                                onBlur={() => setFocusedInput(null)}
                            />
                            {!formData.typeofcomplaint && <Text style={globalStyles.errorText}>Required</Text>}
                        </View>

                        {formData.typeofcomplaint === 'Others' && (
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>
                                    Other Nature of Complaint <Text style={globalStyles.translation}>(Ibang Usapin Ukol)</Text>
                                </Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'othertypeofcomplaint' && globalStyles.inputBoxFocused]}
                                    placeholder="Other Nature of Complaint"
                                    value={formData.othertypeofcomplaint}
                                    onChangeText={(value) => setFormData({ ...formData, othertypeofcomplaint: value })}
                                    onFocus={() => setFocusedInput('othertypeofcomplaint')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                {!formData.othertypeofcomplaint && <Text style={globalStyles.errorText}>Required</Text>}
                            </View>
                        )}

                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Complainant/s <Text style={globalStyles.translation}>(Mga Nagrereklamo)</Text>
                            </Text>
                            <View style={{ flexDirection: 'row', gap: spacing.m }}>
                                <TextInput
                                    style={[{flex: 1}, globalStyles.inputBox, focusedInput === 'complainant' && globalStyles.inputBoxFocused]}
                                    placeholder="Complainant/s"
                                    placeholderTextColor={colors.darkgray}
                                    value={formData.complainantInput}
                                    onChangeText={(value) => setFormData({ ...formData, complainantInput: value })}
                                    onFocus={() => setFocusedInput('complainant')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                <TouchableOpacity 
                                    style={globalStyles.responsiveButton}
                                    onPress={() => {
                                        if (formData.complainantInput.trim()) {
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                complainantname: [...prevState.complainantname, prevState.complainantInput.trim()],
                                                complainantInput: ''
                                            }));
                                        }
                                    }}
                                >
                                    <Text style={globalStyles.buttonText}>Enter</Text>
                                </TouchableOpacity>
                            </View>
                            {(!formData.complainantname || formData.complainantname.length === 0) && <Text style={globalStyles.errorText}>Required</Text>}
                            {(formData.complainantname && formData.complainantname.length > 0) && (
                                formData.complainantname.map((item, index) => (
                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s }}>
                                        <Text style={fontStyles.body}>{index + 1}. {item}</Text>
                                        {index !== 0 && (
                                            <TouchableOpacity 
                                                onPress={() => {
                                                    setFormData((prevState) => ({
                                                        ...prevState,
                                                        complainantname: prevState.complainantname.filter((_, i) => i !== index)
                                                    }));
                                                }}
                                            >
                                                <Text style={globalStyles.removeButtonText}>(Remove)</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))
                            )}
                        </View>

                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Respondent/s <Text style={globalStyles.translation}>(Mga Inirereklamo)</Text>
                            </Text>
                            <View style={{ flexDirection: 'row', gap: spacing.m }}>
                                <TextInput
                                    style={[{flex: 1}, globalStyles.inputBox, focusedInput === 'respondentname' && globalStyles.inputBoxFocused]}
                                    placeholder="Respondent/s"
                                    placeholderTextColor={colors.darkgray}
                                    value={formData.respondentInput}
                                    onChangeText={(value) => setFormData({ ...formData, respondentInput: value })}
                                    onFocus={() => setFocusedInput('respondentname')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                <TouchableOpacity 
                                    style={globalStyles.responsiveButton}
                                    onPress={() => {
                                        if (formData.respondentInput.trim()) {
                                            setFormData((prevState) => ({
                                                ...prevState,
                                                respondentname: [...prevState.respondentname, prevState.respondentInput.trim()],
                                                respondentInput: ''
                                            }));
                                        }
                                    }}
                                >
                                    <Text style={globalStyles.buttonText}>Enter</Text>
                                </TouchableOpacity>
                            </View>
                            {(!formData.respondentname || formData.respondentname.length === 0) && <Text style={globalStyles.errorText}>Required</Text>}
                            {(formData.respondentname && formData.respondentname.length > 0) && (
                                formData.respondentname.map((item, index) => (
                                    <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.s }}>
                                        <Text style={fontStyles.body}>{index + 1}. {item}</Text>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                setFormData((prevState) => ({
                                                    ...prevState,
                                                    respondentname: prevState.respondentname.filter((_, i) => i !== index)
                                                }));
                                            }}
                                        >
                                            <Text style={globalStyles.removeButtonText}>(Remove)</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </View>

                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Statement of Complaint <Text style={globalStyles.translation}>(Pahayag ng Reklamo)</Text>
                            </Text>
                            <TextInput
                                multiline
                                style={[
                                    globalStyles.inputBox,
                                    { height: Math.max(statementInputHeight, 50) },
                                    focusedInput === 'incidentdescription' && globalStyles.inputBoxFocused
                                ]}
                                placeholder="Statement of Complaint"
                                placeholderTextColor={colors.darkgray}
                                value={formData.incidentdescription}
                                onChangeText={(value) => setFormData({ ...formData, incidentdescription: value })}
                                onFocus={() => setFocusedInput('incidentdescription')}
                                onBlur={() => setFocusedInput(null)}
                                onContentSizeChange={(event) => 
                                    setStatementInputHeight(event.nativeEvent.contentSize.height)
                                }
                            />
                            {!formData.incidentdescription && <Text style={globalStyles.errorText}>Required</Text>}
                        </View>

                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Prayer for Relief  <Text style={globalStyles.translation}>(Hiling na Kalunasan)</Text>
                            </Text>
                            <TextInput
                                multiline
                                style={[
                                    globalStyles.inputBox,
                                    { height: Math.max(prayerInputHeight, 50) },
                                    focusedInput === 'relieftobegranted' && globalStyles.inputBoxFocused
                                ]}
                                placeholder="Prayer for Relief"
                                placeholderTextColor={colors.darkgray}
                                value={formData.relieftobegranted}
                                onChangeText={(value) => setFormData({ ...formData, relieftobegranted: value })}
                                onFocus={() => setFocusedInput('relieftobegranted')}
                                onBlur={() => setFocusedInput(null)}
                                onContentSizeChange={(event) => 
                                    setPrayerInputHeight(event.nativeEvent.contentSize.height)
                                }
                            />
                            {!formData.relieftobegranted && <Text style={globalStyles.errorText}>Required</Text>}
                        </View>

                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Date and Time of Incident <Text style={globalStyles.translation}>(Petsa at Oras ng Insidente)</Text>
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={globalStyles.buttonSecondary}>
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <MaterialCommunityIcons name="calendar-clock" size={24} color={colors.primary} />
                                    {formData.dateAndTimeofIncident ? (
                                        <Text style={globalStyles.buttonSecondaryText}>
                                            {new Date(formData.dateAndTimeofIncident).toLocaleDateString()}{' '}
                                            {new Date(formData.dateAndTimeofIncident).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    ) : (
                                        <Text style={globalStyles.buttonSecondaryText}>Select Date and Time</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                            {!formData.dateAndTimeofIncident && <Text style={globalStyles.errorText}>(Required)</Text>}
                            {showDatePicker && (
                                <DateTimePicker
                                    value={new Date(formData.dateAndTimeofIncident || Date.now())}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateAndTimeChange}
                                    minimumDate={new Date(1900, 0, 1)}
                                    maximumDate={new Date()}
                                />
                            )}

                            {showTimePicker && (
                                <DateTimePicker
                                    value={new Date(formData.dateAndTimeofIncident || Date.now())}
                                    mode="time"
                                    display="default"
                                    onChange={handleDateAndTimeChange}
                                />
                            )}
                        </View>

                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Supporting Evidences <Text style={globalStyles.translation}>(Mga Ebidensya)</Text>
                            </Text>
                            <TouchableOpacity onPress={handleAttachmentUpload} style={globalStyles.buttonSecondary}>
                                <Text style={globalStyles.buttonSecondaryText}>+ Upload File</Text>
                            </TouchableOpacity>
                            <View style={globalStyles.attachmentsContainer}>
                                {formData.Attachment.map((attachment, index) => (
                                    <View key={index} style={globalStyles.attachmentsWrapper}>      
                                        {(attachment.type && attachment.type.startsWith('video/') || (attachment.mimetype && attachment.mimetype.startsWith('video/'))) ? (
                                            <TouchableOpacity onPress={() => handleVideoPress(attachment.uri ? attachment.uri : attachment.url)}>
                                                <Image
                                                    source={{ uri: attachment.thumbnailUri }}
                                                    style={globalStyles.attachmentsImage}
                                                />
                                                <View style={globalStyles.playIconOverlay}>
                                                    <MaterialCommunityIcons name="play-circle" size={48} color={colors.white} />
                                                </View>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity onPress={() => openFullScreenPicture(attachment.url ? attachment.url : attachment.uri)}>
                                                <Image source={{ uri: attachment.url ? attachment.url : attachment.uri }} style={globalStyles.attachmentsImage} />
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => handleRemoveAttachment(index)} style={globalStyles.attachmentsRemoveButton}>
                                            <MaterialCommunityIcons name="close" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <Modal visible={showVideoModal} animationType="slide" onRequestClose={handleCloseVideoModal}>
                            <View style={globalStyles.videoModal}>
                                <Video
                                    source={{ uri: selectedVideoUri }}
                                    style={globalStyles.videoPlayer}
                                    useNativeControls
                                    resizeMode="contain"
                                    shouldPlay
                                />
                                <TouchableOpacity onPress={handleCloseVideoModal} style={globalStyles.videoModalCloseButton}>
                                    <Text style={globalStyles.videoModalCloseText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </Modal>
                        <SubmitClearButton edit={true} onSubmit={handleUpdate} onClear={clearForm} />
                    </View>
                </View>
                ) : (
                    <View style={globalStyles.emptyMessageContainer}>
                        <MaterialCommunityIcons name="close-circle-outline" size={100} color={colors.gray} />
                        <Text style={globalStyles.emptyMessageText}>Complaint failed to load</Text>
                    </View>
                )
            }
            </ScrollView>
            <LoadingModal visible={isSubmitting} purpose="Submitting" />
            <AlertModal
                visible={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={modalContent.title}
                message={modalContent.message}
                buttons={modalContent.buttons}
            />
        </KeyboardAvoidingView>
    );
};

export default EditComplaint;