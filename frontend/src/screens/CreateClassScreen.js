import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import theme from '../screens/theme';

const CreateClassScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [className, setClassName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateClass = async () => {
    try {
      if (!className.trim()) {
        Alert.alert('Error', 'Por favor ingresa un nombre para la clase');
        return;
      }

      const response = await axios.post(
        `${config.API_BASE_URL}/classes`,
        {
          name: className,
          description: description
        },
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      Alert.alert(
        'Éxito',
        'Clase creada correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ClassList')
          }
        ]
      );
    } catch (error) {
      console.error('Error creando clase:', error);
      Alert.alert('Error', 'No se pudo crear la clase');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nueva Clase</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nombre de la clase"
        value={className}
        onChangeText={setClassName}
      />
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descripción (opcional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={handleCreateClass}
      >
        <Text style={styles.buttonText}>Crear Clase</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.padding,
    backgroundColor: theme.colors.primaryBackground,
  },
  title: {
    fontSize: theme.fontSizes.title,
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.marginLarge,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.chartBackground,
    padding: theme.spacing.padding,
    borderRadius: 8,
    marginBottom: theme.spacing.marginMedium,
    fontSize: theme.fontSizes.body,
    color: theme.colors.primaryText,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 8,
    marginTop: theme.spacing.marginMedium,
  },
  buttonText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CreateClassScreen;
