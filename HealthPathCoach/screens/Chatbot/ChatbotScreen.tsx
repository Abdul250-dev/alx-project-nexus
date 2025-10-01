import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { ChevronDown, Send } from "react-native-feather";
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { useTheme } from '../../components/theme-provider';
import { useUser } from '../../context/UserContext';
import { sendChatbotMessage } from '../../services/chatbotService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  source?: string;
  category?: string;
  followUp?: string[];
}

interface ChatbotResponse {
  text: string;
  source: string;
  category?: string;
  followUp?: string[];
}

const { width: screenWidth } = Dimensions.get('window');

const ChatbotScreen: React.FC = () => {
  const { userData } = useUser();
  // Helper to get first name
  const getFirstName = () => {
    if (userData?.displayName) {
      return userData.displayName.split(' ')[0];
    }
    if (userData?.email) {
      return userData.email.split('@')[0];
    }
    return 'there';
  };
  // Helper to get time-based greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  // Initial message with personalized greeting
  const initialGreeting = `${getTimeGreeting()} ${getFirstName()}! I'm your HealthPathCoach assistant. I can help you with questions about reproductive health, menstrual cycles, and healthy lifestyle choices. How can I help you today?`;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: initialGreeting,
      isUser: false,
      timestamp: new Date(),
      source: 'HealthPathCoach',
      category: 'General',
      followUp: ['What is follicular phase?', 'Period pain relief', 'Healthy diet tips']
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const { colors } = useTheme();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const typingAnimation = useRef(new Animated.Value(0)).current;
  const scrollButtonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Typing animation
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isLoading]);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    Keyboard.dismiss();
    inputRef.current?.blur();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 50);

    try {
      const response: ChatbotResponse = await sendChatbotMessage(inputText.trim());

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        source: response.source,
        category: response.category,
        followUp: response.followUp,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm experiencing some technical difficulties. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        source: 'System',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 200);
  };

  const handleFollowUpPress = (question: string) => {
    setInputText(question);
    inputRef.current?.focus();
    setTimeout(() => {
      sendMessage();
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isNearBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;

    if (isNearBottom && showScrollToBottom) {
      setShowScrollToBottom(false);
      Animated.timing(scrollButtonAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (!isNearBottom && !showScrollToBottom) {
      setShowScrollToBottom(true);
      Animated.timing(scrollButtonAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const renderMessage = (message: Message, index: number) => {
    const messageAnim = new Animated.Value(0);

    // Animate message entrance
    Animated.timing(messageAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        key={message.id}
        style={[
          styles.messageWrapper,
          {
            opacity: messageAnim,
            transform: [
              {
                translateY: messageAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[
          styles.messageContainer,
          message.isUser ? styles.userMessage : styles.botMessage,
          {
            backgroundColor: message.isUser ? colors.teal : colors.cardBackground,
            borderColor: !message.isUser ? colors.teal + '40' : undefined,
            borderWidth: !message.isUser ? 1 : undefined,
            borderRadius: 8,
            padding: 8,
            paddingHorizontal: 12,
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            flexDirection: 'column',
            alignItems: 'flex-start',
            position: 'relative',
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: message.isUser ? colors.white : colors.text }
          ]}>
            {message.text}
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignSelf: 'flex-end', width: '100%' }}>
            <Text style={[
              styles.timestampText,
              { color: message.isUser ? colors.white + '99' : colors.textSecondary, marginTop: 2 }
            ]}>
              {formatTime(message.timestamp)}
            </Text>
          </View>

          {!message.isUser && message.source && (
            <View style={styles.sourceContainer}>
              <Text style={[styles.sourceIcon, { color: colors.teal }]}>🩺</Text>
              <Text style={[styles.sourceText, { color: colors.textSecondary }]}> {message.source} </Text>
            </View>
          )}
        </View>

        {!message.isUser && message.followUp && message.followUp.length > 0 && (
          <View style={styles.followUpContainer}>
            <Text style={[styles.followUpTitle, { color: colors.primary }]}>
              💡 Quick questions:
            </Text>
            <View style={styles.followUpButtons}>
              {message.followUp.map((question, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.followUpButton, {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.teal + '40'
                  }]}
                  onPress={() => handleFollowUpPress(question)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.followUpText, { color: colors.teal }]}>
                    {question}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => (
    <Animated.View style={[
      styles.messageWrapper,
      {
        opacity: typingAnimation,
        transform: [
          {
            translateY: typingAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
        ],
      },
    ]}>
      <View style={[styles.messageContainer, styles.botMessage, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.typingContainer}>
          <View style={styles.typingIndicator}>
            {[0, 1, 2].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.typingDot,
                  { backgroundColor: colors.textSecondary },
                  {
                    opacity: typingAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                    transform: [
                      {
                        scale: typingAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.white} />
      <Header title="Chat Assistant" showBackButton />
      <View style={{ alignItems: 'center', backgroundColor: colors.cardBackground, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '500' }}>
          You are on the HealthPathCoach chat page
        </Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 24}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onContentSizeChange={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          >
            {messages.map((message, index) => renderMessage(message, index))}
            {isLoading && renderTypingIndicator()}
          </ScrollView>
          {/* Scroll to bottom button (keep outside input) */}
          <Animated.View
            style={[
              styles.scrollToBottomButton,
              {
                opacity: scrollButtonAnim,
                transform: [
                  {
                    translateY: scrollButtonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
            pointerEvents={showScrollToBottom ? 'auto' : 'none'}
          >
            <TouchableOpacity
              style={[styles.scrollButton, { backgroundColor: colors.teal }]}
              onPress={scrollToBottom}
            >
              <ChevronDown stroke="#FFFFFF" width={20} height={20} />
            </TouchableOpacity>
          </Animated.View>
        </View>
        {/* Input container OUTSIDE ScrollView, always at bottom */}
        <View style={[
          styles.inputContainer,
          { backgroundColor: colors.background, paddingVertical: 4, paddingBottom: Platform.OS === 'ios' ? 4 : 2 }
        ]}>
          <View style={styles.inputWrapper}>
            <View style={[styles.textInputContainer, { backgroundColor: colors.inputBackground }]}>
              <TextInput
                ref={inputRef}
                style={[styles.textInput, { color: '#000' }]}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message"
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={sendMessage}
                textAlignVertical="center"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: inputText.trim() === '' || isLoading
                    ? colors.textSecondary
                    : colors.teal,
                },
              ]}
              onPress={sendMessage}
              disabled={inputText.trim() === '' || isLoading}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.sendButtonContent,
                  {
                    transform: [
                      {
                        scale: isLoading ? 0.8 : 1,
                      },
                    ],
                  },
                ]}
              >
                {isLoading ? (
                  <View style={styles.loadingSpinner}>
                    <View style={[styles.spinner, { borderColor: '#FFFFFF' }]} />
                  </View>
                ) : (
                  <Send stroke="#FFFFFF" width={18} height={18} />
                )}
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  messagesContent: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  messageWrapper: {
    marginVertical: 2,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    marginLeft: 10,
    paddingHorizontal: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  messageContent: {
    position: 'relative',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 4,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestampText: {
    fontSize: 11,
    fontWeight: '400',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  sourceIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '500',
  },
  followUpContainer: {
    marginTop: 8,
    marginLeft: 10,
  },
  followUpTitle: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  followUpButtons: {
    flexDirection: 'column',
    gap: 6,
  },
  followUpButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    maxWidth: screenWidth - 80,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  followUpText: {
    fontSize: 13,
    fontWeight: '500',
  },
  typingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  scrollToBottomButton: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    zIndex: 1000,
  },
  scrollButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  inputContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    paddingBottom: Platform.OS === 'ios' ? 4 : 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textInput: {
    fontSize: 16,
    maxHeight: 100,
    minHeight: 10,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sendButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 18,
    height: 18,
  },
  spinner: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderRadius: 9,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default ChatbotScreen;