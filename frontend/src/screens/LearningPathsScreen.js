import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av'; // Corrige la importación: expo-audio no es correcto, debería ser expo-av
import theme from './theme';
import globalStyles from './globalStyles';
import config from '../config';

// Componente CustomButton incluido directamente
const CustomButton = ({ title, onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const LearningPathsScreen = ({ navigation }) => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Depurar si navigation está disponible
  useEffect(() => {
    console.log('Navigation en LearningPathsScreen:', navigation);
    if (!navigation) {
      console.error('Navigation no está disponible en LearningPathsScreen');
    }
  }, [navigation]);

  // Fetch de rutas de aprendizaje
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          console.error('Token no encontrado');
          Alert.alert('Error', 'Por favor, inicia sesión nuevamente');
          return;
        }
        console.log('Solicitando learning-paths desde:', `${config.API_BASE_URL}/learning-paths`);
        const response = await axios.get(`${config.API_BASE_URL}/learning-paths`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Respuesta de learning-paths:', response.data);
        if (response.data.data && Array.isArray(response.data.data)) {
          setLearningPaths(response.data.data);
        } else {
          console.warn('Datos de learning-paths no son un arreglo válido:', response.data);
          setLearningPaths([]);
        }
      } catch (error) {
        console.error('Error al obtener learning-paths:', error.response?.data || error.message);
        Alert.alert('Error', error.response?.data?.message || 'No se pudieron cargar los caminos de aprendizaje');
      }
    };

    fetchLearningPaths();
  }, []);

  // Gestión de audio
  async function loadAndPlaySound() {
    try {
      console.log('Cargando audio...');
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://example.com/learning-audio.mp3' } // Reemplaza con tu URL de audio válida
      );
      setSound(sound);
      await sound.playAsync();
      setIsPlaying(true);
      console.log('Audio reproduciéndose...');

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          setSound(null);
        }
      });
    } catch (error) {
      console.error('Error al reproducir audio:', error);
      Alert.alert('Error', 'No se pudo reproducir el audio');
    }
  }

  async function stopSound() {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      console.log('Audio detenido.');
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      <Text style={globalStyles.title}>Rutas de Aprendizaje</Text>
      <FlatList
        data={learningPaths}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.pathCard}
            onPress={() => navigation.navigate('LearningPathDetail', { path: item })}
          >
            <Text style={styles.pathTitle}>{item.title}</Text>
            <Text style={globalStyles.secondaryText}>{item.description}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay caminos de aprendizaje disponibles</Text>}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.buttonContainer}>
        <CustomButton
          title={isPlaying ? 'Detener' : 'Reproducir Audio'}
          onPress={isPlaying ? stopSound : loadAndPlaySound}
          disabled={!learningPaths.length} // Deshabilita el botón si no hay learning paths
        />
      </View>
      <Text style={styles.instructions}>
        Escucha esta guía para comenzar tu camino de aprendizaje.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryBackground,
    padding: theme.spacing.padding,
  },
  listContent: {
    paddingBottom: theme.spacing.padding,
  },
  buttonContainer: {
    marginVertical: theme.spacing.marginMedium,
  },
  pathCard: {
    backgroundColor: theme.colors.chartBackground,
    padding: theme.spacing.padding,
    borderRadius: 10,
    marginBottom: theme.spacing.marginMedium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pathTitle: {
    fontSize: theme.fontSizes.subtitle,
    fontWeight: '600',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.marginSmall,
  },
  emptyText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginVertical: theme.spacing.marginMedium,
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: theme.spacing.marginSmall,
    width: '90%',
  },
  disabledButton: {
    backgroundColor: theme.colors.secondaryBackground, // Color deshabilitado
    opacity: 0.5,
  },
  buttonText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
  instructions: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: theme.spacing.marginSmall,
  },
});

export default LearningPathsScreen;