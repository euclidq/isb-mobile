import { useEffect, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import useHandleScroll from '../../hooks/useHandleScroll';
import LoadingModal from '../../components/LoadingModal';
import AlertModal from '../../components/modals/AlertModal';
import SubmitClearButton from '../../components/SubmitClearButton';
import {colors, fontStyles, globalStyles} from '../../styles/theme';

const CreateAnnouncement = () => {    
    const navigation = useNavigation();
    const handleScroll = useHandleScroll(navigation, 'Create Announcement');

    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        adminID: '',
        announcementCategory: '',
        otherCategory: '', 
        title: '',
        content: '',
        Importance: 'Not Important',
        endDate: '',
        attachments: [],
    });
    const [inputHeight, setInputHeight] = useState(50);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const categories = [ 'Health and Safety', 'Community Assistance', 'Public Services', 'Events', 'Public Advisory', 'Others' ];

    useEffect(() => {
        const getUserData = async () => {
            try {
                const userData = JSON.parse(await AsyncStorage.getItem('userData'));
                if (userData) {
                    setUserData(userData);
                    setFormData({ ...formData, adminID: userData._id });
                }
            } catch (error) {
                console.error('Error getting user data:', error);
            }
        };
        getUserData();
    }, []);

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

        const MAX_TOTAL_SIZE_MB = 10;
        const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;
    
        const calculateTotalSize = (attachments) => {
            return attachments.reduce((total, file) => total + (file.size || 0), 0);
        };
    
        const currentTotalSize = calculateTotalSize(formData.attachments);

        setModalContent({
            title: 'Upload Announcement Picture',
            message: `Accepted formats: Images (JPG, JPEG, PNG)\nMaximum file size limit: ${MAX_TOTAL_SIZE_MB}MB`,
            buttons: [
                {
                    label: 'Take Photo',
                    onPress: async () => {
                        const pickerResult = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            quality: 1,
                        });
    
                        if (pickerResult.assets && pickerResult.assets.length > 0) {
                            const { uri, type, size } = pickerResult.assets[0];

                            const newTotalSize = currentTotalSize + size;

                            if (newTotalSize > MAX_TOTAL_SIZE_BYTES) {
                                setModalContent({
                                    title: 'File Size Exceeded',
                                    message: `The size of the file exceeds the ${MAX_TOTAL_SIZE_MB}MB limit.`,
                                    buttons: [
                                        {
                                            label: 'Close',
                                            onPress: () => setShowAlertModal(false)
                                        }
                                    ]
                                });
                                setShowAlertModal(false)
                                return;
                            }

                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                attachments: [{ uri, name: `announcementPicture-${Date.now()}.jpg`, type }]
                            }));
                        }
                        setShowAlertModal(false);
                    },
                },
                {
                    label: 'Choose From Library',
                    onPress: async () => {
                        const pickerResult = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            quality: 1,
                        });
    
                        if (pickerResult.assets && pickerResult.assets.length > 0) {
                            const { uri, type, size } = pickerResult.assets[0];
                            const newTotalSize = currentTotalSize + size;

                            if (newTotalSize > MAX_TOTAL_SIZE_BYTES) {
                                setModalContent({
                                    title: 'File Size Exceeded',
                                    message: `The size of the file exceeds the ${MAX_TOTAL_SIZE_MB}MB limit.`,
                                    buttons: [
                                        {
                                            label: 'Close',
                                            onPress: () => setShowAlertModal(false)
                                        }
                                    ]
                                });
                                setShowAlertModal(false)
                                return;
                            }

                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                attachments: [{ uri, name: `announcementPicture-${Date.now()}.jpg`, type }]
                            }));
                            
                        }
                        setShowAlertModal(false);
                    },
                },
                {
                    label: 'Choose From Files',
                    onPress: async () => {
                        try {
                            const pickerResult = await DocumentPicker.getDocumentAsync({
                                type: ['image/*'],
                                copyToCacheDirectory: true,
                            });
    
                            if (pickerResult.assets && pickerResult.assets.length > 0) {
                                const { uri, type, size } = pickerResult.assets[0];

                                const newTotalSize = currentTotalSize + size;
    
                                if (newTotalSize > MAX_TOTAL_SIZE_BYTES) {
                                    setModalContent({
                                        title: 'File Size Exceeded',
                                        message: `The size of the file exceeds the ${MAX_TOTAL_SIZE_MB}MB limit.`,
                                        buttons: [
                                            {
                                                label: 'Close',
                                                onPress: () => setShowAlertModal(false)
                                            }
                                        ]
                                    });
                                    setShowAlertModal(false)
                                    return;
                                }

                                setFormData((prevFormData) => ({
                                    ...prevFormData,
                                    attachments: [{ uri, name: `announcementPicture-${Date.now()}.jpg`, type }]
                                }));
                            }
                        } catch (error) {
                            console.error('Error during file selection:', error);
                            setModalContent({
                                title: 'Error',
                                message: `An error occurred while picking a file. Please try again.`,
                                buttons: [
                                    {
                                        label: 'Close',
                                        onPress: () => setShowAlertModal(false)
                                    }
                                ]
                            });
                        }
                        setShowAlertModal(false);
                    },
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

    const handleRemoveAttachment = (index) => {
        setModalContent({
            title: 'Confirm File Removal',
            message: 'Are you sure you want to remove this file?',
            buttons: [
                {
                    label: 'Cancel',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary
                },
                {
                    label: 'Remove',
                    onPress: () => {
                        setFormData({
                            ...formData,
                            attachments: formData.attachments.filter((_, i) => i !== index),
                        });
                        setShowAlertModal(false);
                    },
                    buttonStyle: globalStyles.modalButtonDanger,
                    textStyle: globalStyles.modalButtonTextDanger
                }
            ]
        });
        setShowAlertModal(true);
    };

    const handleDateAndTimeChange = (event, selectedDate) => {
        if (selectedDate) {
            if (showDatePicker) {
                selectedDate.setHours(23, 59, 0, 0);
    
                setFormData({
                    ...formData,
                    endDate: selectedDate,
                });
    
                setShowDatePicker(false);
                setShowTimePicker(true);
            } else if (showTimePicker) {
                const currentDate = new Date(formData.endDate);
                currentDate.setHours(selectedDate.getHours());
                currentDate.setMinutes(selectedDate.getMinutes());
    
                setFormData({
                    ...formData,
                    endDate: currentDate.toISOString(),
                });
    
                setShowTimePicker(false);
            }
        }
    };
    
    const handleSubmit = async () => {
        const { announcementCategory, otherCategory, title, content, Importance, attachments, endDate } = formData;
        
        const now = new Date();
        const selectedEndDate = new Date(endDate);
    
        if (!endDate || selectedEndDate <= now) {
            setModalContent({
                title: 'Invalid Date',
                message: 'Invalid end date. End date must be in the future.',
                buttons: [{ label: 'Close', onPress: () => setShowAlertModal(false) }]
            });
            setShowAlertModal(true);
            return;
        }
 
        const requiredFields = [
            { field: announcementCategory, label: 'Announcement Category' },
            { field: title, label: 'Announcement Title' },
            { field: content, label: 'Announcement Content' },
            { field: endDate, label: 'End Date' }
        ];
        
        if (announcementCategory === 'Others' && !otherCategory) {
            requiredFields.push({ field: otherCategory, label: 'Other Announcement Category' });
        }
    
        const missingFields = requiredFields
            .filter(({ field }) => !field || (Array.isArray(field) && field.length === 0))
            .map(({ label }) => label);
    
        if (missingFields.length > 0) {
            setModalContent({
                title: 'Validation Error',
                message: `The following fields are required:\n- ${missingFields.join('\n- ')}`,
                buttons: [{ label: 'Close', onPress: () => setShowAlertModal(false) }]
            });
            setShowAlertModal(true);
            return;
        }
    
        // Confirm submission modal
        setModalContent({
            title: 'Confirm Submission',
            message: 'Are you sure you want to submit this announcement?',
            buttons: [
                {
                    label: 'Cancel',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary
                },
                {
                    label: 'Submit',
                    onPress: async () => {
                        setIsSubmitting(true);
                        try {
                            const formDataToSend = new FormData();
                            formDataToSend.append('adminID', userData._id);
                            formDataToSend.append('announcementCategory', announcementCategory === 'Others' ? otherCategory : announcementCategory);
                            formDataToSend.append('title', title);
                            formDataToSend.append('content', content);
                            formDataToSend.append('Importance', Importance);
                            formDataToSend.append('endDate', endDate);
    
                            if (attachments && attachments.length > 0) {
                                attachments.forEach((attachment, index) => {
                                    formDataToSend.append('attachments', {
                                        uri: attachment.uri,
                                        name: `announcementAttachment-${Date.now()}-${index}.jpg`,
                                        type: 'image/jpeg'
                                    });
                                });
                            }
    
                            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/new/announcements`, formDataToSend, {
                                headers: { 'Content-Type': 'multipart/form-data' }
                            });
    
                            setModalContent({
                                title: 'Success',
                                message: 'Announcement created successfully.',
                                buttons: [
                                    {
                                        label: 'Create new',
                                        onPress: () => {
                                            setShowAlertModal(false);
                                            clearForm(false);
                                        },
                                        buttonStyle: globalStyles.modalButtonSecondary,
                                        textStyle: globalStyles.modalButtonTextSecondary
                                    },
                                    {
                                        label: 'Close',
                                        onPress: () => {
                                            setShowAlertModal(false);
                                            navigation.goBack();
                                        }
                                    }
                                ]
                            });
                        } catch (error) {
                            console.error('Error creating announcement:', error);
                            setModalContent({
                                title: 'Error',
                                message: error.response?.data?.message || 'Error creating announcement. Please try again.',
                                buttons: [{ label: 'Ok', onPress: () => setShowAlertModal(false) }]
                            });
                        } finally {
                            setShowAlertModal(true);
                            setIsSubmitting(false);
                        }
                    },
                }
            ]
        });
        setShowAlertModal(true);
    };
    
    const clearForm = (modal = false) => {
        if (!modal) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                announcementCategory: '',
                otherCategory: '',
                title: '',
                content: '',
                Importance: 'Not Important',
                endDate: '',
                attachments: [],
            }));
            return;
        }
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
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            announcementCategory: '',
                            otherCategory: '',
                            title: '',
                            content: '',
                            Importance: 'Not Important',
                            endDate: '',
                            attachments: [],
                        }));
                        setShowAlertModal(false);
                    },
                    buttonStyle: globalStyles.modalButtonDanger,
                    textStyle: globalStyles.modalButtonTextDanger
                }
            ]
        });
        setShowAlertModal(true);
    };

    const openFullScreenPicture = (imageUri) => {
        navigation.navigate('Full Screen Picture', { imageUri });
    };

    return (
        <KeyboardAvoidingView behavior={"padding"} style={globalStyles.container}>
            <ScrollView onScroll={handleScroll} contentContainerStyle={globalStyles.scrollViewContainer}>
                <Text style={fontStyles.screenTitle}>Create Announcement</Text>
                <View style={globalStyles.detailCard}>
                    <View style={globalStyles.inputContainer}>
                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>Category {!formData.announcementCategory && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                            <Dropdown
                                label="Announcement Category"
                                style={[globalStyles.inputBox, focusedInput === 'category' && globalStyles.inputBoxFocused]}
                                placeholderStyle={globalStyles.inputBoxPlaceholder}
                                selectedTextStyle={fontStyles.body}
                                labelField="label"
                                valueField="value"
                                placeholder="Announcement Category"
                                data={categories.map((category) => ({ label: category, value: category }))}
                                value={formData.announcementCategory}
                                onChange={(item) => {
                                    const selectedValue = item.value;
                                    setFormData({ ...formData, announcementCategory: selectedValue });
                                }}
                                onFocus={() => setFocusedInput('category')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        {formData.announcementCategory === 'Others' && (
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Other Category {!formData.otherCategory && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'otherCategory' && globalStyles.inputBoxFocused]}
                                    placeholder="Other Announcement Category"
                                    placeholderTextColor={colors.darkgray}
                                    value={formData.otherCategory}
                                    onChangeText={(value) => setFormData({ ...formData, otherCategory: value })}
                                    onFocus={() => setFocusedInput('otherCategory')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>
                        )}

                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>Title {!formData.title && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                            <TextInput
                                style={[globalStyles.inputBox, focusedInput === 'title' && globalStyles.inputBoxFocused]}
                                placeholder="Announcement Title"
                                placeholderTextColor={colors.darkgray}
                                value={formData.title}
                                onChangeText={(value) => setFormData({ ...formData, title: value })}
                                onFocus={() => setFocusedInput('title')}
                                onBlur={() => setFocusedInput(null)}
                            />
                        </View>

                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>Content {!formData.content && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                            <TextInput
                                multiline
                                style={[
                                    globalStyles.inputBox,
                                    { height: Math.max(inputHeight, 50) },
                                    focusedInput === 'content' && globalStyles.inputBoxFocused
                                ]}
                                placeholder="Announcement Content"
                                placeholderTextColor={colors.darkgray}
                                value={formData.content}
                                onChangeText={(value) => setFormData({ ...formData, content: value })}
                                onFocus={() => setFocusedInput('content')}
                                onBlur={() => setFocusedInput(null)}
                                onContentSizeChange={(event) => 
                                    setInputHeight(event.nativeEvent.contentSize.height)
                                }
                            />
                        </View>
                        
                        <View style={globalStyles.inputWrapper}>
                            <TouchableOpacity 
                                style={globalStyles.checkboxWrapper} 
                                onPress={() => setFormData({ 
                                    ...formData, 
                                    Importance: formData.Importance === "Important" ? "Not Important" : "Important"
                                })}
                            >
                                <View style={[globalStyles.checkboxUnchecked, formData.Importance === "Important" && globalStyles.checkboxChecked]} />
                                <Text style={{...fontStyles.body}}>Important</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                End Date {!formData.endDate && <Text style={globalStyles.errorText}>(Required)</Text>}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    const now = new Date();
                                    if (!formData.endDate || new Date(formData.endDate) >= now) {
                                        setShowDatePicker(true);
                                    }
                                }}
                                style={globalStyles.buttonSecondary}
                            >
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <MaterialCommunityIcons name="calendar-clock" size={24} color={colors.primary} />
                                    {formData.endDate ? (
                                        <Text style={globalStyles.buttonSecondaryText}>
                                            {new Date(formData.endDate).toLocaleDateString()}{' '}
                                            {new Date(formData.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    ) : (
                                        <Text style={globalStyles.buttonSecondaryText}>Select Date and Time</Text>
                                    )}
                                </View>
                            </TouchableOpacity>

                            {!formData.endDate && <Text style={globalStyles.errorText}>Required</Text>}

                            {showDatePicker && (
                                <DateTimePicker
                                    value={formData.endDate ? new Date(formData.endDate) : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        if (!selectedDate) return; // Ignore cancellation

                                        const now = new Date();
                                        if (selectedDate < now.setHours(0, 0, 0, 0)) {
                                            setShowDatePicker(false);
                                            return; // Do not update if the date is in the past
                                        }

                                        handleDateAndTimeChange(event, selectedDate);
                                    }}
                                    minimumDate={new Date()} // Prevent past dates
                                />
                            )}

                            {showTimePicker && (
                                <DateTimePicker
                                    value={formData.endDate ? new Date(formData.endDate) : new Date()}
                                    mode="time"
                                    display="default"
                                    onChange={(event, selectedTime) => {
                                        if (!selectedTime) return; // Ignore cancellation

                                        const now = new Date();
                                        const selectedDateTime = new Date(formData.endDate);
                                        selectedDateTime.setHours(selectedTime.getHours(), selectedTime.getMinutes());

                                        if (
                                            selectedDateTime.toDateString() === now.toDateString() &&
                                            selectedDateTime.getTime() <= now.getTime()
                                        ) {
                                            setShowTimePicker(false);
                                            return; // Do not update if time is in the past
                                        }

                                        handleDateAndTimeChange(event, selectedTime);
                                    }}
                                    minimumDate={
                                        formData.endDate &&
                                        new Date(formData.endDate).toDateString() === new Date().toDateString()
                                            ? new Date() // If today, set minimum time to now
                                            : undefined
                                    }
                                />
                            )}
                        </View>

                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>Attachment</Text>
                            <TouchableOpacity onPress={handleAttachmentUpload} style={globalStyles.buttonSecondary}>
                                <Text style={globalStyles.buttonSecondaryText}>+ Upload File</Text>
                            </TouchableOpacity>

                            {formData.attachments.length > 0 && (
                            <View style={globalStyles.attachmentsContainer}>
                                {formData.attachments.map((attachment, index) => (
                                    <View key={index} style={globalStyles.attachmentsWrapper}>
                                        <TouchableOpacity onPress={() => openFullScreenPicture(attachment.uri)}>
                                            <Image source={{ uri: attachment.uri }} style={globalStyles.attachmentsImage} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleRemoveAttachment(index)} style={globalStyles.attachmentsRemoveButton}>
                                            <MaterialCommunityIcons name="close" size={20} color='white' />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                            )}
                        </View>
                        <SubmitClearButton onSubmit={handleSubmit} onClear={clearForm} />
                    </View>
                </View>
            </ScrollView>
            <LoadingModal visible={isSubmitting} purpose={'Submitting'} />
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

export default CreateAnnouncement;