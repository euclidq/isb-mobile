import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, sizes, globalStyles, fontStyles } from '../styles/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const helpCenterData = {
    greeting: "Hello, {name}! Welcome to iServe Barangay. Explore the topics below:",
    topics: {
        "Account": {
            "options": {
                "Update Profile Information": "To update your profile information, you must visit the barangay hall in person with the supporting documents for updating your profile.",
                "Change Password": "To reset your password, go to the 'Profile' section on the home screen. Click ‘Change Password’, enter your current password, then your new password, and confirm. Save your changes.",
                "Account Security Tips": "Here are some account security tips to keep in mind:\n\n- Use a strong password.\n- Regularly update your password.\n- Keep your credentials secure."
            }
        },
        "Document Request": {
            "options": {
                "Create Document Request": "To create a document request, go to the 'Document Requests' section in the app. Fill out the required form with the necessary details and submit it for processing.",
                "Document Request Requirements": "General Requirements for All Certificates:\n- Valid ID (Government-issued ID or Student ID)\n- Completed Application Form (available in the Document Requests section of the app)\n\nSpecific Requirements by Document:\n- Certificate of Indigency: Proof of low-income status, such as a social welfare card\n- Certificate of Residency: Recent utility bill or lease agreement\n- Certificate of Local Employment: Proof of local employment, such as an employment certificate or a letter from your employer\n- Certificate of Financial Assistance: Proof of income or an affidavit of financial need\n- Certificate of First Time Jobseeker: Birth certificate or any proof of being a first-time jobseeker\n- Barangay Clearance: Cedula\n- Barangay Business Permit: Business Registration Documents, Barangay Clearance for Business",
                "Type of Documents": "You can request the following types of documents from the barangay:\n\n- Certificate of Indigency\n- Certificate of Residency\n- Certificate of Good Moral Character\n- Certificate of Local Employment\n- Certificate of Financial Assistance\n- Certificate of First Time Jobseeker\n- Barangay Clearance\n- Barangay Business Permit\n- Others (specify)",
                "Track Document Request": "To track the status of your document request, navigate to the 'Document Requests' section and find the specific request you want to check. You will then see the status of your request.",
                "Edit Document Request": "If you need to modify a document request, go to 'Document Requests’, select the request you want to edit, and click 'Edit' to update the necessary information.\n\nYou may only edit a request while its status is pending",
                "Cancel Document Request": "If you wish to cancel a document request, go to 'Document Request’, select the request you want to edit, click 'Edit’, and click ‘Cancel’.\n\nYou may only cancel a request while its status is pending.",
                "Document Request Time": "Document requests may take 1-3 days to process.",
                "Document Collection Instructions": "Once your document request status is ‘Ready for Pickup’, you may now collect your document by visiting the barangay hall.",
                "Document Request Fees": "As of now, document requests are free of charge."
            }
        },
        "Blotter": {
            "options": {
                "Steps to File a Blotter": "Here are the steps to file a blotter:\n\n1. Visit Barangay Hall of Barangay 52-Ipil.\n\n2. Request to File a Blotter: Inform the staff or on-duty officer that you wish to file a blotter report. They will assist you in the process.\n\n3. Provide Necessary Information: Be ready to give details about the incident, including:\n   - Date and time: When the incident occurred.\n   - Location: Where it took place.\n   - People involved: Names and contact information of those involved.\n   - Description: A clear and concise account of the event, including any actions taken.\n\n4. Fill Out the Blotter Book: The staff will provide you with the blotter book. You will need to write your report in the designated section. Ensure that the information is accurate and complete.\n\n5. Sign the Blotter Book: After writing your report, you are required to sign the blotter book to acknowledge that the report has been filed.\n\n6. Follow Up: If necessary, follow up with the barangay or police for updates on any action taken regarding your report.",
            }
        },
        "Complaint": {
            "options": {
                "Create a Complaint": "To create a complaint, navigate to the 'Complaint' section in the app, fill out the complaint form with detailed information, and submit it for review.",
                "Requirements": "Completed Complaint Form: The app will provide a digital form that you need to fill out, which typically includes:\n\n- Supporting Evidence (if applicable): Any relevant documents or files that support your complaint (e.g., photos, videos, or documents). These may need to be uploaded through the app.",
                "Complaint Process": "Here is the process for complaint:\n\n1. Filing of Complaint: The complainant files a complaint. Summons are issued to the defendant the next working day. This should occur within 5 days of filing the complaint.\n\n2. Mediation: Both parties can enter mediation if they agree. Mediation must be completed within 15 days. If a settlement is reached, the process ends successfully. If not, proceed to Constitute the Pangkat.\n\n3. Constitution on the Pangkat: A Pangkat (panel) is formed within 5 days after failed mediation. Both parties have another chance to arbitrate.\n\n4. Atbitration: If both agree, arbitration is scheduled. This must happen 6 to 15 days after the agreement. An Arbitration Award is given based on the results.\n\n 5. Concilation: If arbitration is not agreed upon, conciliation takes place. This lasts between 15 to 30 days. If a settlement is reached, the process concludes. If not, a Certificate to File Action is issued.\n\n6. Execution: If a settlement or award is reached, it becomes enforceable after 10 days and is valid for 6 months. The settlement or award is sent to the local court within 5 days for enforcement."
            }
        },
        "Emergency Services": {
            "options": {
                "Emergency Hotlines": "To view important hotlines, navigate to the red button on the home screen. You may click the number you wish to dial, and it will redirect to the Phone App for easy dialing.",
                "Evacucation Center": "The designated evacuation center is at [place]. You can access the evacuation map by clicking the red button on the home screen. This map shows designated evacuation centers and safe routes.",
                "First Aid Tips": "Here are some general first aid tips:\n\nStay Calm:\n- Assess the situation before acting. Keep a clear head to provide effective assistance.\n\nCall for Help:\n- If the injury is serious or you are unsure, call emergency services immediately.\n\nWound Care:\n- Clean the wound gently with soap and water to remove dirt. Apply a sterile bandage after using an antiseptic to prevent infection.\n\nBurn Treatment:\n- Cool the burn under running water for at least 10 minutes.\n- Cover it with a clean, non-stick dressing. Do not apply ice or ointments.\n\nCPR Basics:\n- For adults, push hard and fast in the center of the chest at a rate of 100-120 compressions per minute.\n- For children and infants, use gentle pressure and follow the appropriate techniques for their size.\n\nChoking Relief:\n- If someone is choking and unable to breathe, encourage them to cough.\n- For adults, perform abdominal thrusts (Heimlich maneuver). For infants, use back blows.\n\nTreat Sprains and Strains:\n- Use the R.I.C.E method: Rest, Ice, Compression, and Elevation to reduce swelling and promote healing.\n\nNosebleeds:\n- Have the person sit up straight and lean slightly forward. Pinch the nostrils together for 5-10 minutes.\n\nFainting:\n- If someone faints, lay them down and elevate their legs. This helps increase blood flow to the brain.\n\n- Always Follow Up: After providing first aid, encourage the injured person to seek professional medical attention if necessary.",
                "Disater Preparedness Tips": "Here are some essential tips to help you prepare for disasters:\n\nCreate an Emergency Plan:\n- Develop a family emergency plan that includes meeting points, communication methods, and responsibilities for each family member.\n\nAssemble an Emergency Kit:\n- Prepare a disaster supply kit with essential items like:Water (one gallon per person per day for at least three days), non-perishable food (at least a three-day supply), first aid kit, flashlight and extra batteries, histle (to signal for help), dust mask, personal sanitation items, and local maps.\n\nStay Informed:\n- Keep up to date with local weather forecasts and alerts. Sign up for emergency alerts in your area.\n\nPractice Drills:\n- Conduct regular drills for different scenarios (earthquake, fire, flood) so everyone knows what to do and where to go.\n\nSecure Your Home:\n- Identify potential hazards in your home and secure heavy furniture, appliances, and items that could fall during a disaster.\n\nKnow Emergency Contacts:\n- Keep a list of emergency contacts, including family members, neighbors, and local emergency services, easily accessible.\n\nPlan for Pets:\n- Include pets in your emergency plan. Have supplies for them and know pet-friendly shelters in case of evacuation.\n\nStay Connected:\n- Designate an out-of-area contact to relay information to family members if you become separated.\n\nReview Insurance Policies:\n- Ensure you have appropriate insurance coverage for your home and belongings and know the process for filing claims after a disaster.\n\nBe Prepared to Evacuate:\n- Know your evacuation routes and have a packed bag ready in case you need to leave quickly."
            }
        }
    }
};

