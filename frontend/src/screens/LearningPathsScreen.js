import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import modernTheme from './modernTheme';
import globalStyles from './globalStyles';
import config from '../config';

const LearningPathsScreen = ({ navigation }) => {
  const [learningPaths, setLearningPaths] = useState([]);

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

  // Función para obtener color único por índice
  const getPathCardColor = (index) => {
    const colors = [
      modernTheme.colors.turquoise,
      modernTheme.colors.coral,
      modernTheme.colors.pastelYellow,
      modernTheme.colors.lavender,
      '#A8E6CF',
      '#FFB3B3',
    ];
    return colors[index % colors.length];
  };

  // Función para obtener icono temático
  const getPathIcon = (index) => {
    const icons = ['🧘', '💪', '🎨', '📚', '🌱', '⭐', '🎯', '🚀'];
    return icons[index % icons.length];
  };

  return (
    <View style={styles.container}>
      {/* Header moderno */}
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>🚀 Rutas de Aprendizaje</Text>
        <Text style={styles.subtitle}>
          Descubre caminos personalizados para tu crecimiento
        </Text>
      </View>

      <FlatList
        data={learningPaths}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.modernPathCard,
              { borderLeftColor: getPathCardColor(index) }
            ]}
            onPress={() => navigation.navigate('LearningPathDetail', { path: item })}
          >
            <View style={styles.pathCardHeader}>
              <View style={[styles.pathIconContainer, { backgroundColor: getPathCardColor(index) }]}>
                <Text style={styles.pathIcon}>{getPathIcon(index)}</Text>
              </View>
              <View style={styles.pathCardContent}>
                <Text style={styles.modernPathTitle}>{item.title}</Text>
                <Text style={styles.modernPathDescription}>{item.description}</Text>
              </View>
              <View style={styles.pathArrow}>
                <Text style={styles.pathArrowText}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={styles.emptyTitle}>¡Próximamente nuevas rutas!</Text>
            <Text style={styles.emptyText}>
              Estamos preparando contenido increíble para tu crecimiento personal
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
    padding: modernTheme.spacing.padding,
  },
  headerContainer: {
    marginBottom: modernTheme.spacing.marginMedium,
  },
  mainTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  subtitle: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
  },
  listContainer: {
    paddingBottom: modernTheme.spacing.padding,
  },
  modernPathCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    padding: modernTheme.spacing.padding,
    borderRadius: 10,
    marginBottom: modernTheme.spacing.marginMedium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
  },
  pathCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pathIconContainer: {
    padding: modernTheme.spacing.padding,
    borderRadius: 10,
  },
  pathIcon: {
    fontSize: 20,
  },
  pathCardContent: {
    flex: 1,
    marginLeft: modernTheme.spacing.marginMedium,
  },
  modernPathTitle: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  modernPathDescription: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
  },
  pathArrow: {
    padding: modernTheme.spacing.paddingSmall,
  },
  pathArrowText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.turquoise,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: modernTheme.spacing.paddingLarge,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  emptyTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
  },
});

export default LearningPathsScreen;