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
  const [loading, setLoading] = useState(false);

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

  const viewClassAnalysis = async (classId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.API_BASE_URL}/classes/${classId}/analysis`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      // Separar alertas por severidad
      const highAlerts = response.data.alerts.filter(a => a.severity === 'HIGH');
      const mediumAlerts = response.data.alerts.filter(a => a.severity === 'MEDIUM');
      const lowAlerts = response.data.alerts.filter(a => a.severity === 'LOW');

      // Primero mostrar alertas si hay alguna de alta severidad
      if (highAlerts.length > 0) {
        Alert.alert(
          '⚠️ Alertas Importantes',
          `Se han detectado ${highAlerts.length} situaciones que requieren atención inmediata:\n\n` +
          highAlerts.map(alert => `• ${alert.description} (${alert.studentId.name})`).join('\n\n'),
          [
            {
              text: 'Ver Análisis Completo',
              onPress: () => showFullAnalysis(response.data)
            },
            { text: 'Cerrar', style: 'cancel' }
          ]
        );
      } else {
        // Si no hay alertas críticas, mostrar el análisis directamente
        showFullAnalysis(response.data);
      }
    } catch (error) {
      console.error('Error al obtener análisis:', error);
      Alert.alert('Error', 'No se pudo obtener el análisis de la clase');
    } finally {
      setLoading(false);
    }
  };

  const showFullAnalysis = (data) => {
    const alertSummary = data.alerts.length > 0 
      ? '\n\nAlertas Activas:\n' + data.alerts
          .map(a => `• ${a.severity === 'HIGH' ? '🔴' : a.severity === 'MEDIUM' ? '🟡' : '🟢'} ${a.description}`)
          .join('\n')
      : '';

    Alert.alert(
      'Análisis de la Clase',
      data.insights + alertSummary,
      [
        {
          text: 'Ver Estadísticas',
          onPress: () => {
            Alert.alert(
              'Estadísticas Detalladas',
              `Tamaño de la clase: ${data.classSize} estudiantes\n\n` +
              `Estados de ánimo registrados: ${data.moodAnalysis.total}\n` +
              `Entradas de gratitud: ${data.gratitudeAnalysis.total}\n` +
              `Estudiantes practicando gratitud: ${data.gratitudeAnalysis.studentsWithGratitude}`
            );
          }
        },
        { text: 'Cerrar', style: 'cancel' }
      ]
    );
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
          teacherId: user.id
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
          <TouchableOpacity 
            style={styles.classCard}
            onPress={() => user?.role === 'teacher' ? viewClassAnalysis(item._id) : null}
          >
            <Text style={styles.className}>{item.name}</Text>
            {user?.role === 'teacher' && (
              <>
                <Text style={styles.classCode}>Código: {item.code}</Text>
                <Text style={styles.tapHint}>Toca para ver análisis</Text>
              </>
            )}
          </TouchableOpacity>
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
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text,
  },
  classCard: {
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  className: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
  },
  classCode: {
    fontSize: 14,
    color: theme.colors.secondary,
    marginTop: 5,
  },
  tapHint: {
    fontSize: 12,
    color: theme.colors.accent,
    marginTop: 5,
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.secondary,
    marginTop: 20,
  },
  createSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: theme.colors.card,
    borderRadius: 10,
  },
  createTitle: {
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  createButton: {
    marginTop: 10,
  },
});

export default ClassListScreen;
