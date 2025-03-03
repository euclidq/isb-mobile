import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, StatusBar } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import useHandleScroll from '../hooks/useHandleScroll';
import LoadingModal from '../components/LoadingModal';
import AlertModal from '../components/modals/AlertModal';
import TermsModal from '../components/TermsModal';
import DataPrivacyModal from '../components/DataPrivacyModal';
import TermsDataPrivacy from '../components/TermsDataPrivacy';
import SubmitClearButton from '../components/SubmitClearButton';
import { colors, sizes, spacing, globalStyles, fontStyles } from '../styles/theme';

const SignUp = () => {
    const navigation = useNavigation();
    const handleScroll = useHandleScroll(navigation, 'Sign Up');

    const [formData, setFormData] = useState({
        email: '',
        roleinHousehold: '',
        householdID: '',
        householdHead: '',
        reltohouseholdhead: '',
        otherreltohouseholdhead:'',
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: 'N/A',
        otherSuffix: '',
        sex: '',
        birthday: '',
        birthplace: '',
        age: '',
        occupation: '',
        nationality: '',
        religion: '',
        otherReligion: '',
        civilStatus: '',
        contactNumber: '',
        validIDs: '',
        profilepic: '',
        voter: false,
        indigent: false,
        fourpsmember: false,
        outofschoolyouth: false,
        indigenouspeople: false,
        pwd: false,
        pwdid_num: '',
        typeofdisability: '',
        soloparent: false,
        soloparentid_num: '',
        seniorCitizen: false,
        seniorcitizenid_num: '',
        permanentAddress: {
            unitFloorRoomNo: '',
            building: '',
            blockNo: '',
            lotNo: '',
            phaseNo: '',
            houseNo: '',
            street: '',
            subdivision: ''
        },
        presentAddress: {
            unitFloorRoomNo: '',
            building: '',
            blockNo: '',
            lotNo: '',
            phaseNo: '',
            houseNo: '',
            street: '',
            subdivision: '',
            barangay: '',
            city: '',
            province: '',
            region: '',
        },
        philsys_num: '',
        voters_id: '',
        sss_num: '',
        pagibig_num: '',
        philhealth_num: '',
        tin_num: ''
    });

    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedBarangay, setSelectedBarangay] = useState('');

    const [focusedInput, setFocusedInput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSameAddress, setIsSameAddress] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [termsDataPrivacyAccepted, setTermsDataPrivacyAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showDataPrivacyModal, setShowDataPrivacyModal] = useState(false);
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '', buttons: [] });

    const relationships = ["Spouse", "Child", "Sibling", "Parent", "Grandchild", "Grand Parent", "Nephew", "Niece", "Uncle", "Aunt", "Cousin", "Others"];
    const suffixes = ['N/A', 'Jr.', 'Sr.', 'III', 'IV', 'V', 'Others'];    
    const occupationStatuses = ['Employed', 'Unemployed', 'Self-Employed', 'Freelancer', 'Student', 'Retired', 'Homemaker', 'Overseas Filipino Worker (OFW)'];
    const nationalities = [
        'Filipino',
        'Afghan',
        'Albanian',
        'Algerian',
        'Andorran',
        'Angolan',
        'Antiguan and Barbudan',
        'Argentine',
        'Armenian',
        'Australian',
        'Austrian',
        'Azerbaijani',
        'Bahamian',
        'Bahraini',
        'Bangladeshi',
        'Barbadian',
        'Belarusian',
        'Belgian',
        'Belizean',
        'Beninese',
        'Bhutanese',
        'Bolivian',
        'Bosnian',
        'Brazilian',
        'Bulgarian',
        'Burkinabé',
        'Burundian',
        'Cabo Verdean',
        'Cambodian',
        'Cameroonian',
        'Canadian',
        'Central African',
        'Chadian',
        'Chilean',
        'Chinese',
        'Colombian',
        'Comorian',
        'Congolese',
        'Costa Rican',
        'Croatian',
        'Cuban',
        'Cypriot',
        'Czech',
        'Danish',
        'Djiboutian',
        'Dominican',
        'Dutch',
        'East Timorese',
        'Ecuadorean',
        'Egyptian',
        'Salvadoran',
        'Equatorial Guinean',
        'Eritrean',
        'Estonian',
        'Eswatini',
        'Ethiopian',
        'Fijian',
        'Finnish',
        'French',
        'Gabonese',
        'Gambian',
        'Georgian',
        'German',
        'Ghanaian',
        'Greek',
        'Grenadian',
        'Guatemalan',
        'Guinea-Bissauan',
        'Guinean',
        'Guyanese',
        'Haitian',
        'Honduran',
        'Hungarian',
        'Icelandic',
        'Indian',
        'Indonesian',
        'Iranian',
        'Iraqi',
        'Irish',
        'Israeli',
        'Italian',
        'Jamaican',
        'Japanese',
        'Jordanian',
        'Kazakh',
        'Kenyan',
        'Kuwaiti',
        'Kyrgyz',
        'Laotian',
        'Latvian',
        'Lebanese',
        'Liberian',
        'Libyan',
        'Lithuanian',
        'Luxembourger',
        'Malagasy',
        'Malawian',
        'Malaysian',
        'Maldivian',
        'Malian',
        'Maltese',
        'Marshallese',
        'Mauritian',
        'Mexican',
        'Micronesian',
        'Moldovan',
        'Monacan',
        'Mongolian',
        'Moroccan',
        'Mozambican',
        'Namibian',
        'Nauruan',
        'Nepalese',
        'New Zealander',
        'Nicaraguan',
        'Nigerien',
        'Nigerian',
        'North Korean',
        'Norwegian',
        'Omani',
        'Pakistani',
        'Palauan',
        'Panamanian',
        'Papua New Guinean',
        'Paraguayan',
        'Peruvian',
        'Polish',
        'Portuguese',
        'Qatari',
        'Romanian',
        'Russian',
        'Rwandan',
        'Saint Lucian',
        'Saint Vincentian',
        'Salvadoran',
        'Samoan',
        'San Marinese',
        'Saudi Arabian',
        'Senegalese',
        'Serbian',
        'Seychellois',
        'Sierra Leonean',
        'Singaporean',
        'Slovak',
        'Slovenian',
        'Solomon Islander',
        'Somali',
        'South African',
        'South Korean',
        'Spanish',
        'Sri Lankan',
        'Sudanese',
        'Surinamese',
        'Swedish',
        'Swiss',
        'Syrian',
        'Tajik',
        'Tanzanian',
        'Thai',
        'Togolese',
        'Tongan',
        'Trinidadian',
        'Tunisian',
        'Turkish',
        'Turkmen',
        'Ugandan',
        'Ukrainian',
        'Emirati',
        'American',
        'Uruguayan',
        'Uzbek',
        'Venezuelan',
        'Vietnamese',
        'Zambian',
        'Zimbabwean'
    ];
    const religions = [
        'Roman Catholic',
        'Islam',
        'Iglesia ni Cristo',
        'Aglipayan Church',
        'Seventh-day Adventist',
        'Others'
    ];
    const civilStatuses = ['Single', 'Married', 'Separated', 'Widowed', 'Annulled', 'Divorced'];    

    // Fetch Regions on Component Mount
    useEffect(() => {
        axios.get('https://psgc.gitlab.io/api/regions')
        .then(response => {
            setRegions(response.data);
        })
        .catch(error => {
            console.error('Error fetching regions:', error);
        });
    }, []);

    // Fetch Provinces based on selected Region
    useEffect(() => {
        if (selectedRegion) {
        axios.get(`https://psgc.gitlab.io/api/regions/${selectedRegion}/provinces`)
            .then(response => {
            setProvinces(response.data);
            })
            .catch(error => {
            console.error('Error fetching provinces:', error);
            });
        }
    }, [selectedRegion]);

   // Fetch Cities based on selected Province or directly from NCR region
    useEffect(() => {
        if (selectedProvince || selectedRegion === '130000000') {
            // Check if selectedRegion is NCR (130000000)
            if (selectedRegion === '130000000') {
                axios.get(`https://psgc.gitlab.io/api/regions/${selectedRegion}/cities-municipalities`)
                    .then(response => {
                        setCities(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching cities:', error);
                    });
            } else if (selectedProvince) {
                axios.get(`https://psgc.gitlab.io/api/provinces/${selectedProvince}/cities-municipalities`)
                    .then(response => {
                        setCities(response.data);
                    })
                    .catch(error => {
                        console.error('Error fetching cities:', error);
                    });
            }
        }
    }, [selectedProvince, selectedRegion]);

    // Fetch Barangays based on selected City
    useEffect(() => {
        if (selectedCity) {
        axios.get(`https://psgc.gitlab.io/api/cities-municipalities/${selectedCity}/barangays`)
            .then(response => {
            setBarangays(response.data);
            })
            .catch(error => {
            console.error('Error fetching barangays:', error);
            });
        }
    }, [selectedCity]);

    useEffect(() => {
        if (isSameAddress) {
            setFormData((prevFormData) => ({
                ...prevFormData,
                presentAddress: {
                    ...prevFormData.permanentAddress,
                },
            }));
        } else {
            setFormData((prevFormData) => ({
                ...prevFormData,
                presentAddress: {
                    unitFloorRoomNo: '',
                    building: '',
                    blockNo: '',
                    lotNo: '',
                    phaseNo: '',
                    houseNo: '',
                    street: '',
                    subdivision: '',
                },
            }));
        }
    }, [isSameAddress, formData.permanentAddress]);  

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            const age = calculateAge(selectedDate);
            
            setFormData({ 
                ...formData, 
                birthday: formattedDate, 
                age: age, 
                seniorCitizen: age >= 60 ? true : formData.seniorCitizen 
            });
        }
    };

    const calculateAge = (birthDate) => {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    const handleValidIDsUpload = async () => {
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

        const currentAttachments = formData.validIDs || []; 
        const currentTotalSize = currentAttachments.reduce((total, file) => total + (file.size || 0), 0);
    
        setModalContent({
            title: 'Upload Valid IDs',
            message: `Accepted formats: Images (JPG, JPEG, PNG)\nMaximum file size limit: ${MAX_TOTAL_SIZE_MB}MB`,
            buttons: [
                {
                    label: 'Take Photo',
                    onPress: async () => {
                        const pickerResult = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            quality: 1,
                        });
    
                        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
                            const { uri, size } = pickerResult.assets[0];
                            const name = `validID-${Date.now()}.jpg`;
                            const type = 'image/jpeg';
    
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
                                validIDs: [...currentAttachments, { uri, name, type, size }]
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
    
                        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
                            const { uri, size } = pickerResult.assets[0];
                            const name = `validID-${Date.now()}.jpg`;
                            const type = 'image/jpeg';
    
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
                                validIDs: [...currentAttachments, { uri, name, type, size }]
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
                                type: ['image/*'],
                                copyToCacheDirectory: true,
                            });
    
                            if (pickerResult.assets && pickerResult.assets.length > 0) {
                                const { uri, size } = pickerResult.assets[0];
                                const name = `validID-${Date.now()}.jpg`;
                                const type = 'image/jpeg';
    
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
                                    validIDs: [...currentAttachments, { uri, name, type, size }]
                                }));
                            } else if (pickerResult.canceled) {
                                console.log('User canceled document picking');
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
                }
            ]
        });
        setShowAlertModal(true);
    };
    

    const handleProfilePicUpload = async () => {
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
        
        const MAX_FILE_SIZE_MB = 10;
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

        setModalContent({
            title: 'Upload Profile Picture',
            message: `Accepted formats: Images (JPG, JPEG, PNG)\nMaximum file size limit: ${MAX_FILE_SIZE_MB}MB`,
            buttons: [
                {
                    label: 'Take Photo',
                    onPress: async () => {
                        const pickerResult = await ImagePicker.launchCameraAsync({
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 1,
                        });
    
                        if (!pickerResult.canceled) {
                            const { uri, type, size } = pickerResult.assets[0];
    
                            if (size > MAX_FILE_SIZE_BYTES) {
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
                                profilepic: { uri, name: `profilePic-${Date.now()}.jpg`, type: 'image/jpeg' }
                            }));
                        }
                        setShowAlertModal(false)
                    },
                },
                {
                    label: 'Choose from Library',
                    onPress: async () => {
                        const pickerResult = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 1,
                        });
    
                        if (!pickerResult.canceled) {
                            const { uri, type, name, size } = pickerResult.assets[0];
    
                            if (size > MAX_FILE_SIZE_BYTES) {
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
                                profilepic: { uri, name: `profilePic-${Date.now()}.jpg`, type: 'image/jpeg' }
                            }));
                        }
                        setShowAlertModal(false)
                    },
                },
                {
                    label: 'Choose from Files',
                    onPress: async () => {
                        const pickerResult = await DocumentPicker.getDocumentAsync({
                            type: ['image/*'],
                            copyToCacheDirectory: true,
                        });
    
                        if (pickerResult.assets && pickerResult.assets.length > 0) {
                            const { uri, name, mimeType } = pickerResult.assets[0];
                            const type = mimeType || 'application/image';
                            const size = pickerResult.assets[0].size;
    
                            if (size > MAX_FILE_SIZE_BYTES) {
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
                                profilepic: { uri, name, type }
                            }));
                        }
                        setShowAlertModal(false)
                    },
                },
                {
                    label: 'Cancel',
                    onPress: () => setShowAlertModal(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary
                }
            ]
        });
        setShowAlertModal(true);
    };
    
    

    const handleRemoveID = (indexToRemove) => {
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
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            validIDs: prevFormData.validIDs.filter((_, index) => index !== indexToRemove)
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

    const handleRemoveProfilePic = () => {
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
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            profilepic: null
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

    const fetchHouseholdData = async (householdID) => {
        if (!formData.householdID) {
            setModalContent({
                title: 'Error',
                message: 'Please enter a Household ID',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
            });
            setShowAlertModal(true);
            return
        }

        setLoading(true)
        try {
            const response = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/household/${householdID}`);
            if (response.data) {
                const fullName = response.data.householdHeadName;
                const hiddenName = formatNameWithAsterisks(fullName);
    
                setFormData(prevFormData => ({
                    ...prevFormData,
                    householdHead: hiddenName,
                }));
            }
        } catch (error) {
            setModalContent({
                title: 'Error',
                message: 'Please enter a valid Household ID',
                buttons: [
                    {
                        label: 'Close',
                        onPress: () => setShowAlertModal(false)
                    }
                ]
            });
            setShowAlertModal(true);
        } finally {
            setLoading(false)
        }
    };
    
    const formatNameWithAsterisks = (fullName) => {
        const nameParts = fullName.split(' ');

        const formattedName = nameParts.map((name) => {
            if (name.length === 0) return '';
            const firstLetter = name.charAt(0);
            const asterisks = '*'.repeat(name.length - 1);
            return `${firstLetter}${asterisks}`;
        });
    
        return formattedName.join(' ');
    };  

    const handleSubmit = async () => {
        const {
            email, roleinHousehold, householdID, householdHead, reltohouseholdhead, otherreltohouseholdhead,
            lastName, firstName, middleName, suffix, otherSuffix, sex, birthday, birthplace, occupation,
            nationality, religion, otherReligion, civilStatus, contactNumber, voter, indigent, fourpsmember, outofschoolyouth, indigenouspeople, pwd, pwdid_num, typeofdisability, soloparent, soloparentid_num, seniorCitizen, seniorcitizenid_num, 
            permanentAddress, presentAddress, validIDs, profilepic, philsys_num, voters_id, sss_num, pagibig_num, philhealth_num, tin_num
        } = formData;
    
        const requiredFields = [
            { field: roleinHousehold, label: 'Household Role' },
            { field: lastName, label: 'Last Name' },
            { field: firstName, label: 'First Name' },
            { field: sex, label: 'Sex' },
            { field: birthday, label: 'Birthdate' },
            { field: birthplace, label: 'Birthplace' },
            { field: occupation, label: 'Occupation' },
            { field: nationality, label: 'Nationality' },
            { field: religion, label: 'Religion' },
            { field: civilStatus, label: 'Civil Status' },
            { field: email, label: 'Email Address' },
            { field: contactNumber, label: 'Contact Number' },
            { field: permanentAddress?.houseNo, label: 'Permanent Address: House No.' },
            { field: permanentAddress?.street, label: 'Permanent Address: Street' },
        ];

        if (roleinHousehold === 'Household Member' && householdID === '' && householdHead === '') {
            requiredFields.push({ field: householdID, label: 'Household ID' });
        }
    
        if (reltohouseholdhead === 'Others') {
            requiredFields.push({ field: otherreltohouseholdhead, label: 'Other Relationship to Household Head' });
        }
    
        if (suffix === 'Others') {
            requiredFields.push({ field: otherSuffix, label: 'Other Suffix' });
        }
    
        if (religion === 'Others') {
            requiredFields.push({ field: otherReligion, label: 'Other Religion' });
        }
    
        if (pwd) {
            requiredFields.push({ field: pwdid_num, label: 'PWD ID Number' });
            requiredFields.push({ field: typeofdisability, label: 'Type of Disability' });
        }
    
        if (soloparent) {
            requiredFields.push({ field: soloparentid_num, label: 'Solo Parent ID Number' });
        }
    
        if (seniorCitizen) {
            requiredFields.push({ field: seniorcitizenid_num, label: 'Senior Citizen ID Number' });
        }
    
        if (!isSameAddress) {
            requiredFields.push(
                { field: presentAddress?.region, label: 'Present Address: Region' },
                ...(selectedRegion !== '130000000' ? [{ field: presentAddress?.province, label: 'Present Address: Province' }] : []),
                { field: presentAddress?.city, label: 'Present Address: City' },
                { field: presentAddress?.barangay, label: 'Present Address: Barangay' },
                { field: presentAddress?.houseNo, label: 'Present Address: House No.' },
                { field: presentAddress?.street, label: 'Present Address: Street' },
            );
        }
    
        if (!Array.isArray(validIDs) || validIDs.length === 0) {
            requiredFields.push({ field: validIDs, label: 'Valid IDs' });
        }
    
        if (!profilepic || !profilepic.uri) {
            requiredFields.push({ field: profilepic, label: 'Profile Picture' });
        }
    
        if (!termsDataPrivacyAccepted) {
            requiredFields.push({ field: termsDataPrivacyAccepted, label: 'You must agree to the Terms and Conditions and Data Privacy Agreement' });
        }
    
        const missingFields = requiredFields
            .filter(({ field }) => !field)
            .map(({ label }) => `- ${label}`);
    
        const invalidLetterFields = [
            { field: firstName, label: 'First Name' },
            { field: middleName, label: 'Middle Name' },
            { field: lastName, label: 'Last Name' },
            { field: otherSuffix, label: 'Other Suffix' },
            { field: birthplace, label: 'Birthplace' }
        ].filter(({ field }) => field && /\d/.test(field))
          .map(({ label }) => `- ${label}`);
    
        const nonNumericFields = [
            { field: pwdid_num, label: 'PWD ID Number' },
            { field: soloparentid_num, label: 'Solo Parent ID Number' },
            { field: seniorcitizenid_num, label: 'Senior Citizen ID Number' }
        ].filter(({ field }) => field && /\D/.test(field))
          .map(({ label }) => `- ${label}`);
    
        const emailValidation = email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ? '- Please enter a valid email address'
            : null;
    
        const contactNumberValidation = contactNumber !== '' && !/^09\d{9}$/.test(contactNumber)
            ? '- Contact Number must be 11 digits and start with 09'
            : null;
    
        // Combine all validation errors into sections
        const validationMessages = [];
    
        if (missingFields.length > 0) {
            validationMessages.push(`The following fields are required:\n${missingFields.join('\n')}`);
        }
    
        if (invalidLetterFields.length > 0) {
            validationMessages.push(`The following fields should only contain letters:\n${invalidLetterFields.join('\n')}`);
        }
    
        if (nonNumericFields.length > 0) {
            validationMessages.push(`The following fields should only contain numbers:\n${nonNumericFields.join('\n')}`);
        }
    
        if (emailValidation) {
            validationMessages.push(emailValidation);
        }
    
        if (contactNumberValidation) {
            validationMessages.push(contactNumberValidation);
        }
    
        // Show modal if there are any validation messages
        if (validationMessages.length > 0) {
            setModalContent({
                title: 'Validation Errors',
                message: validationMessages.join('\n\n'),
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
            message: 'Are you sure you want to submit?\n\nOnce your data is processed, you won’t be able to make any changes unless you request it from the barangay.',
            buttons: [
                {
                    label: "Cancel",
                    onPress: () => setIsSubmitting(false),
                    buttonStyle: globalStyles.modalButtonSecondary,
                    textStyle: globalStyles.modalButtonTextSecondary
                },
                {
                    label: "Submit",
                    onPress: async () => {
                        setIsSubmitting(true);
    
                        const formDataToSend = new FormData();
                        formDataToSend.append('email', email);
                        formDataToSend.append('roleinHousehold', roleinHousehold);
                        formDataToSend.append('householdID', householdID);
                        formDataToSend.append('householdHead', householdHead);
                        formDataToSend.append('reltohouseholdhead', reltohouseholdhead === 'Others' ? otherreltohouseholdhead : reltohouseholdhead);
                        formDataToSend.append('lastName', lastName);
                        formDataToSend.append('firstName', firstName);
                        formDataToSend.append('middleName', middleName || '');
                        if (suffix !== 'N/A') {formDataToSend.append('suffix', suffix === 'Others' ? otherSuffix : suffix);}
                        formDataToSend.append('sex', sex);
                        formDataToSend.append('birthday', birthday);
                        formDataToSend.append('birthplace', birthplace);
                        formDataToSend.append('occupation', occupation);
                        formDataToSend.append('nationality', nationality);
                        formDataToSend.append('religion', religion === 'Others' ? otherReligion : religion);
                        formDataToSend.append('civilStatus', civilStatus);
                        formDataToSend.append('contactNumber', contactNumber);
                        formDataToSend.append('voter', voter);
                        formDataToSend.append('indigent', indigent);
                        formDataToSend.append('fourpsmember', fourpsmember);
                        formDataToSend.append('outofschoolyouth', outofschoolyouth);
                        formDataToSend.append('indigenouspeople', indigenouspeople);
                        formDataToSend.append('pwd', pwd);
                        formDataToSend.append('pwdid_num', pwdid_num);
                        formDataToSend.append('typeofdisability', typeofdisability);
                        formDataToSend.append('soloparent', soloparent);
                        formDataToSend.append('soloparentid_num', soloparentid_num);
                        formDataToSend.append('seniorCitizen', seniorCitizen);
                        formDataToSend.append('seniorcitizenid_num', seniorcitizenid_num);
                        formDataToSend.append('philsys_num', philsys_num);
                        formDataToSend.append('voters_id', voters_id);
                        formDataToSend.append('sss_num', sss_num);
                        formDataToSend.append('pagibig_num', pagibig_num);
                        formDataToSend.append('philhealth_num', philhealth_num);
                        formDataToSend.append('tin_num', tin_num);
    
                        Object.keys(permanentAddress || {}).forEach(key => {
                            if (permanentAddress[key]) {
                                formDataToSend.append(`permanentAddress[${key}]`, permanentAddress[key]);
                            }
                        });
    
                        if (presentAddress) {
                            Object.keys(presentAddress || {}).forEach(key => {
                                if (presentAddress[key]) {
                                    formDataToSend.append(`presentAddress[${key}]`, presentAddress[key]);
                                }
                            });
                        }
    
                        validIDs.forEach((file, index) => {
                            formDataToSend.append('validIDs', {
                                uri: file.uri,
                                name: `validID-${index}-${Date.now()}.jpg`,
                                type: 'image/jpeg',
                            });
                        });
    
                        formDataToSend.append('profilepic', {
                            uri: profilepic.uri,
                            name: `profilePic-${Date.now()}.jpg`,
                            type: 'image/jpeg',
                        });
                        
                        // Fetch all residents to check for duplicates
                        try {
                            const residentsResponse = await axios.get(`${process.env.EXPO_PUBLIC_API_BASE_URL}/residents`);
                            const residents = residentsResponse.data.residents;

                            // Convert user-entered birthday to a comparable format (YYYY-MM-DD)
                            const formattedBirthday = new Date(formData.birthday).toISOString().split('T')[0];

                            // Check if a resident with the same first name, last name, and birthday exists
                            const duplicateResident = residents.find(
                                (resident) =>
                                    resident.firstName.toLowerCase().trim() === formData.firstName.toLowerCase().trim() &&
                                    resident.lastName.toLowerCase().trim() === formData.lastName.toLowerCase().trim() &&
                                    new Date(resident.birthday).toISOString().split('T')[0] === formattedBirthday
                            );

                            if (duplicateResident) {
                                setModalContent({
                                    title: 'Duplicate Record Found',
                                    message: `A resident with the same name and birthdate already exists in the system. Please visit the barangay and bring two valid IDs or a birth certificate for verification.`,
                                    buttons: [
                                        {
                                            label: 'Close',
                                            onPress: () => setShowAlertModal(false),
                                        },
                                    ],
                                });
                                setShowAlertModal(true);
                                return; // Stop execution if a duplicate is found
                            }
                        } catch (error) {
                            console.error('Error fetching residents:', error);
                            setModalContent({
                                title: 'Duplicate Record Found',
                                message: `A resident with the same name and birthdate already exists in the system. Please visit the barangay and bring two valid IDs or a birth certificate for verification.`,
                                buttons: [
                                    {
                                        label: 'Close',
                                        onPress: () => setShowAlertModal(false),
                                    },
                                ],
                            });
                            setShowAlertModal(true);
                            return; // Stop execution if there's an error fetching residents
                        } finally {
                            setIsSubmitting(false);
                        }

                        try {
                            const response = await axios.post(`${process.env.EXPO_PUBLIC_API_BASE_URL}/new/resident`, formDataToSend, {
                                headers: {
                                    'Content-Type': 'multipart/form-data',
                                },
                            });
    
                            if (response.status === 201) {
                                const newResident = response.data.newResident;
                                const { email } = newResident;
    
                                const currentYear = new Date().getFullYear();
                                const lastName = formData.lastName?.toLowerCase() || ''; 
                                const firstLetterOfFirstName = formData.firstName ? formData.firstName[0].toLowerCase() : ''; 
                                const firstLetterOfMiddleName = formData.middleName ? formData.middleName[0].toLowerCase() : ''; 
                                const password = `${currentYear}${lastName}${firstLetterOfFirstName}${firstLetterOfMiddleName || ''}`;
                                
                                setModalContent({
                                    title: 'Sign Up Successful',
                                    message: `Check your inbox to verify your account.\n\nAfter verification, you can now login using the following credentials:\n\nEmail: ${email}\nPassword: ${password}`,
                                    buttons: [
                                        {
                                            label: 'Close',
                                            onPress: () => {
                                                clearForm();
                                                navigation.goBack();
                                            },
                                        },
                                    ],
                                });
                                setShowAlertModal(true);
                            }
                        } catch (error) {
                            console.error('Error submitting form:', error);
                            if (error.response.status === 400) {
                                setModalContent({
                                    title: 'Error',
                                    message: error.response.data.message,
                                    buttons: [
                                        {
                                            label: 'Close',
                                            onPress: () => setShowAlertModal(false),
                                        },
                                    ],
                                });
                                setShowAlertModal(true);
                            }
                        } finally {
                            setIsSubmitting(false);
                        }
                    },
                },
            ],
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
                            email: '',
                            roleinHousehold: '',
                            householdID: '',
                            householdHead: '',
                            reltohouseholdhead: '',
                            otherreltohouseholdhead:'',
                            lastName: '',
                            firstName: '',
                            middleName: '',
                            suffix: '',
                            sex: '',
                            birthday: '',
                            birthplace: '',
                            age: '',
                            occupation: '',
                            nationality: '',
                            religion: '',
                            civilStatus: '',
                            contactNumber: '',
                            profilepic: '',
                            validIDs: '',
                            voter: false,
                            indigent: false,
                            fourpsmember: false,
                            pwd: false,
                            soloparent: false,
                            seniorCitizen: false,
                            pwdid_num: '',
                            soloparentid_num: '',
                            seniorcitizenid_num: '',
                            presentAddress: {
                                unitFloorRoomNo: '',
                                building: '',
                                blockNo: '',
                                lotNo: '',
                                phaseNo: '',
                                houseNo: '',
                                street: '',
                                subdivision: '',
                                barangay: '',
                                city: '',
                                province: '',
                                region: '',
                            },
                            permanentAddress: {
                                unitFloorRoomNo: '',
                                building: '',
                                blockNo: '',
                                lotNo: '',
                                phaseNo: '',
                                houseNo: '',
                                street: '',
                                subdivision: ''
                            },
                            philsys_num: '',
                            voters_id: '',
                            sss_num: '',
                            pagibig_num: '',
                            philhealth_num: '',
                            tin_num: ''
                        });
                        setSelectedRegion('');
                        setSelectedProvince('');
                        setSelectedCity('');
                        setSelectedBarangay('');
                        setIsSameAddress(false);
                        setShowAlertModal(false);
                    },
                    buttonStyle: globalStyles.modalButtonDanger,
                    textStyle: globalStyles.modalButtonTextDanger
                }
            ]
        });
        setShowAlertModal(true);
    }

    return (
        <KeyboardAvoidingView behavior={"padding"} style={globalStyles.container}>
            <ScrollView onScroll={handleScroll} contentContainerStyle={globalStyles.scrollViewContainer}>
                <Text style={fontStyles.screenTitle}>Sign Up</Text>

                <View style={{gap: spacing.m}}>
                    {/* Household Information */}
                    <View style={globalStyles.detailCard}>
                        <View style={globalStyles.inputContainer}>
                            <Text style={fontStyles.h3}>Household Information</Text>
                            {/* Household Role */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Household Role {!formData.roleinHousehold && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <Dropdown
                                    label="Household Role"
                                    style={[globalStyles.inputBox, focusedInput === 'roleinHousehold' && globalStyles.inputBoxFocused]}
                                    placeholderStyle={globalStyles.inputBoxPlaceholder}
                                    selectedTextStyle={fontStyles.body}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Household Role"
                                    data={[
                                        { label: 'Household Head', value: 'Household Head' },
                                        { label: 'Household Member', value: 'Household Member' }
                                    ]}
                                    value={formData.roleinHousehold}
                                    onChange={(item) => {
                                        const selectedValue = item.value;
                                        if (selectedValue !== '') {
                                        if (selectedValue === 'Household Head') {
                                            setFormData({
                                            ...formData,
                                            roleinHousehold: selectedValue,
                                            householdID: '',
                                            householdHead: '',
                                            reltohouseholdhead: '',
                                            });
                                        } else {
                                            setFormData({ ...formData, roleinHousehold: selectedValue });
                                        }
                                        }
                                    }}
                                    onFocus={() => setFocusedInput('roleinHousehold')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            {/* Household ID */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Household ID {!formData.householdID && formData.roleinHousehold === 'Household Member' && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <View style={{ flexDirection: 'row', gap: spacing.m }}>
                                    <TextInput
                                        style={[ 
                                            { flex: 1 },
                                            globalStyles.inputBox,
                                            formData.roleinHousehold !== 'Household Member' && globalStyles.inputBoxDisabled,
                                            focusedInput === 'householdID' && globalStyles.inputBoxFocused,
                                        ]}
                                        value={formData.householdID}
                                        placeholder='Household ID'
                                        placeholderTextColor={colors.darkgray}
                                        onChangeText={(value) => {
                                            setFormData({ ...formData, householdID: value });
                                        }}
                                        editable={formData.roleinHousehold === 'Household Member' && formData.roleinHousehold !== ''}
                                        onFocus={() => setFocusedInput('householdID')}
                                        onBlur={() => setFocusedInput(null)}/>
                                    <TouchableOpacity 
                                        onPress={() => fetchHouseholdData(formData.householdID)} 
                                        style={globalStyles.responsiveButton}>
                                        <Text style={globalStyles.buttonText}>Enter</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            
                            {/* Household Head */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Household Head {(formData.roleinHousehold === "Household Member" && !formData.householdHead) && <Text style={globalStyles.errorText}>(Required)</Text>}
                                </Text>
                                <TextInput
                                    style={[
                                        globalStyles.inputBox,
                                        (formData.roleinHousehold === 'Household Head' || formData.householdHead === '') && globalStyles.inputBoxDisabled
                                    ]}
                                    onChangeText={(value) => {
                                        setFormData({ ...formData, householdID: value });
                            
                                        if (value) {
                                            fetchHouseholdData(value).then(matched => {
                                                if (!matched) {
                                                    setFormData({ ...formData, householdHead: '' });
                                                }
                                            });
                                        }
                                    }}
                                    value={formData.householdHead}
                                    editable={false}/>
                            </View>
                            
                            {/* Relationship to Household Head */}
                            <View style={[globalStyles.inputWrapper, formData.reltohouseholdhead !== 'Others' && {marginBottom: 0}]}>
                                <Text style={fontStyles.body}>Relationship to Household Head {(formData.roleinHousehold === 'Household Member' && !formData.reltohouseholdhead) && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <Dropdown
                                    label="Relationship to Household Head"
                                    style={[
                                        globalStyles.inputBox,
                                        (formData.roleinHousehold === 'Household Head' || formData.householdID === '' || formData.householdHead === '') && globalStyles.inputBoxDisabled,
                                        focusedInput === 'reltohouseholdhead' && globalStyles.inputBoxFocused
                                    ]}
                                    placeholderStyle={globalStyles.inputBoxPlaceholder}
                                    selectedTextStyle={fontStyles.body}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Relationship to Household Head"
                                    disable={formData.roleinHousehold === 'Household Head' || formData.householdHead === '' }
                                    data={relationships.map((relationship) => ({ label: relationship, value: relationship }))}
                                    value={formData.reltohouseholdhead}
                                    onChange={(item) => {
                                        const selectedValue = item.value;
                                        if (selectedValue !== '') {
                                            setFormData({ ...formData, reltohouseholdhead: selectedValue });
                                        }}
                                    }
                                    onFocus={() => setFocusedInput('reltohouseholdhead')}
                                    onBlur={() => setFocusedInput(null)}/>
                            </View>

                            {/* Other Relationship */}
                            {formData.reltohouseholdhead === 'Others' &&
                                <View style={[globalStyles.inputWrapper, {marginBottom: 0}]}>
                                    <Text style={fontStyles.body}>
                                        Other Relationship to Household Head {!formData.otherreltohouseholdhead && <Text style={globalStyles.errorText}>(Required)</Text>}
                                    </Text>
                                    <TextInput
                                        style={[globalStyles.inputBox, focusedInput === 'otherreltohouseholdhead' && globalStyles.inputBoxFocused]}
                                        value={formData.otherreltohouseholdhead}
                                        placeholder='Other Relationship to Household Head'
                                        placeholderTextColor={colors.darkgray}
                                        onChangeText={(value) => setFormData({ ...formData, otherreltohouseholdhead: value })}
                                        onFocus={() => setFocusedInput('otherreltohouseholdhead')}
                                        onBlur={() =>setFocusedInput(null)}/>
                                </View>
                            }
                        </View>
                    </View>
                    
                    {/* Personal Information */}
                    <View style={globalStyles.detailCard}>
                        <View style={globalStyles.inputContainer}>
                            <Text style={fontStyles.h3}>Personal Information</Text>
                            {/* First Name */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>First Name {!formData.firstName && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'firstName' && globalStyles.inputBoxFocused]}
                                    value={formData.firstName}
                                    placeholder='First Name'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, firstName: value })}
                                    onFocus={() => setFocusedInput('firstName')}
                                    onBlur={() =>setFocusedInput(null)}
                                />

                                {formData.firstName !== '' && /\d/.test(formData.firstName) && (
                                    <Text style={globalStyles.errorText}>Please enter a valid first name</Text>
                                )}
                            </View>
                            
                            {/* Middle Name */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Middle Name (Leave blank if none)</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'middleName' && globalStyles.inputBoxFocused]}
                                    value={formData.middleName}
                                    placeholder='Middle Name'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, middleName: value })}
                                    onFocus={() => setFocusedInput('middleName')}
                                    onBlur={() =>setFocusedInput(null)}
                                />

                                {formData.middleName !== '' && /\d/.test(formData.middleName) && (
                                    <Text style={globalStyles.errorText}>Please enter a valid middle name</Text>
                                )}
                            </View>

                            {/* Last Name */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Last Name {!formData.lastName && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'lastName' && globalStyles.inputBoxFocused]}
                                    value={formData.lastName}
                                    placeholder='Last Name'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, lastName: value })}
                                    onFocus={() => setFocusedInput('lastName')}
                                    onBlur={() =>setFocusedInput(null)}
                                />

                                {formData.lastName !== '' && /\d/.test(formData.lastName) && (
                                    <Text style={globalStyles.errorText}>Please enter a valid last name</Text>
                                )}
                            </View>

                            {/* Suffix */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Suffix (Optional)</Text>
                                <Dropdown
                                    label="Suffix"
                                    style={[globalStyles.inputBox, focusedInput === 'suffix' && globalStyles.inputBoxFocused]}
                                    placeholderStyle={globalStyles.inputBoxPlaceholder}
                                    selectedTextStyle={fontStyles.body}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Suffix"
                                    data={suffixes.map((suffix) => ({ label: suffix, value: suffix }))}
                                    value={formData.suffix}
                                    onChange={(item) => {
                                        const selectedValue = item.value;
                                        if (selectedValue !== '') {
                                            setFormData({ ...formData, suffix: selectedValue });
                                        }
                                    }}
                                    onFocus={() => setFocusedInput('suffix')}
                                    onBlur={() =>setFocusedInput(null)}
                                />
                            </View>
                            
                            {/* Other Suffix */}
                            {formData.suffix === 'Others' &&
                                <View style={globalStyles.inputWrapper}>
                                    <Text style={fontStyles.body}>Other Suffix {!formData.otherSuffix && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                    <TextInput
                                        style={[globalStyles.inputBox, focusedInput === 'otherSuffix' && globalStyles.inputBoxFocused]}
                                        value={formData.otherSuffix}
                                        placeholder='Other Suffix'
                                        placeholderTextColor={colors.darkgray}
                                        onChangeText={(value) => setFormData({ ...formData, otherSuffix: value })}
                                        onFocus={() => setFocusedInput('otherSuffix')}
                                        onBlur={() =>setFocusedInput(null)}
                                    />

                                    {formData.otherSuffix !== '' && /\d/.test(formData.otherSuffix) && (
                                        <Text style={globalStyles.errorText}>Please enter a valid suffix</Text>
                                    )}
                                </View>
                            }

                            {/* Sex */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Sex {!formData.sex && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <Dropdown
                                    label="Sex"
                                    style={[globalStyles.inputBox, focusedInput === 'sex' && globalStyles.inputBoxFocused]}
                                    placeholderStyle={globalStyles.inputBoxPlaceholder}
                                    selectedTextStyle={fontStyles.body}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Sex"
                                    data={[
                                        { label:'Male', value: 'Male' },
                                        { label:'Female', value: 'Female' },
                                    ]}
                                    value={formData.sex}
                                    onChange={(item) => {
                                        const selectedValue = item.value;
                                        if (selectedValue !== '') {
                                            setFormData({ ...formData, sex: selectedValue });
                                        }
                                    }}
                                    onFocus={() => setFocusedInput('sex')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            {/* Birthdate */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Birthdate {!formData.birthday && (<Text style={globalStyles.errorText}>(Required)</Text>)}</Text>
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                    style={globalStyles.buttonSecondary}>
                                    <View style={{flexDirection: 'row', gap: 10}}>
                                        <MaterialCommunityIcons name="calendar" size={24} color={colors.primary} />
                                        {formData.birthday ? (
                                            <Text style={globalStyles.buttonSecondaryText}>{formData.birthday}</Text>
                                        ) : (
                                            <Text style={globalStyles.buttonSecondaryText}>Select Birthdate</Text>
                                        )}
                                        </View>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                    value={new Date(formData.birthday || Date.now())}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                    minimumDate={new Date(1900, 0, 1)}
                                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 15))}
                                    />)}
                            </View>

                            {/* Age */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Age</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, globalStyles.inputBoxDisabled]}
                                    value={formData.age.toString()}
                                    editable={false}/>
                            </View>

                            {/* Birthplace */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Birthplace {!formData.birthplace && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'birthplace' && globalStyles.inputBoxFocused]}
                                    value={formData.birthplace}
                                    placeholder='Birthplace'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, birthplace: value })}
                                    onFocus={() => setFocusedInput('birthplace')}
                                    onBlur={() =>setFocusedInput(null)}
                                />

                                {formData.birthplace !== '' && /\d/.test(formData.birthplace) && (
                                    <Text style={globalStyles.errorText}>Please enter a valid birthplace</Text>
                                )}
                            </View>

                            {/* Occupation */}
                            <View style={globalStyles.inputWrapper}>
                            <Text style={fontStyles.body}>Occupation {!formData.occupation && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <Dropdown
                                    label="Occupation"
                                    style={[globalStyles.inputBox, focusedInput === 'occupation' && globalStyles.inputBoxFocused]}
                                    placeholderStyle={globalStyles.inputBoxPlaceholder}
                                    selectedTextStyle={fontStyles.body}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Occupation"
                                    data={occupationStatuses.map((occupation) => ({ label: occupation, value: occupation }))}
                                    value={formData.occupation}
                                    onChange={(item) => {
                                        const selectedValue = item.value;
                                        if (selectedValue !== '') {
                                            setFormData({ ...formData, occupation: selectedValue });
                                        }
                                    }}
                                    onFocus={() => setFocusedInput('occupation')}
                                    onBlur={() =>setFocusedInput(null)}
                                />
                            </View>

                            {/* Nationality */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Nationality {!formData.nationality && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <Dropdown
                                    label="Nationality"
                                    style={[globalStyles.inputBox, focusedInput === 'nationality' && globalStyles.inputBoxFocused]}
                                    placeholderStyle={globalStyles.inputBoxPlaceholder}
                                    selectedTextStyle={fontStyles.body}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Nationality"
                                    data={nationalities.map((nationality) => ({ label: nationality, value: nationality }))}
                                    value={formData.nationality}
                                    onChange={(item) => {
                                        const selectedValue = item.value;
                                        if (selectedValue !== '') {
                                            setFormData({ ...formData, nationality: selectedValue });
                                        }
                                    }}
                                    onFocus={() => setFocusedInput('nationality')}
                                    onBlur={() =>setFocusedInput(null)}
                                />
                            </View>
                            
                            {/* Religion */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Religion {!formData.religion && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <Dropdown
                                    label="Religion"
                                    style={[globalStyles.inputBox, focusedInput === 'religion' && globalStyles.inputBoxFocused]}
                                    placeholderStyle={globalStyles.inputBoxPlaceholder}
                                    selectedTextStyle={fontStyles.body}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Religion"
                                    data={religions.map((religion) => ({ label: religion, value: religion }))}
                                    value={formData.religion}
                                    onChange={(item) => {
                                        const selectedValue = item.value;
                                        if (selectedValue !== '') {
                                            setFormData({ ...formData, religion: selectedValue });
                                        }
                                    }}
                                    onFocus={() => setFocusedInput('religion')}
                                    onBlur={() =>setFocusedInput(null)}
                                />
                            </View>

                            {/* Other Religion */}
                            {formData.religion === 'Others' &&
                                <View style={globalStyles.inputWrapper}>
                                    <Text style={fontStyles.body}>Other Religion {!formData.otherReligion && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                    <TextInput
                                        style={[globalStyles.inputBox, focusedInput === 'otherReligion' && globalStyles.inputBoxFocused]}
                                        value={formData.otherReligion}
                                        placeholder='Other Religion'
                                        placeholderTextColor={colors.darkgray}
                                        onChangeText={(value) => setFormData({ ...formData, otherReligion: value })}
                                        onFocus={() => setFocusedInput('otherReligion')}
                                        onBlur={() =>setFocusedInput(null)}
                                    />

                                    {formData.otherReligion !== '' && /\d/.test(formData.otherReligion) && (
                                        <Text style={globalStyles.errorText}>Please enter a valid religion</Text>
                                    )}
                                </View>
                            }

                            {/* Civil Status */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Civil Status {!formData.civilStatus && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <Dropdown
                                    label="Civil Status"
                                    style={[globalStyles.inputBox, focusedInput === 'civilStatus' && globalStyles.inputBoxFocused]}
                                    placeholderStyle={globalStyles.inputBoxPlaceholder}
                                    selectedTextStyle={fontStyles.body}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Civil Status"
                                    data={civilStatuses.map((civilStatus) => ({ label: civilStatus, value: civilStatus }))}
                                    value={formData.civilStatus}
                                    onChange={(item) => {
                                        const selectedValue = item.value;
                                        if (selectedValue !== '') {
                                            setFormData({ ...formData, civilStatus: selectedValue });
                                        }
                                    }}
                                    onFocus={() => setFocusedInput('civilStatus')}
                                    onBlur={() =>setFocusedInput(null)}
                                />
                            </View>

                            {/* Email Address */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Email Address {!formData.email && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'email' && globalStyles.inputBoxFocused]}
                                    value={formData.email}
                                    placeholder='Email Address'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, email: value })}
                                    keyboardType="email-address" // Optional: sets the correct keyboard type
                                    onFocus={() => setFocusedInput('email')}
                                    onBlur={() =>setFocusedInput(null)}/>

                                {formData.email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && ( 
                                    <Text style={globalStyles.errorText}>Please enter a valid email address</Text>
                                )}
                            </View>

                            {/* Contact Number */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>11-Digit Contact Number {!formData.contactNumber && (<Text style={globalStyles.errorText}>(Required)</Text>)}</Text>
                                <TextInput
                                    style={[globalStyles.inputBox,, focusedInput === 'contactNumber' && globalStyles.inputBoxFocused]}
                                    value={formData.contactNumber}
                                    placeholder='Contact Number'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, contactNumber: value })}
                                    keyboardType="numeric"
                                    onFocus={() => setFocusedInput('contactNumber')}
                                    onBlur={() =>setFocusedInput(null)}/>

                                {formData.contactNumber !== '' && !/^09\d{9}$/.test(formData.contactNumber) && (
                                    <Text style={globalStyles.errorText}>Contact Number must be 11 digits and start with 09</Text>
                                )}
                            </View>

                            {/* Checkboxes */}
                            <View>
                                <View style={globalStyles.inputWrapper}>
                                    <TouchableOpacity 
                                        style={globalStyles.checkboxWrapper} 
                                        onPress={() => setFormData({ ...formData, voter: !formData.voter })}>
                                        <View style={[globalStyles.checkboxUnchecked, formData.voter && globalStyles.checkboxChecked]} />
                                        <Text style={fontStyles.body}>Voter</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={globalStyles.inputWrapper}>
                                    <TouchableOpacity 
                                        style={globalStyles.checkboxWrapper} 
                                        onPress={() => setFormData({ ...formData, indigent: !formData.indigent })}>
                                        <View style={[globalStyles.checkboxUnchecked, formData.indigent && globalStyles.checkboxChecked]} />
                                        <Text style={fontStyles.body}>Indigent</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={globalStyles.inputWrapper}>
                                    <TouchableOpacity 
                                        style={globalStyles.checkboxWrapper} 
                                        onPress={() => setFormData({ ...formData, fourpsmember: !formData.fourpsmember })}>
                                        <View style={[globalStyles.checkboxUnchecked, formData.fourpsmember && globalStyles.checkboxChecked]} />
                                        <Text style={fontStyles.body}>4Ps Member</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={globalStyles.inputWrapper}>
                                    <TouchableOpacity
                                        style={globalStyles.checkboxWrapper}
                                        onPress={() => setFormData({ ...formData, outofschoolchildren: !formData.outofschoolchildren })}
                                        disabled={true}>
                                        <View style={[globalStyles.checkboxUnchecked, formData.outofschoolchildren && globalStyles.checkboxChecked]} />
                                        <Text style={fontStyles.body}>Out-of-School Children</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={globalStyles.inputWrapper}>
                                    <TouchableOpacity
                                        style={globalStyles.checkboxWrapper}
                                        onPress={() => setFormData({ ...formData, outofschoolyouth: !formData.outofschoolyouth })}
                                        disabled={formData.age < 15 || formData.age > 24}>
                                        <View style={[globalStyles.checkboxUnchecked, formData.outofschoolyouth && globalStyles.checkboxChecked]} />
                                        <Text style={fontStyles.body}>Out-of-School Youth</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={globalStyles.inputWrapper}>
                                    <TouchableOpacity
                                        style={globalStyles.checkboxWrapper}
                                        onPress={() => setFormData({ ...formData, indigenouspeople: !formData.indigenouspeople })}>
                                        <View style={[globalStyles.checkboxUnchecked, formData.indigenouspeople && globalStyles.checkboxChecked]} />
                                        <Text style={fontStyles.body}>Indigenous People</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={globalStyles.inputWrapper}>
                                    <TouchableOpacity 
                                        style={globalStyles.checkboxWrapper} 
                                        onPress={() => setFormData({ ...formData, pwd: !formData.pwd })}>
                                        <View style={[globalStyles.checkboxUnchecked, formData.pwd && globalStyles.checkboxChecked]} />
                                        <Text style={fontStyles.body}>PWD</Text>
                                    </TouchableOpacity>
                                </View>

                                {formData.pwd && (
                                    <>
                                        <View style={globalStyles.inputWrapper}>
                                            <Text style={fontStyles.body}>PWD ID Number {formData.pwd && !formData.pwdid_num && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                            <TextInput
                                                style={[globalStyles.inputBox, focusedInput === 'pwdid_num' && globalStyles.inputBoxFocused]}
                                                value={formData.pwdid_num}
                                                placeholder='PWD ID Number'
                                                placeholderTextColor={colors.darkgray}
                                                onChangeText={(value) => setFormData({ ...formData, pwdid_num: value })}
                                                onFocus={() => setFocusedInput('pwdid_num')}
                                                onBlur={() =>setFocusedInput(null)}
                                            />

                                        {formData.pwdid_num !== '' && !/^\d+$/.test(formData.pwdid_num) && (
                                            <Text style={globalStyles.errorText}>Please enter a valid PWD ID Number</Text>
                                        )}
                                        </View>
                                        <View style={globalStyles.inputWrapper}>
                                            <Text style={fontStyles.body}>Type of Disability {formData.pwd && !formData.typeofdisability && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                            <TextInput
                                                style={[globalStyles.inputBox, focusedInput === 'typeofdisability' && globalStyles.inputBoxFocused]}
                                                value={formData.typeofdisability}
                                                placeholder='Type of Disability'
                                                placeholderTextColor={colors.darkgray}
                                                onChangeText={(value) => setFormData({ ...formData, typeofdisability: value })}
                                                onFocus={() => setFocusedInput('typeofdisability')}
                                                onBlur={() =>setFocusedInput(null)}
                                            />

                                            {formData.typeofdisability !== '' && /\d/.test(formData.typeofdisability) && (
                                                <Text style={globalStyles.errorText}>Please enter a valid type of disability</Text>
                                            )}
                                        </View>
                                    </>
                                )}

                                <View style={globalStyles.inputWrapper}>
                                    <TouchableOpacity 
                                        style={globalStyles.checkboxWrapper} 
                                        onPress={() => setFormData({ ...formData, soloparent: !formData.soloparent })}>
                                        <View style={[globalStyles.checkboxUnchecked, formData.soloparent && globalStyles.checkboxChecked]} />
                                        <Text style={fontStyles.body}>Solo Parent</Text>
                                    </TouchableOpacity>
                                </View>

                                {formData.soloparent && (
                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>Solo Parent ID Number {formData.soloparent && !formData.soloparentid_num && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                        <TextInput
                                            style={[globalStyles.inputBox, focusedInput === 'soloparentid_num' && globalStyles.inputBoxFocused]}
                                            value={formData.soloparentid_num}
                                            placeholder='Solo Parent ID Number'
                                            placeholderTextColor={colors.darkgray}
                                            onChangeText={(value) => setFormData({ ...formData, soloparentid_num: value })}
                                            onFocus={() => setFocusedInput('soloparentid_num')}
                                            onBlur={() =>setFocusedInput(null)}
                                        />

                                        {formData.soloparentid_num !== '' && !/^\d+$/.test(formData.soloparentid_num) && (
                                            <Text style={globalStyles.errorText}>Please enter a valid Solo Parent ID Number</Text>
                                        )}
                                    </View>
                                )}

                                <View style={[globalStyles.inputWrapper, !formData.seniorCitizen && {marginBottom: 0}]}>
                                    <View style={globalStyles.checkboxWrapper} >
                                        <View style={[globalStyles.checkboxUnchecked, formData.seniorCitizen && globalStyles.checkboxChecked]} />
                                        <Text style={fontStyles.body}>Senior Citizen</Text>
                                    </View>
                                </View>

                                {formData.seniorCitizen && (
                                    <View style={[globalStyles.inputWrapper, {marginBottom: 0}]}>
                                        <Text style={fontStyles.body}>Senior Citizen ID Number {formData.seniorCitizen && !formData.seniorcitizenid_num && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                        <TextInput
                                            style={[globalStyles.inputBox,, focusedInput === 'seniorcitizenid_num' && globalStyles.inputBoxFocused]}
                                            value={formData.seniorcitizenid_num}
                                            placeholder='Senior Citizen ID Number'
                                            placeholderTextColor={colors.darkgray}
                                            onChangeText={(value) => setFormData({ ...formData, seniorcitizenid_num: value })}
                                            onFocus={() => setFocusedInput('seniorcitizenid_num')}
                                            onBlur={() =>setFocusedInput(null)}
                                        />

                                        {formData.seniorcitizenid_num !== '' && !/^\d+$/.test(formData.seniorcitizenid_num) && (
                                            <Text style={globalStyles.errorText}>Please enter a valid Senior Citizen ID Number</Text>
                                        )}
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Permanent Address */}
                    <View style={globalStyles.detailCard}>
                        <View style={globalStyles.inputContainer}>
                            <Text style={fontStyles.h3}>Permanent Address</Text>
                            {/* Subdivision */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Subdivision</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'permanentAddressSubdivision' && globalStyles.inputBoxFocused]}
                                    value={formData.permanentAddress.subdivision}
                                    placeholder='Subdivision'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, subdivision: value } })}
                                    onFocus={() => setFocusedInput('permanentAddressSubdivision')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            {/* Street */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Street {!formData.permanentAddress.street && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'permanentAddressStreet' && globalStyles.inputBoxFocused]}
                                    value={formData.permanentAddress.street}
                                    placeholder='Street'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, street: value } })}
                                    onFocus={() => setFocusedInput('permanentAddressStreet')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            {/* House No. */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>House No. {!formData.permanentAddress.houseNo && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'permanentAddressHouseNo' && globalStyles.inputBoxFocused]}
                                    value={formData.permanentAddress.houseNo}
                                    placeholder='House No.'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, houseNo: value } })}
                                    onFocus={() => setFocusedInput('permanentAddressHouseNo')}
                                    onBlur={() =>setFocusedInput(null)}/>   
                            </View>

                            {/* Phase No. */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Phase No.</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'permanentAddressPhaseNo' && globalStyles.inputBoxFocused]}
                                    value={formData.permanentAddress.phaseNo}
                                    placeholder='Phase No.'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, phaseNo: value } })}
                                    onFocus={() => setFocusedInput('permanentAddressPhaseNo')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            {/* Lot No. */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Lot No.</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'permanentAddressLotNo' && globalStyles.inputBoxFocused]}
                                    value={formData.permanentAddress.lotNo}
                                    placeholder='Lot No.'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, lotNo: value } })}
                                    onFocus={() => setFocusedInput('permanentAddressLotNo')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            {/* Block No. */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Block No.</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'permanentAddressBlockNo' && globalStyles.inputBoxFocused]}
                                    value={formData.permanentAddress.blockNo}
                                    placeholder='Block No.'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, blockNo: value } })}
                                    onFocus={() => setFocusedInput('permanentAddressBlockNo')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            {/* Building */}
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Building</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'permanentAddressBuilding' && globalStyles.inputBoxFocused]}
                                    value={formData.permanentAddress.building}
                                    placeholder='Building'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, building: value } })}
                                    onFocus={() => setFocusedInput('permanentAddressBuilding')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            {/* Unit/Floor/Room No. */}
                            <View style={[globalStyles.inputWrapper, {marginBottom: 0}]}>
                                <Text style={fontStyles.body}>Unit/Floor/Room No.</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'permanentAddressUnitFloorRoomNo' && globalStyles.inputBoxFocused]}
                                    value={formData.permanentAddress.unitFloorRoomNo}
                                    placeholder='Unit/Floor/Room No.'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, permanentAddress: { ...formData.permanentAddress, unitFloorRoomNo: value } })}
                                    onFocus={() => setFocusedInput('permanentAddressUnitFloorRoomNo')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>
                        </View>
                    </View>
                    
                    {/* Present Address */}
                    <View style={globalStyles.detailCard}>
                        <View style={globalStyles.inputContainer}>
                            <View style={globalStyles.inputWrapper}>
                                <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
                                    <Text style={[fontStyles.h3, {flex: 1}]}>Present Address</Text>         
                                    <TouchableOpacity
                                        style={globalStyles.checkboxWrapper} 
                                        onPress={() => setIsSameAddress(prev => !prev)}>
                                        <View style={[globalStyles.checkboxUnchecked, isSameAddress && globalStyles.checkboxChecked]} />
                                        <Text style={[{ ...fontStyles.body, flexShrink: 1 }]}>
                                            Same as{"\n"}Permanent{"\n"}Address
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            {isSameAddress !== true && (
                                <>
                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>Region {!selectedRegion && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                        <Dropdown
                                            label="Region"
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressRegion' && globalStyles.inputBoxFocused]}
                                            placeholderStyle={globalStyles.inputBoxPlaceholder}
                                            selectedTextStyle={fontStyles.body}
                                            labelField="name"
                                            valueField="code"
                                            placeholder="Region"
                                            data={regions}
                                            value={selectedRegion}
                                            onChange={(item) => {
                                                const selectedValue = item.code;
                                                if (selectedValue) {
                                                    setSelectedRegion(selectedValue);
                                                    setFormData(prevFormData => ({
                                                        ...prevFormData,
                                                        presentAddress: {
                                                            ...prevFormData.presentAddress,
                                                            region: item.name,
                                                            province: '',
                                                            city: '',
                                                            barangay: '',
                                                        }
                                                    }));
                                                    setSelectedProvince('');
                                                    setSelectedCity('');
                                                    setSelectedBarangay('');
                                                }
                                            }}
                                            onFocus={() => setFocusedInput('presentAddressRegion')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>

                                    {selectedRegion !== '130000000' && (
                                        <View style={globalStyles.inputWrapper}>
                                            <Text style={fontStyles.body}>Province  {!selectedProvince && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                            <Dropdown
                                                label="Province"
                                                style={[globalStyles.inputBox, focusedInput === 'presentAddressProvince' && globalStyles.inputBoxFocused]}
                                                placeholderStyle={globalStyles.inputBoxPlaceholder}
                                                selectedTextStyle={fontStyles.body}
                                                labelField="name"
                                                valueField="code"
                                                placeholder="Province"
                                                data={provinces}
                                                value={selectedProvince}
                                                onChange={(item) => {
                                                    const selectedValue = item.code;
                                                    if (selectedValue !== '') {
                                                        setSelectedProvince(selectedValue);
                                                        setFormData(prevFormData => ({
                                                            ...prevFormData,
                                                            presentAddress: {
                                                                ...prevFormData.presentAddress,
                                                                province: item.name,
                                                                city: '',
                                                                barangay: '',
                                                            }
                                                        }));
                                                        setSelectedCity('');
                                                        setSelectedBarangay('');
                                                    }
                                                }}
                                                disable={!formData.presentAddress.region}
                                                onFocus={() => setFocusedInput('presentAddressProvince')}
                                                onBlur={() =>setFocusedInput(null)}/>
                                        </View>
                                    )}

                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>City/Municipality {!selectedCity && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                        <Dropdown
                                            label="City"
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressCityMunicipality' && globalStyles.inputBoxFocused]}
                                            placeholderStyle={globalStyles.inputBoxPlaceholder}
                                            selectedTextStyle={fontStyles.body}
                                            labelField="name"
                                            valueField="code"
                                            placeholder="City/Municipality"
                                            data={cities}
                                            value={selectedCity}
                                            onChange={(item) => {
                                                const selectedValue = item.code;
                                                if (selectedValue !== '') {
                                                    setSelectedCity(selectedValue);
                                                    setFormData(prevFormData => ({
                                                        ...prevFormData,
                                                        presentAddress: {
                                                            ...prevFormData.presentAddress,
                                                            city: item.name,
                                                            barangay: '',
                                                        }
                                                    }));
                                                    setSelectedBarangay('');
                                                }
                                            }}
                                            disable={!formData.presentAddress.province && (formData.presentAddress.region !== 'NCR')}
                                            onFocus={() => setFocusedInput('presentAddressCityMunicipality')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>

                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>Barangay {!selectedBarangay && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                        <Dropdown
                                            label="Barangay"
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressBarangay' && globalStyles.inputBoxFocused]}
                                            placeholderStyle={globalStyles.inputBoxPlaceholder}
                                            selectedTextStyle={fontStyles.body}
                                            labelField="name"
                                            valueField="code"
                                            placeholder="Barangay"
                                            data={barangays}
                                            value={selectedBarangay}
                                            onChange={(item) => {
                                                const selectedValue = item.code;
                                                if (selectedValue !== '') {
                                                    setSelectedBarangay(selectedValue);
                                                    setFormData(prevFormData => ({
                                                        ...prevFormData,
                                                        presentAddress: {
                                                            ...prevFormData.presentAddress,
                                                            barangay: item.name,
                                                        }
                                                    }));
                                                }
                                            }}
                                            disable={!formData.presentAddress.city}
                                            onFocus={() => setFocusedInput('presentAddressBarangay')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>
                                        
                                    {/* Subdivision */}
                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>Subdivision</Text>
                                        <TextInput
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressSubdivision' && globalStyles.inputBoxFocused]}
                                            value={formData.presentAddress.subdivision}
                                            placeholder='Subdivision'
                                            placeholderTextColor={colors.darkgray}
                                            onChangeText={(value) => setFormData({ ...formData, presentAddress: { ...formData.presentAddress, subdivision: value } })}
                                            editable={isSameAddress !== true}onFocus={() => setFocusedInput('presentAddressSubdivision')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>

                                    {/* Street */}
                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>Street {!formData.presentAddress.street && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                        <TextInput
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressStreet' && globalStyles.inputBoxFocused]}
                                            value={formData.presentAddress.street}
                                            placeholder='Street'
                                            placeholderTextColor={colors.darkgray}
                                            onChangeText={(value) => setFormData({ ...formData, presentAddress: { ...formData.presentAddress, street: value } })}
                                            editable={isSameAddress !== true}
                                            onFocus={() => setFocusedInput('presentAddressStreet')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>

                                    {/* House No. */}
                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>House No. {!formData.presentAddress.houseNo && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                        <TextInput
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressHouseNo' && globalStyles.inputBoxFocused]}
                                            value={formData.presentAddress.houseNo}
                                            placeholder='House No.'
                                            placeholderTextColor={colors.darkgray}
                                            onChangeText={(value) => setFormData({ ...formData, presentAddress: { ...formData.presentAddress, houseNo: value } })}
                                            editable={isSameAddress !== true}
                                            onFocus={() => setFocusedInput('presentAddressHouseNo')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>

                                    {/* Phase No. */}
                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>Phase No.</Text>
                                        <TextInput
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressPhaseNo' && globalStyles.inputBoxFocused]}
                                            value={formData.presentAddress.phaseNo}
                                            placeholder='Phase No.'
                                            placeholderTextColor={colors.darkgray}
                                            onChangeText={(value) => setFormData({ ...formData, presentAddress: { ...formData.presentAddress, phaseNo: value } })}
                                            editable={isSameAddress !== true}
                                            onFocus={() => setFocusedInput('presentAddressPhaseNo')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>

                                    {/* Block No. */}
                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>Block No.</Text>
                                        <TextInput
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressBlockNo' && globalStyles.inputBoxFocused]}
                                            value={formData.presentAddress.blockNo}
                                            placeholder='Block No.'
                                            placeholderTextColor={colors.darkgray}
                                            onChangeText={(value) => setFormData({ ...formData, presentAddress: { ...formData.presentAddress, blockNo: value } })}
                                            editable={isSameAddress !== true}
                                            onFocus={() => setFocusedInput('presentAddressBlockNo')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>

                                    {/* Lot No. */}
                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>Lot No.</Text>
                                        <TextInput
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressLotNo' && globalStyles.inputBoxFocused]}
                                            value={formData.presentAddress.lotNo}
                                            placeholder='Lot No.'
                                            placeholderTextColor={colors.darkgray}
                                            onChangeText={(value) => setFormData({ ...formData, presentAddress: { ...formData.presentAddress, lotNo: value } })}
                                            editable={isSameAddress !== true}
                                            onFocus={() => setFocusedInput('presentAddressLotNo')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>

                                    {/* Building */}
                                    <View style={globalStyles.inputWrapper}>
                                        <Text style={fontStyles.body}>Building</Text>
                                        <TextInput
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressBuilding' && globalStyles.inputBoxFocused]}
                                            value={formData.presentAddress.building}
                                            placeholder='Building'
                                            placeholderTextColor={colors.darkgray}
                                            onChangeText={(value) => setFormData({ ...formData, presentAddress: { ...formData.presentAddress, building: value } })}
                                            editable={isSameAddress !== true}
                                            onFocus={() => setFocusedInput('presentAddressBuilding')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>
                                
                                    {/* Unit/Floor/Room No. */}
                                    <View style={[globalStyles.inputWrapper, {marginBottom: 0}]}>
                                        <Text style={fontStyles.body}>Unit/Floor/Room No.</Text>
                                        <TextInput
                                            style={[globalStyles.inputBox, focusedInput === 'presentAddressUnitFloorRoomNo' && globalStyles.inputBoxFocused]}
                                            value={formData.presentAddress.unitFloorRoomNo}
                                            placeholder='Unit/Floor/Room No.'
                                            placeholderTextColor={colors.darkgray}
                                            onChangeText={(value) => setFormData({ ...formData, presentAddress: { ...formData.presentAddress, unitFloorRoomNo: value } })}
                                            editable={isSameAddress !== true}
                                            onFocus={() => setFocusedInput('presentAddressUnitFloorRoomNo')}
                                            onBlur={() =>setFocusedInput(null)}/>
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Other Information */}
                    <View style={globalStyles.detailCard}>
                        <View style={globalStyles.inputContainer}>
                            <Text style={fontStyles.h3}>Other Information</Text>
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>PhilSys Number (PSN)</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'philsys_num' && globalStyles.inputBoxFocused]}
                                    value={formData.philsys_num}
                                    placeholder='PhilSys No.'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, philsys_num: value })}
                                    onFocus={() => setFocusedInput('philsys_num')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Voter's ID Number</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'voters_id' && globalStyles.inputBoxFocused]}
                                    value={formData.voters_id}
                                    placeholder="Voter's ID No."
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, voters_id: value })}
                                    onFocus={() => setFocusedInput('voters_id')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>UMID Common Reference Number (CRN)</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'sss_num' && globalStyles.inputBoxFocused]}
                                    value={formData.sss_num}
                                    placeholder='UMID CRN'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, sss_num: value })}
                                    onFocus={() => setFocusedInput('sss_num')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>Pag-IBIG Membership ID (MID) Number</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'pagibig_num' && globalStyles.inputBoxFocused]}
                                    value={formData.pagibig_num}
                                    placeholder='Pag-IBIG MID No.'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, pagibig_num: value })}
                                    onFocus={() => setFocusedInput('pagibig_num')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.body}>PhilHealth ID Number.</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'philhealth_num' && globalStyles.inputBoxFocused]}
                                    value={formData.philhealth_num}
                                    placeholder='PhilHealth ID No.'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, philhealth_num: value })}
                                    onFocus={() => setFocusedInput('philhealth_num')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>

                            <View style={[globalStyles.inputWrapper, {marginBottom: 0}]}>
                                <Text style={fontStyles.body}>Tax Identification Number (TIN)</Text>
                                <TextInput
                                    style={[globalStyles.inputBox, focusedInput === 'tin_num' && globalStyles.inputBoxFocused]}
                                    value={formData.tin_num}
                                    placeholder='TIN'
                                    placeholderTextColor={colors.darkgray}
                                    onChangeText={(value) => setFormData({ ...formData, tin_num: value })}
                                    onFocus={() => setFocusedInput('tin_num')}
                                    onBlur={() =>setFocusedInput(null)}/>
                            </View>
                        </View>
                    </View>
                    
                    {/* File Upload */}
                    <View style={globalStyles.detailCard}>
                        <View style={globalStyles.inputContainer}>
                            <View style={globalStyles.inputWrapper}>
                                <Text style={fontStyles.h3}>File Upload</Text>
                                <View style={globalStyles.inputWrapper}>
                                    <Text style={fontStyles.body}>Valid ID {!formData.validIDs.length && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                    <TouchableOpacity onPress={handleValidIDsUpload} style={globalStyles.buttonSecondary}>
                                        <Text style={globalStyles.buttonSecondaryText}>+ Upload File</Text>
                                    </TouchableOpacity>

                                    {formData.validIDs.length > 0 && (
                                        <View style={globalStyles.attachmentsContainer}>
                                            {formData.validIDs.map((file, index) => (
                                                <View key={index} style={globalStyles.attachmentsWrapper}>
                                                    {file.type === 'application/pdf' ? (
                                                        <View style={globalStyles.attachmentsImage} >
                                                            <MaterialCommunityIcons name="file-pdf-box" size={60} color="red" />
                                                            <Text style={fontStyles.body}>{file.name.length > 7 ? `${file.name.substring(0, 5)}...pdf` : file.name}</Text>
                                                        </View>
                                                    ) : (
                                                        <Image source={{ uri: file.uri }} style={globalStyles.attachmentsImage} />
                                                    )}
                                                    <TouchableOpacity onPress={() => handleRemoveID(index)} style={globalStyles.attachmentsRemoveButton}>
                                                        <MaterialCommunityIcons name="close" size={20} color="white" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>

                                <View style={globalStyles.inputWrapper}>
                                    <Text style={fontStyles.body}>Profile Picture {!formData.profilepic && <Text style={globalStyles.errorText}>(Required)</Text>}</Text>
                                    <TouchableOpacity onPress={handleProfilePicUpload} style={globalStyles.buttonSecondary}>
                                        <Text style={globalStyles.buttonSecondaryText}>+ Upload File</Text>
                                    </TouchableOpacity>

                                    {formData.profilepic &&
                                        <View style={globalStyles.attachmentsContainer}>
                                            <View style={globalStyles.attachmentsWrapper}>
                                                    <Image source={{ uri: formData.profilepic.uri }} style={globalStyles.attachmentsImage} />
                                                    <TouchableOpacity onPress={() => handleRemoveProfilePic()} style={globalStyles.attachmentsRemoveButton}>
                                                        <MaterialCommunityIcons name="close" size={20} color='white' />
                                                    </TouchableOpacity>
                                                
                                            </View>
                                        </View>
                                    }
                                </View>
                                <TermsDataPrivacy
                                    termsDataPrivacyAccepted={termsDataPrivacyAccepted}
                                    setTermsDataPrivacyAccepted={setTermsDataPrivacyAccepted}
                                    setShowTermsModal={setShowTermsModal}
                                    setShowDataPrivacyModal={setShowDataPrivacyModal}
                                />
                            </View>
                            <SubmitClearButton onSubmit={handleSubmit} onClear={clearForm} disable={isSubmitting}/>
                        </View>
                    </View>
                </View>
            </ScrollView>
            <LoadingModal visible={loading || isSubmitting} purpose={loading ? 'Loading' : 'Submitting'}/>
            <AlertModal
                visible={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={modalContent.title}
                message={modalContent.message}
                buttons={modalContent.buttons}
            />
            <TermsModal visible={showTermsModal} onClose={() => setShowTermsModal(false)} form={'signup'}/>
            <DataPrivacyModal visible={showDataPrivacyModal} onClose={() => setShowDataPrivacyModal(false)} form={'signup'}/>
            <StatusBar barStyle="dark-content" backgroundColor={colors.offWhite}/>
        </KeyboardAvoidingView>
    );
};

export default SignUp;