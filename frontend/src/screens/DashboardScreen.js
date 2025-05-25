// src/screens/DashboardScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Alert,
  StyleSheet, FlatList
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';
import config from '../config';
import { useAuth } from '../context/AuthContext';   // <-- nuevo import

// Componente CustomButton
const CustomButton = ({ title, onPress }) => (
  <TouchableOpacity 
    style={[globalStyles.button, styles.dashboardButton]} 
    onPress={onPress}
  >
    <Text style={globalStyles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();               // <-- obtener rol
  const [learningPaths, setLearningPaths] = useState([]);
  const [hasGratitudeToday, setHasGratitudeToday] = useState(true);
  const [isLoadingGratitude, setIsLoadingGratitude] = useState(true);

  // Carga rutas de aprendizaje
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) throw new Error('No token found');
        const response = await axios.get(
          `${config.API_BASE_URL}/learning-paths`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setLearningPaths(response.data.data);
      } catch (error) {
        console.error('Error al obtener learning-paths:',
          error.response?.data || error.message);
      }
    };
    fetchLearningPaths();
  }, [navigation]);

  // Verificar gratitud de hoy
  const checkGratitudeToday = useCallback(async () => {
    try {
      setIsLoadingGratitude(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Por favor, inicia sesión nuevamente');
        navigation.navigate('SignIn');
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await axios.get(
        `${config.API_BASE_URL}/gratitude/last-seven-days`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const entries = response.data.data || [];
      const todayEntry = entries.find(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });
      setHasGratitudeToday(!!todayEntry);
    } catch (error) {
      console.error('Error al verificar gratitud:',
        error.response?.data || error.message);
      setHasGratitudeToday(true);
    } finally {
      setIsLoadingGratitude(false);
    }
  }, [navigation]);

  useEffect(() => {
    checkGratitudeToday();
    const unsubscribe = navigation.addListener('focus', checkGratitudeToday);
    return unsubscribe;
  }, [navigation, checkGratitudeToday]);

  const moods = [
    { label: 'Excelente',    emoji: '😊' },
    { label: 'Muy bien',     emoji: '🙂' },
    { label: 'Bien',         emoji: '😐' },
    { label: 'Más o menos',  emoji: '😕' },
    { label: 'No tan bien',  emoji: '😔' }
  ];

  // Header que muestra los botones de Clases
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={[globalStyles.title, styles.welcomeText]}>
        ¡Bienvenido{user?.name ? `, ${user.name}` : ''}!
      </Text>

      {/* Sección de Clases - Solo para docentes */}
      {user?.role === 'teacher' && (
        <View style={styles.classButtonsContainer}>
          <CustomButton
            title="Administrar Mis Clases"
            onPress={() => navigation.navigate('ClassList')}
          />
          <CustomButton
            title="Ver Estudiantes"
            onPress={() => navigation.navigate('StudentList')}
          />
        </View>
      )}

      {/* Sección de Unirse a Clase - Solo para estudiantes */}
      {user?.role === 'student' && (
        <CustomButton
          title="Unirme a Clase"
          onPress={() => navigation.navigate('JoinClass')}
        />
      )}
    </View>
  );

  // Renderiza cada sección - Solo para estudiantes
  const renderItem = ({ item }) => {
    // Si es docente, no mostramos estas secciones
    if (user?.role === 'teacher') {
      return null;
    }

    return (
      <View>
        {item.type === 'moods' && (
          <View>
            <Text style={globalStyles.title}>¿Cómo estás hoy?</Text>
            <View style={styles.moodContainer}>
              {moods.map(mood => (
                <TouchableOpacity
                  key={mood.label}
                  style={styles.moodButton}
                  onPress={() =>
                    navigation.navigate('EmotionSelection', { mood: mood.label })
                  }
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <CustomButton
              title="Historial de estados"
              onPress={() => navigation.navigate('MoodHistory')}
            />
          </View>
        )}
        {item.type === 'learningPaths' && (
          <View>
            <Text style={globalStyles.subtitle}>Rutas de aprendizaje</Text>
            <FlatList
              data={learningPaths}
              keyExtractor={path => path._id}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              renderItem={({ item: path }) => (
                <TouchableOpacity
                  style={styles.pathCard}
                  onPress={() =>
                    navigation.navigate('LearningPathDetail', { path })
                  }
                >
                  <Text style={styles.pathTitle}>{path.title}</Text>
                  <Text style={globalStyles.secondaryText}>
                    {path.description}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No hay caminos de aprendizaje disponibles
                </Text>
              }
            />
            <CustomButton
              title="Explorar más"
              onPress={() => navigation.navigate('LearningPaths')}
            />
          </View>
        )}
        {item.type === 'gratitude' && (
          <View>
            <Text style={globalStyles.subtitle}>
              Mi Diario de Gratitud 🌟
            </Text>
            {!isLoadingGratitude && !hasGratitudeToday && (
              <TouchableOpacity
                style={styles.reminderCard}
                onPress={() => navigation.navigate('GratitudeEntry')}
              >
                <Text style={styles.reminderText}>
                  Hoy aún no registraste tu gratitud. ¡Inténtalo! 🌈
                </Text>
              </TouchableOpacity>
            )}
            <CustomButton
              title="Registrar Gratitud 💬"
              onPress={() => navigation.navigate('GratitudeEntry')}
            />
            <CustomButton
              title="Ver Historial de Gratitud 📝"
              onPress={() => navigation.navigate('GratitudeHistory')}
            />
          </View>
        )}
      </View>
    );
  };

  const data = [
    { type: 'moods' },
    { type: 'learningPaths' },
    { type: 'gratitude' },
  ];

  return (
    <FlatList
      ListHeaderComponent={renderHeader}           // <-- aquí inyectamos el header
      data={data}
      renderItem={renderItem}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.padding,
    backgroundColor: theme.colors.primaryBackground,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.marginLarge,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.marginLarge,
    width: '100%',
  },
  moodButton: {
    backgroundColor: theme.colors.chartBackground,
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  moodEmoji: {
    fontSize: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.marginMedium,
  },
  pathCard: {
    backgroundColor: theme.colors.chartBackground,
    padding: theme.spacing.padding,
    borderRadius: 10,
    marginBottom: theme.spacing.marginMedium,
    flex: 1,
    marginHorizontal: 5,
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
  reminderCard: {
    backgroundColor: theme.colors.chartBackground,
    borderRadius: 8,
    padding: theme.spacing.paddingMedium,
    marginBottom: theme.spacing.marginMedium,
    borderColor: theme.colors.accent,
    borderWidth: 1,
    alignItems: 'center',
  },
  reminderText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.primaryText,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: theme.spacing.marginSmall,
    width: '90%',
  },
  buttonText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: theme.spacing.marginMedium,
  },
  classButtonsContainer: {
    width: '100%',
    marginBottom: theme.spacing.marginLarge,
    gap: theme.spacing.marginSmall, // Espacio entre botones
  },
  dashboardButton: {
    marginBottom: theme.spacing.marginMedium,
  },
});

export default DashboardScreen;