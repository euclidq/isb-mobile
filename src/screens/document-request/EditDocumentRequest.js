import { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity, KeyboardAvoidingView, Image, Platform } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import useHandleScroll from '../../hooks/useHandleScroll';
import LoadingModal from '../../components/LoadingModal';
import AlertModal from '../../components/modals/AlertModal';
import SubmitClearButton from '../../components/SubmitClearButton';
import {colors, sizes, spacing, globalStyles, fontStyles} from '../../styles/theme';

const EditDocumentRequest = ({ route, navigation }) => {
    const handleScroll = useHandleScroll(navigation, 'Edit Document Request')
    const { documentRequestID } = route.params;

    const [userData, setUserData] = useState(null);
    const [householdMembers, setHouseholdMembers] = useState([]);
    const [documentRequest, setDocumentRequest] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });
    const [formData, setFormData] = useState({
        requestedBy: '',
        requestedByType: 'Resident',
        recipient: '',
        residentName: '',
        documentType: '',
        otherDocumentType: '',
        purpose: '',
        otherPurpose: '',
        ValidID: [],
        status:'',
    });

    const documentTypes = [
        'Certificate of Indigency',
        'Certificate of Residency',
        'Certificate of Good Moral Character',
        'Certificate of Local Employment',
        'Certificate of Financial Assistance',
        'Certificate of First Time Jobseeker',
        'Barangay Clearance',
        'Barangay Business Permit',
        'Others'
    ];
    const purposes = [
        'Work',
        'Open Bank Account',
        'School',
        'Business',
        'Travel',
        'Others',
    ]

    useEffect(() => {
        const getDocumentRequestDetail = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/document-requests/${documentRequestID}`);
                const data = response.data.request;
                setDocumentRequest(response.data.request);

                setFormData({
                    ReferenceNo: data.ReferenceNo,
                    requestedBy: data.requestedBy._id,
                    requestedByType: data.requestedByType,
                    recipient: data.recipient,
                    recipientID: data.recipientID,
                    residentName: data.residentName,
                    documentType: data.documentType,
                    otherDocumentType: data.documentType === 'Others' ? data.otherDocumentType : '',
                    purpose: data.purpose,
                    otherPurpose: data.purpose === 'Others' ? data.otherPurpose : '',
                    ValidID: data.ValidID,
                });
            } catch (error) {
                console.error('Error fetching announcement detail:', error);
            } finally {
                setIsLoading(false);
            }
        };
        getDocumentRequestDetail();
    }, [documentRequestID])

    useEffect(() => {
        const getUserData = async () => {
            try {
                const storedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
                setUserData(storedUserData);
            } catch (error) {
                console.error('Error getting user data:', error);
            }
        };
        getUserData();
    }, []);

    useEffect(() => {
        if (userData) {
            const getHouseholdData = async () => {
                try {
                    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/household/id/${userData?.householdID?._id}`);
                    const transformedMembers = response.data.members.map(user => ({
                        fullName: `${user.firstName}${user.middleName ? ' ' + user.middleName + ' ' : ' '}${user.lastName}${user.suffix ? ' ' + user.suffix : ''}`,
                        residentID: user._id,
                    }));
                    setHouseholdMembers(transformedMembers);

                } catch (error) {
                    console.error('Error fetching household data:', error);
                }
            };
            getHouseholdData();
        }
    }, [userData]);

    const handleValidIDUpload = async () => {
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
    
        const currentTotalSize = calculateTotalSize(formData.ValidID);
    
        setModalContent({
            title: 'Upload Attachment(s)',
            message: `Accepted formats: Images (JPEG, PNG) and PDFs\nMaximum total file size limit: ${MAX_TOTAL_SIZE_MB}MB`,
            buttons: [
                {
                    label: 'Take Photo',
                    onPress: async () => {
                        const pickerResult = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            quality: 1,
                        });
    
                        if (!pickerResult.canceled) {
                            const uri = pickerResult.assets[0].uri;
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
    
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                ValidID: [...prevFormData.ValidID, { uri, name: `ValidID${Date.now()}.jpg`, type: 'image/jpeg', size: fileSize }]
                            }));
                        }
                        setShowAlertModal(false);
                    },
                },
                {
                    label: 'Choose from Library',
                    onPress: async () => {
                        const pickerResult = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            quality: 1,
                        });
    
                        if (!pickerResult.canceled) {
                            const uri = pickerResult.assets[0].uri;
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
    
                            setFormData((prevFormData) => ({
                                ...prevFormData,
                                ValidID: [...prevFormData.ValidID, { uri, name: `ValidID-${Date.now()}.jpg`, type: 'image/jpeg', size: fileSize }]
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
                                type: ['image/*', 'application/pdf'],
                                copyToCacheDirectory: true,
                            });
    
                            if (pickerResult.assets && pickerResult.assets.length > 0) {
                                const { uri, name, size, mimeType } = pickerResult.assets[0];
    
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
    
                                setFormData((prevFormData) => ({
                                    ...prevFormData,
                                    ValidID: [
                                        ...prevFormData.ValidID,
                                        { uri, name, type: mimeType, size }
                                    ]
                                }));
                            } else if (pickerResult.canceled) {
                                console.log('User canceled document picking');
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
                    label: 'Close',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary,
                }
            ],
        });
        setShowAlertModal(true);
    };

    const handleRemoveID = (indexToRemove) => {
        setModalContent({
            title: 'Confirm Remove',
            message: 'Are you sure you want to remove this attachment?',
            buttons: [
                {
                    label: 'Cancel',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary,
                },
                {
                    label: 'Remove',
                    onPress: () => {
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            ValidID: prevFormData.ValidID.filter((_, index) => index !== indexToRemove)
                        }));
                        setShowAlertModal(false);
                    },
                    buttonStyle: globalStyles.modalButtonDanger,
                    textStyle: globalStyles.modalButtonTextDanger,
                }
            ]
        });
        setShowAlertModal(true);      
    };

    const handleUpdate = async () => {
        const { ReferenceNo, status, requestedBy, residentName, documentType, otherDocumentType, recipient, recipientID, purpose, otherPurpose, ValidID } = formData;
    
        const requiredFields = [
            { field: documentType, label: 'Document Type' },
            { field: recipient, label: 'Recipient' },
            { field: purpose, label: 'Purpose of Request' },
        ];
    
        if (documentType === 'Others' && !otherDocumentType) {
            requiredFields.push({ field: otherDocumentType, label: 'Other Document Type' });
        }
    
        if (purpose === 'Others' && !otherPurpose) {
            requiredFields.push({ field: otherPurpose, label: 'Other Purpose of Request' });
        }
    
        const missingFields = requiredFields
            .filter(({ field }) => !field)
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
            return;
        }

        setModalContent({
            title: 'Confirm Edit',
            message: 'Are you sure you want to save your changes?\n\nOnce the document request is processed, you won’t be able to make any changes.',
            buttons: [
                {
                    label: 'Cancel',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary,
                },
                {
                    label: 'Save',
                    onPress: async () => {
                        setIsSubmitting(true);

                        const formDataToSend = new FormData();
                        formDataToSend.append('ReferenceNo', ReferenceNo);
                        formDataToSend.append('requestedBy', requestedBy);
                        formDataToSend.append('residentName', residentName);
                        formDataToSend.append('documentType', documentType === 'Others' ? otherDocumentType : documentType);
                        formDataToSend.append('recipient', recipient);
                        formDataToSend.append('recipientID', recipientID || '');
                        formDataToSend.append('purpose', purpose === 'Others' ? otherPurpose : purpose);

                        ValidID.forEach((file) => {
                            if (file.uri) {
                                formDataToSend.append('ValidID', {
                                    uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                                    type: file.type || 'image/jpeg',
                                    name: file.name || `photo-${Date.now()}.jpg`,
                                });
                            }
                        });

                        try {
                            const response = await axios.put(`${process.env.EXPO_PUBLIC_API_BASE_URL}/document-requests/${documentRequestID}`, formDataToSend, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });
                        
                            if (response.status === 200) {
                                setModalContent({
                                    title: 'Success',
                                    message: 'Document Request edited successfully.',
                                    buttons: [
                                        {
                                            label: 'Close',
                                            onPress: () => {
                                                setShowAlertModal(false);
                                                navigation.goBack();
                                            }
                                        }
                                    ]
                                });
                                setShowAlertModal(true);
                            }
                        } catch (error) {
                            console.error('Error updating document request:', error);
                            setModalContent({
                                title: 'Error',
                                message: 'An error occurred while editing your request. Please try again.',
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
                    }
                },
            ]
        });
        setShowAlertModal(true);
    };
    
    const handleCancel = async () => {
        setModalContent({
            title: 'Confirm Cancellation',
            message: 'Are you sure you want to cancel this document request?',
            buttons: [
                {
                    label: 'No',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary,
                },
                {
                    label: 'Yes',
                    onPress: async () => {
                        const response = await axios.delete(`${process.env.EXPO_PUBLIC_API_BASE_URL}/document-requests/${documentRequestID}`);

                        if (response.status === 200) {
                            setModalContent({
                                title: 'Success',
                                message: 'Document request cancelled successfully.',
                                buttons: [
                                    {
                                        label: 'Close',
                                        onPress: () => {
                                            setShowAlertModal(false);
                                            navigation.navigate('DocumentRequests')
                                        },
                                    }
                                ]
                            });
                            setShowAlertModal(true);
                        }
                    },
                    buttonStyle: globalStyles.modalButtonDanger,
                    textStyle: globalStyles.modalButtonTextDanger,
                },
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
                    textStyle: globalStyles.modalButtonTextSecondary,
                },
                {
                    label: 'Clear',
                    onPress: () => {
                        setFormData({
                            recipient: '',
                            documentType: '',
                            otherDocumentType: '',
                            purpose: '',
                            otherPurpose: '',
                            ValidID: [],
                        });
                        setShowAlertModal(false);
                    },
                    buttonStyle: globalStyles.modalButtonDanger,
                    textStyle: globalStyles.modalButtonTextDanger,
                },
            ]
        });
        setShowAlertModal(true);
    };

    const openFullScreenPicture = (imageUri) => {
        navigation.navigate('Full Screen Picture', { imageUri });
    };
    
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleCancel} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={[fontStyles.bold, {color: colors.red, marginRight: 5}]}>Cancel</Text>
                    <MaterialCommunityIcons name="trash-can-outline" size={30} color={colors.red} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    return (
        <KeyboardAvoidingView behavior={"padding"} style={globalStyles.container}>
            <ScrollView onScroll={handleScroll} contentContainerStyle={globalStyles.scrollViewContainer}>
                <Text style={fontStyles.screenTitle}>Edit Document Request</Text>
                
                {isLoading ? (
                    <LoadingModal visible={isLoading} purpose={'Loading'} />
                ) : documentRequest ? (
                <View style={globalStyles.detailCard}>
                    <View style={globalStyles.inputContainer}>
                    {/* Document Type (Editable) */}
                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Document Type <Text style={globalStyles.translation}>(Uri ng Dokumento)</Text>
                            </Text>
                            <Dropdown
                                label="Document Type"
                                style={[globalStyles.inputBox, focusedInput === 'documentType' && globalStyles.inputBoxFocused]}
                                placeholderStyle={globalStyles.inputBoxPlaceholder}
                                selectedTextStyle={fontStyles.body}
                                labelField="label"
                                valueField="value"
                                placeholder="Document Type"
                                data={documentTypes.map((type) => ({ label: type, value: type }))}
                                value={formData.documentType}
                                onChange={(item) => {
                                    const selectedValue = item.value;
                                    setFormData({ ...formData, documentType: selectedValue });
                                }}
                                onFocus={() => setFocusedInput('documentType')}
                                onBlur={() => setFocusedInput(null)}
                            />
                            {!formData.documentType && <Text style={globalStyles.errorText}>Required</Text>}
                        </View>
        
                        {formData.documentType === 'Others' && (
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>
                                    Other Document Type <Text style={globalStyles.translation}>(Ibang Uri ng Dokumento)</Text>
                                </Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'otherDocumentType' && globalStyles.inputBoxFocused]}
                                    placeholder="Other Document Type"
                                    placeholderTextColor={colors.darkgray}
                                    value={formData.otherDocumentType}
                                    onChangeText={(value) => setFormData({ ...formData, otherDocumentType: value })}
                                    onFocus={() => setFocusedInput('otherDocumentType')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                {!formData.otherDocumentType && <Text style={globalStyles.errorText}>Required</Text>}
                            </View>
                        )}
        
                        {/* Recipient */}
                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Recipient <Text style={globalStyles.translation}>(Tagatanggap)</Text>
                            </Text>
                            <Dropdown
                                label="Recipient"
                                style={[globalStyles.inputBox, focusedInput === 'recipient' && globalStyles.inputBoxFocused]}
                                placeholderStyle={globalStyles.inputBoxPlaceholder}
                                selectedTextStyle={fontStyles.body}
                                labelField="label"
                                valueField="value"
                                placeholder="Recipient"
                                data={householdMembers.map((member) => ({ label: member.fullName, value: member.fullName, residentID: member.residentID }))}
                                value={formData.recipient}
                                onChange={(item) => {
                                    const selectedValue = item.value;
                                    const selectedResidentID = item.residentID;
                                    setFormData({
                                        ...formData,
                                        recipient: selectedValue,
                                        recipientID: selectedResidentID,
                                    });
                                }}
                                onFocus={async () => {setFocusedInput('recipient')}}
                                onBlur={() => setFocusedInput(null)}
                            />
                            {!formData.recipient && <Text style={globalStyles.errorText}>Required</Text>}
                        </View>
        
                        {/* Purpose of Request */}
                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Purpose of Request <Text style={globalStyles.translation}>(Layunin ng Request)</Text>
                            </Text>
                            <Dropdown
                                label="Purpose of Request"
                                style={[globalStyles.inputBox, focusedInput === 'purpose' && globalStyles.inputBoxFocused]}
                                placeholderStyle={globalStyles.inputBoxPlaceholder}
                                selectedTextStyle={fontStyles.body}
                                labelField="label"
                                valueField="value"
                                placeholder="Purpose of Request"
                                data={purposes.map((purpose) => ({ label: purpose, value: purpose }))}
                                value={formData.purpose}
                                onChange={(item) => {
                                    const selectedValue = item.value;
                                    setFormData({ ...formData, purpose: selectedValue });
                                }}  
                                onFocus={() => setFocusedInput('purpose')}
                                onBlur={() => setFocusedInput(null)}
                            />
                            {!formData.purpose && <Text style={globalStyles.errorText}>(Required)</Text>}
                        </View>
        
                        {formData.purpose === 'Others' && ( 
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>
                                    Other Purpose of Request <Text style={globalStyles.translation}>(Ibang Layunin ng Request)</Text>
                                </Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'otherPurpose' && globalStyles.inputBoxFocused]}
                                    placeholder="Other Purpose"
                                    placeholderTextColor={colors.darkgray}
                                    value={formData.otherPurpose}
                                    onChangeText={(value) => setFormData({ ...formData, otherPurpose: value })}
                                    onFocus={() => setFocusedInput('otherPurpose')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                {!formData.otherPurpose && <Text style={globalStyles.errorText}>(Required)</Text>}
                            </View>
                        )}

                        {/* Attachments */}
                        <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>
                                Attachments <Text style={globalStyles.translation}>(Mga Kalakip na Dokumento)</Text>
                            </Text>
                            <TouchableOpacity onPress={handleValidIDUpload} style={globalStyles.buttonSecondary}>
                                <Text style={globalStyles.buttonSecondaryText}>+ Upload File</Text>
                            </TouchableOpacity>
                            
                            {formData.ValidID.length > 0 && (
                                <View style={globalStyles.attachmentsContainer}>
                                    {formData.ValidID.map((id, index) => (
                                        <View key={index} style={globalStyles.attachmentsWrapper}>
                                            {id.type === 'application/pdf' ? (
                                                <View style={globalStyles.attachmentsImage} >
                                                    <MaterialCommunityIcons name="file-pdf-box" size={60} color="red" />
                                                    <Text style={fontStyles.body}>{id.name.length > 7 ? `${id.name.substring(0, 5)}...pdf` : id.name}</Text>
                                                </View>
                                            ) : (
                                                <TouchableOpacity onPress={() => openFullScreenPicture(id.uri ? id.uri : id.url)} style={globalStyles.attachmentsImage}>
                                                    <Image source={{ uri: id.uri ? id.uri : id.url }} style={globalStyles.attachmentsImage} />
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity onPress={() => handleRemoveID(index)} style={globalStyles.attachmentsRemoveButton}>
                                                <MaterialCommunityIcons name="close" size={20} color='white' />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                        <SubmitClearButton edit={true} onSubmit={handleUpdate} onClear={clearForm} />
                    </View>
                </View>
                ) : (
                    <View style={globalStyles.emptyMessageContainer}>
                        <MaterialCommunityIcons name="close-circle-outline" size={100} color={colors.gray} />
                        <Text style={globalStyles.emptyMessageText}>Document request failed to load</Text>
                    </View>
                )}
            </ScrollView>
            <LoadingModal visible={isSubmitting} purpose={'Submitting'}/>
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

export default EditDocumentRequest;