const HelpCenter = () => {
    const navigation = useNavigation();
    const scrollViewRef = useRef();

    const [chatHistory, setChatHistory] = useState([]);
    const [name, setName] = useState('');
    const [userAvatar, setUserAvatar] = useState('');
    const [botAvatar, setBotAvatar] = useState('https://cdn.pixabay.com/photo/2023/03/05/21/11/ai-generated-7832244_640.jpg');

    useEffect(() => {
        const getUserData = async () => {
            try {
                const storedUserData = JSON.parse(await AsyncStorage.getItem('userData'));
                if (storedUserData) {
                    setUserAvatar(storedUserData.profilepic);
                    setName(storedUserData.firstName);
                }
            } catch (error) {
                console.error('Error fetching stored userData:', error);
            }
        };
        getUserData();
    }, []);

    useEffect(() => {
        if (name) {
            const greetingMessage = helpCenterData.greeting.replace('{name}', name);
            setChatHistory([{ sender: 'bot', message: greetingMessage, isOptions: true }]);
        }
    }, [name]);
  
    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [chatHistory]);
  
    const handleTopicSelect = (topic) => {
        setChatHistory((prevChatHistory) => [
            ...prevChatHistory,
            { sender: 'user', message: topic },
            { sender: 'bot', message: `What can I help you with ${topic}?`, isOptions: true, options: helpCenterData.topics[topic].options },
        ]);
    };
  
    const handleOptionSelect = (option, message) => {
        setChatHistory((prevChatHistory) => [
            ...prevChatHistory,
            { sender: 'user', message: option },
            { sender: 'bot', message },
        ]);
    };
  
    const handleReset = () => {
        setChatHistory((prevChatHistory) => [
            ...prevChatHistory,
            { sender: 'user', message: 'Start Over' },
            { sender: 'bot', message: 'What else can I help you with?', isOptions: true },
        ]);
    };
  
    return (
        <View style={globalStyles.container}>
            <Text style={[fontStyles.screenTitle, {paddingHorizontal: spacing.m, marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight}]}>Help Center</Text>
            <ScrollView
                style={globalStyles.scrollViewContainer}
                ref={scrollViewRef}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View style={styles.chatContainer}>
                {chatHistory.map((chat, index) => (
                    <View
                    key={index}
                    style={[
                        styles.chatRow,
                        chat.sender === 'user' ? styles.userRow : styles.botRow,
                    ]}
                    >
                    {chat.sender === 'bot' && (
                        <View style={styles.avatar}>
                            <MaterialCommunityIcons name="robot-excited" size={35} color={colors.white} />    
                        </View>
                        // <Image
                        // source={{uri: botAvatar}}
                        // style={styles.avatar}
                        // />
                    )}
                    <View
                        style={[
                        styles.chatBubble,
                        chat.sender === 'user' ? styles.userMessage : styles.botMessage,
                        ]}
                    >
                        <Text style={styles.chatText}>{chat.message}</Text>
        
                        {chat.isOptions && chat.options && (
                        <View style={styles.optionsContainer}>
                            {Object.keys(chat.options).map((option, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                styles.button,
                                index !== chatHistory.length - 1
                                    ? styles.disabledButton
                                    : styles.button,
                                ]}
                                onPress={() =>
                                handleOptionSelect(option, chat.options[option])
                                }
                                disabled={index !== chatHistory.length - 1}
                            >
                                <Text
                                style={[
                                    styles.optionText,
                                    index !== chatHistory.length - 1
                                    ? styles.disabledButtonText
                                    : styles.buttonText,
                                ]}
                                >
                                {option}
                                </Text>
                            </TouchableOpacity>
                            ))}
                        </View>
                        )}
        
                        {chat.isOptions && !chat.options && (
                        <View style={styles.optionsContainer}>
                            {Object.keys(helpCenterData.topics).map((topic) => (
                            <TouchableOpacity
                                key={topic}
                                style={[
                                styles.optionButton,
                                index !== chatHistory.length - 1
                                    ? styles.disabledButton
                                    : styles.button,
                                ]}
                                onPress={() => handleTopicSelect(topic)}
                                disabled={index !== chatHistory.length - 1}
                            >
                                <Text
                                style={[
                                    styles.optionText,
                                    index !== chatHistory.length - 1
                                    ? styles.disabledButtonText
                                    : styles.buttonText,
                                ]}
                                >
                                {topic}
                                </Text>
                            </TouchableOpacity>
                            ))}
                        </View>
                        )}
        
                        {!chat.isOptions && index === chatHistory.length - 1 && (
                        <View style={{ marginTop: spacing.m }}>
                            <TouchableOpacity style={styles.button} onPress={handleReset}>
                            <Text style={styles.buttonText}>Start Over</Text>
                            </TouchableOpacity>
                        </View>
                        )}
                    </View>
                    {chat.sender === 'user' && (
                        <Image
                        source={{ uri: userAvatar}}
                        style={styles.avatar}
                        />
                    )}
                    </View>
                ))}
                </View>
            </ScrollView>
        </View>
    );
  };
  
  const styles = StyleSheet.create({
    chatContainer: {
        flexDirection: 'column',
        gap: spacing.s,
    },
    chatRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 10,
    },
    botRow: {
        gap: spacing.s,
        justifyContent: 'flex-start',
    },
    userRow: {
        gap: spacing.s,
        justifyContent: 'flex-end',
    },
    chatBubble: {
        padding: spacing.m,
        borderRadius: 10,
        maxWidth: '70%',
    },
    userMessage: {
        backgroundColor: colors.secondary,
        alignSelf: 'flex-end',
    },
    botMessage: {
        backgroundColor: colors.white,
        alignSelf: 'flex-start',
    },
    chatText: {
        fontSize: 16,
    },
    optionsContainer: {
        marginTop: spacing.m,
        gap: spacing.s,
    },
    button: {
        width: '100%',
        padding: spacing.s,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        backgroundColor: colors.primary,
    },
    buttonText: {
        ...sizes.bold,
        color: colors.white,
        textAlign: 'center',
    },
    disabledButton: {
        width: '100%',
        padding: spacing.s,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        backgroundColor: colors.lightgray,
    },
    disabledButtonText: {
        ...sizes.body,
        color: colors.darkgray,
    },
    avatar: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        backgroundColor: colors.primary,
    },
  });
  
  export default HelpCenter;