// ./src/screens/ClassListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, Alert, StyleSheet
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import globalStyles from './globalStyles';
import theme from './theme';
import config from '../config';

const ClassListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [classes, setClasses] = useState([]);

  const loadClasses = async () => {
    try {
      const endpoint = user.role === 'teacher' 
        ? `${config.API_BASE_URL}/classes`  // Para profesores
        : `${config.API_BASE_URL}/classes/joined`;  // Para alumnos

      const response = await axios.get(
        endpoint,
        {
          headers: { 
            Authorization: `Bearer ${user.token}` 
          }
        }
      );

      console.log('Respuesta del servidor:', response.data);
      setClasses(response.data);
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      
      let errorMessage = 'No se pudieron cargar las clases';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const createClass = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Escribe un nombre de clase');
      return;
    }
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/classes`,
        { 
          name,
          teacherId: user.id  // Agregamos el ID del profesor
        },
        { 
          headers: { 
            Authorization: `Bearer ${user.token}` 
          } 
        }
      );
      
      Alert.alert(
        'Clase creada', 
        `Código de la clase: ${response.data.code}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setName('');
              loadClasses();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error completo al crear clase:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      Alert.alert('Error', 'No se pudo crear la clase');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadClasses();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {user?.role === 'teacher' ? 'Mis Clases Creadas' : 'Mis Clases Inscritas'}
      </Text>

      <FlatList
        data={classes}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.classCard}>
            <Text style={styles.className}>{item.name}</Text>
            {user?.role === 'teacher' && (
              <Text style={styles.classCode}>Código: {item.code}</Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {user?.role === 'teacher' 
              ? 'No has creado ninguna clase aún'
              : 'No estás inscrito en ninguna clase'}
          </Text>
        }
      />

      {user?.role === 'teacher' && (
        <View style={styles.createSection}>
          <Text style={[globalStyles.subtitle, styles.createTitle]}>
            Crear Nueva Clase
          </Text>
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Nombre de la clase"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity 
            style={[globalStyles.button, styles.createButton]}
            onPress={createClass}
          >
            <Text style={globalStyles.buttonText}>Crear Clase</Text>
          </TouchableOpacity>
        </View>
      )}
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
  classCard: {
    backgroundColor: theme.colors.chartBackground,
    padding: theme.spacing.padding,
    borderRadius: 8,
    marginBottom: theme.spacing.marginMedium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  className: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.primaryText,
    fontWeight: '500',
  },
  classCode: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.marginSmall,
  },
  emptyText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: theme.spacing.marginLarge,
  },
  createSection: {
    marginTop: theme.spacing.marginLarge,
    padding: theme.spacing.padding,
    backgroundColor: theme.colors.chartBackground,
    borderRadius: 8,
  },
  createTitle: {
    marginBottom: theme.spacing.marginMedium,
  },
  input: {
    marginBottom: theme.spacing.marginMedium,
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding * 0.8,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginVertical: theme.spacing.marginSmall,
  },
  createButton: {
    marginTop: theme.spacing.marginSmall,
    paddingVertical: theme.spacing.padding * 0.8,
  }
});

export default ClassListScreen;
