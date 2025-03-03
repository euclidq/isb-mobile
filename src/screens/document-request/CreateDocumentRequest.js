import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, Image, KeyboardAvoidingView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

import useHandleScroll from '../../hooks/useHandleScroll';
import LoadingModal from '../../components/LoadingModal';
import AlertModal from '../../components/modals/AlertModal';
import TermsDataPrivacy from '../../components/TermsDataPrivacy';
import TermsModal from '../../components/TermsModal';
import DataPrivacyModal from '../../components/DataPrivacyModal';
import SubmitClearButton from '../../components/SubmitClearButton';
import {colors, sizes, spacing, globalStyles, fontStyles} from '../../styles/theme';

const CreateDocumentRequest = () => {
    const navigation = useNavigation();
    const handleScroll = useHandleScroll(navigation, 'Create Document Request')

    const [userData, setUserData] = useState(null);
    const [householdMembers, setHouseholdMembers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSameRecipient, setIsSameRecipient] = useState(true);
    const [termsDataPrivacyAccepted, setTermsDataPrivacyAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showDataPrivacyModal, setShowDataPrivacyModal] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });
    const [formData, setFormData] = useState({
        requestedBy: '',
        requestedByType: 'Resident',
        recipientID: '',
        recipient: '',
        residentName: '',
        documentType: '',
        otherDocumentType: '',
        purpose: '',
        otherPurpose: '',
        ValidID: [],
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
        const getUserData = async () => {
            try {
                const storedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
                const storedFullName = await AsyncStorage.getItem('fullName');
                if (storedUserData) {
                    setUserData(storedUserData);
                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        requestedBy: storedUserData._id,
                        residentName: storedFullName,
                    }));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        getUserData();
    }, []);

    useEffect(() => {
        if (userData) {
            const getHouseholdData = async () => {
                try {
                    const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/household/id/${userData.householdID._id}`);
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
                            const fileInfo = await FileSystem.getInfoAsync(uri);
                            const fileSize = fileInfo.size;

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
                            const fileInfo = await FileSystem.getInfoAsync(uri);
                            const fileSize = fileInfo.size;

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
                    textStyle: globalStyles.modalButtonTextSecondary,
                }
            ]
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
    
    const handleSubmit = async () => {
        const { requestedBy, requestedByType, residentName, recipient, recipientID, documentType, otherDocumentType, purpose, otherPurpose, ValidID } = formData;
        
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

        if (!isSameRecipient && ValidID.length === 0) {
            requiredFields.push({ field: ValidID, label: 'Valid ID of Recipient' });
        }

        if (!termsDataPrivacyAccepted) {
            requiredFields.push({ field: termsDataPrivacyAccepted, label: 'You must agree to the Terms and Conditions and Data Privacy Agreement' });
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
            title: 'Confirm Submission',
            message: 'Are you sure you want to submit?\n\nOnce the document request is processed, you won’t be able to make any changes.',
            buttons: [
                {
                    label: 'Cancel',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary,
                },
                {
                    label: 'Submit',
                    onPress: async () => {
                        setIsSubmitting(true);
        
                        const formDataToSend = new FormData();
                        formDataToSend.append('requestedBy', requestedBy);
                        formDataToSend.append('requestedByType', requestedByType);
                        formDataToSend.append('residentName', residentName);
                        formDataToSend.append('recipient', recipient);
                        formDataToSend.append('recipientID', recipientID);
                        formDataToSend.append('documentType', documentType === 'Others' ? otherDocumentType : documentType);
                        formDataToSend.append('purpose', purpose === 'Others' ? otherPurpose : purpose);
    
                        ValidID.forEach((id, index) => {
                            formDataToSend.append('ValidID', {
                                uri: id.uri,
                                name: id.name,
                                type: id.type,
                            });
                        });
                    
                        try {
                            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/new/document-requests`, formDataToSend, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });
        
                            if (response.status === 201) {
                                setIsSubmitting(false);
                                setModalContent({
                                    title: 'Success',
                                    message: 'Document Request submitted successfully.',
                                    buttons: [
                                        {
                                            label: 'Create new',
                                            onPress: () => {
                                                setShowAlertModal(false)
                                                clearForm(false)
                                            },
                                            buttonStyle: globalStyles.modalButtonSecondary,
                                            textStyle: globalStyles.modalButtonTextSecondary,
                                        },
                                        {
                                            label: 'Close',
                                            onPress: () => {
                                                setShowAlertModal(false)
                                                navigation.goBack()
                                            },
                                        },
                                    ]
                                });
                                setShowAlertModal(true);
                            }
                        } catch (error) {
                            console.error('Error submitting document request:', error);
                            setModalContent({
                                title: 'Error',
                                message: 'An error occurred while submitting the request. Please try again.',
                                buttons: [
                                    {
                                        label: 'Close',
                                        onPress: () => setShowAlertModal(false),
                                    }
                                ]
                            });
                            setShowAlertModal(true);
                        } finally {
                            setIsSubmitting(false);
                        }
                    },
                },
            ]
        });
        setShowAlertModal(true);
    };

    const openFullScreenPicture = (imageUri) => {
        navigation.navigate('Full Screen Picture', { imageUri });
    };
    
    const clearForm = ( modal = false ) => {
        if (!modal) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                recipientResidentID: '',
                recipient: '',
                documentType: '',
                otherDocumentType: '',
                purpose: '',
                otherPurpose: '',
                ValidID: [],
            }));
            setIsSameRecipient(false);
            setTermsDataPrivacyAccepted(false);
            return;
        }

        setModalContent({
            title: 'Confirm Clear Form',
            message: 'Are you sure you want to clear all form data? This action cannot be undone.',
            buttons: [
                { label: 'Cancel', onPress: () => setShowAlertModal(false) },
                {
                    label: 'Clear',
                    onPress: () => {
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            requestedBy: '',
                            requestedByType: 'Resident',
                            recipientResidentID: '',
                            recipient: '',
                            residentName: '',
                            documentType: '',
                            otherDocumentType: '',
                            purpose: '',
                            otherPurpose: '',
                            ValidID: [],
                        }));
                        setIsSameRecipient(false);
                        setTermsDataPrivacyAccepted(false);
                        setShowAlertModal(false);
                    },
                    buttonStyle: globalStyles.modalButtonDanger,
                    textStyle: globalStyles.modalButtonTextDanger,
                },
            ]
        });
        setShowAlertModal(true);
    };

    return (
        <KeyboardAvoidingView behavior={"padding"} style={globalStyles.container}>
            <ScrollView onScroll={handleScroll} contentContainerStyle={globalStyles.scrollViewContainer}>
                <Text style={fontStyles.screenTitle}>Create Document Request</Text>
                <View style={globalStyles.detailCard}>
                    <View style={globalStyles.inputContainer}>
                        {/* Document Type */}
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
                                onBlur={() => setFocusedInput(null)}/>
                            {!formData.documentType && <Text style={globalStyles.errorText}>Required</Text>}
                        </View>
                        
                        {/* Other Document Type */}
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
                                    onBlur={() => setFocusedInput(null)}/>
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
                            {!formData.purpose && <Text style={globalStyles.errorText}>Required</Text>}
                        </View>
                        
                        {/* Other Purpose of Request */}
                        {formData.purpose === 'Others' && ( 
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>
                                    Other Purpose of Request <Text style={globalStyles.translation}>(Ibang Layunin ng Request)</Text>
                                </Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'otherPurpose' && globalStyles.inputBoxFocused]}
                                    placeholder="Other Purpose of Request"
                                    placeholderTextColor={colors.darkgray}
                                    value={formData.otherPurpose}
                                    onChangeText={(value) => setFormData({ ...formData, otherPurpose: value })}
                                    onFocus={() => setFocusedInput('otherPurpose')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                                {!formData.otherPurpose && <Text style={globalStyles.errorText}>Required</Text>}
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
                                                <TouchableOpacity onPress={() => openFullScreenPicture(id.uri)}>
                                                    <Image source={{ uri: id.uri }} style={globalStyles.attachmentsImage} />
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
                        <TermsDataPrivacy
                            termsDataPrivacyAccepted={termsDataPrivacyAccepted}
                            setTermsDataPrivacyAccepted={setTermsDataPrivacyAccepted}
                            setShowTermsModal={setShowTermsModal}
                            setShowDataPrivacyModal={setShowDataPrivacyModal}
                        />
                    </View>
                    <SubmitClearButton onSubmit={handleSubmit} onClear={clearForm} />
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
            <TermsModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} form={'documentRequest'}/>
            <DataPrivacyModal visible={showDataPrivacyModal} onClose={() => setShowDataPrivacyModal(false)} form={'documentRequest'}/>
        </KeyboardAvoidingView>
    )
}

export default CreateDocumentRequest