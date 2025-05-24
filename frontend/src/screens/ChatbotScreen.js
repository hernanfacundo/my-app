import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';
import config from '../config';

const ChatbotScreen = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const initialMessage = route.params?.analysis || 'Hola, soy tu amigo virtual. Estoy acá para charlar sobre cómo te sentís. ¿Qué tenés en mente?';

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const res   = await axios.get(
          `${config.API_BASE_URL}/chat-conversations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.messages?.length) {
          setMessages(res.data.messages.map((m,i) => ({
            id:     i.toString(),
            text:   m.content,
            sender: m.sender
          })));
          return;
        }
      } catch (e) { /* … */ }
     // Si no hay historial, usamos initialPrompt o el saludo genérico
     const prompt = route.params?.initialPrompt
       ?? 'Hola, soy tu acompañante. ¿En qué quieres profundizar hoy?';
     setMessages([{ id:'0', text:prompt, sender:'bot' }]);
    })();
  }, [initialMessage]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await axios.post(
        `${config.API_BASE_URL}/chatbot`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.response,
        sender: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: 'Error al conectar con el chatbot', sender: 'bot' },
      ]);
      console.error('Error en chatbot:', error);
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
      Alert.alert('Éxito', 'Conversación guardada para estadísticas');
    } catch (error) {
      console.error('Error al guardar conversación:', error);
      Alert.alert('Error', 'No se pudo guardar la conversación');
    }
  };

  // Función para decodificar el token (reutilizada de CommentScreen.js)
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

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Chatbot</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={item.sender === 'bot' ? styles.botMessage : styles.userMessage}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor={theme.colors.secondaryText}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          saveConversation();
          navigation.goBack();
        }}
      >
        <Text style={styles.closeButtonText}>Cerrar Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  messagesContainer: {
    padding: theme.spacing.padding,
  },
  botMessage: {
    backgroundColor: theme.colors.chartBackground,
    padding: theme.spacing.padding,
    borderRadius: 8,
    marginBottom: theme.spacing.marginSmall,
    alignSelf: 'flex-start',
    maxWidth: '70%',
  },
  userMessage: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 8,
    marginBottom: theme.spacing.marginSmall,
    alignSelf: 'flex-end',
    maxWidth: '70%',
  },
  messageText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.primaryText,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.padding,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.chartBackground,
    borderRadius: 8,
    padding: theme.spacing.padding,
    marginRight: theme.spacing.marginSmall,
    fontSize: theme.fontSizes.label,
    color: theme.colors.primaryText,
  },
  sendButton: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 8,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: theme.colors.secondaryBackground,
    padding: theme.spacing.padding,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: theme.spacing.marginMedium,
    width: '90%',
  },
  closeButtonText: {
    color: theme.colors.primaryText,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
});

export default ChatbotScreen;