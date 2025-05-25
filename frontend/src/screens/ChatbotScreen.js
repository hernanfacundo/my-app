import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import modernTheme from './modernTheme';
import config from '../config';

const ChatbotScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const initialMessage = route.params?.analysis || 'Hola, soy tu amigo virtual. Estoy acá para charlar sobre cómo te sentís. ¿Qué tenés en mente?';

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res = await axios.get(
          `${config.API_BASE_URL}/chat-conversations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.messages?.length) {
          setMessages(res.data.messages.map((m, i) => ({
            id: i.toString(),
            text: m.content,
            sender: m.sender,
            timestamp: new Date()
          })));
          return;
        }
      } catch (e) { /* Silenciar error si no hay historial */ }
      
      // Si no hay historial, usamos initialPrompt o el saludo genérico
      const prompt = route.params?.initialPrompt
        ?? 'Hola, soy tu acompañante emocional 🤗 Estoy aquí para escucharte y ayudarte a reflexionar. ¿En qué quieres profundizar hoy?';
      setMessages([{ 
        id: '0', 
        text: prompt, 
        sender: 'bot',
        timestamp: new Date()
      }]);
    })();
  }, [initialMessage]);

  // Auto-scroll al final cuando hay nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      id: Date.now().toString(), 
      text: input, 
      sender: 'user',
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${config.API_BASE_URL}/chatbot`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Simular typing delay para mejor UX
      setTimeout(() => {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          text: response.data.response,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { 
          id: (Date.now() + 1).toString(), 
          text: 'Lo siento, tuve un problema técnico 😅 ¿Podrías intentar de nuevo?', 
          sender: 'bot',
          timestamp: new Date()
        },
      ]);
      console.error('Error en chatbot:', error);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userId = decodeToken(token).id;
      await axios.post(
        `${config.API_BASE_URL}/chat-conversations`,
        { 
          userId, 
          messages: messages.map(m => ({
            content: m.text,
            sender: m.sender,
            timestamp: new Date()
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Conversación guardada 💾', 'Tu conversación se guardó para ayudarnos a mejorar el servicio');
    } catch (error) {
      console.error('Error al guardar conversación:', error);
      Alert.alert('Error al guardar 😕', 'No pudimos guardar la conversación, pero no te preocupes');
    }
  };

  // Función para decodificar el token
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return {};
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item }) => {
    const isBot = item.sender === 'bot';
    return (
      <View style={[
        styles.messageContainer,
        isBot ? styles.botMessageContainer : styles.userMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isBot ? styles.botMessage : styles.userMessage
        ]}>
          {isBot && <Text style={styles.botEmoji}>🤖</Text>}
          <Text style={[
            styles.messageText,
            isBot ? styles.botMessageText : styles.userMessageText
          ]}>
            {item.text}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          isBot ? styles.botMessageTime : styles.userMessageTime
        ]}>
          {formatTime(item.timestamp)}
        </Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    return (
      <View style={[styles.messageContainer, styles.botMessageContainer]}>
        <View style={[styles.messageBubble, styles.botMessage, styles.typingBubble]}>
          <Text style={styles.botEmoji}>🤖</Text>
          <Text style={styles.typingText}>Escribiendo...</Text>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header moderno */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerEmoji}>🤖</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Tu Acompañante Emocional</Text>
            <Text style={styles.headerSubtitle}>Siempre aquí para escucharte</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            saveConversation();
            navigation.goBack();
          }}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu mensaje..."
            placeholderTextColor={modernTheme.colors.secondaryText}
            editable={!isLoading}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!input.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Text style={styles.sendButtonText}>
              {isLoading ? '⏳' : '📤'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer con tips */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Tip: Sé honesto sobre tus sentimientos. Este es un espacio seguro para ti
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingTop: modernTheme.spacing.paddingXLarge,
    paddingBottom: modernTheme.spacing.paddingMedium,
    backgroundColor: modernTheme.colors.chartBackground,
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.primaryBackground,
    ...modernTheme.shadows.small,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: modernTheme.spacing.marginMedium,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  headerSubtitle: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: modernTheme.colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  messagesContainer: {
    padding: modernTheme.spacing.paddingMedium,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: modernTheme.spacing.marginMedium,
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
    ...modernTheme.shadows.small,
  },
  botMessage: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderBottomLeftRadius: modernTheme.borderRadius.small,
  },
  userMessage: {
    backgroundColor: modernTheme.colors.turquoise,
    borderBottomRightRadius: modernTheme.borderRadius.small,
  },
  botEmoji: {
    fontSize: 16,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  messageText: {
    fontSize: modernTheme.fontSizes.body,
    lineHeight: 22,
  },
  botMessageText: {
    color: modernTheme.colors.primaryText,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: modernTheme.fontSizes.caption,
    marginTop: modernTheme.spacing.marginTiny,
    marginHorizontal: modernTheme.spacing.marginSmall,
  },
  botMessageTime: {
    color: modernTheme.colors.secondaryText,
    alignSelf: 'flex-start',
  },
  userMessageTime: {
    color: modernTheme.colors.secondaryText,
    alignSelf: 'flex-end',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    marginRight: modernTheme.spacing.marginSmall,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: modernTheme.colors.turquoise,
    marginHorizontal: 1,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    paddingHorizontal: modernTheme.spacing.paddingMedium,
    paddingVertical: modernTheme.spacing.paddingSmall,
    backgroundColor: modernTheme.colors.chartBackground,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.primaryBackground,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: modernTheme.colors.primaryBackground,
    borderRadius: modernTheme.borderRadius.medium,
    paddingHorizontal: modernTheme.spacing.paddingMedium,
    paddingVertical: modernTheme.spacing.paddingSmall,
    ...modernTheme.shadows.small,
  },
  input: {
    flex: 1,
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.primaryText,
    maxHeight: 100,
    paddingVertical: modernTheme.spacing.paddingSmall,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modernTheme.colors.turquoise,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: modernTheme.spacing.marginSmall,
  },
  sendButtonDisabled: {
    backgroundColor: modernTheme.colors.secondaryText,
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 18,
  },
  footer: {
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingVertical: modernTheme.spacing.paddingSmall,
    backgroundColor: modernTheme.colors.chartBackground,
    alignItems: 'center',
  },
  footerText: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ChatbotScreen;