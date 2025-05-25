// src/screens/DashboardScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Alert,
  StyleSheet, FlatList
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from '../screens/globalStyles';
import modernTheme from '../screens/modernTheme';
import config from '../config';
import { useAuth } from '../context/AuthContext';   // <-- nuevo import

// Componente CustomButton con nuevo diseño
const CustomButton = ({ title, onPress, variant = 'primary' }) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.button, styles.secondaryButton];
      case 'coral':
        return [styles.button, styles.coralButton];
      default:
        return [styles.button, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return [styles.buttonText, styles.secondaryButtonText];
      default:
        return [styles.buttonText, styles.primaryButtonText];
    }
  };

  return (
    <TouchableOpacity 
      style={getButtonStyle()} 
      onPress={onPress}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();               // <-- obtener rol
  const [learningPaths, setLearningPaths] = useState([]);
  const [hasGratitudeToday, setHasGratitudeToday] = useState(true);
  const [isLoadingGratitude, setIsLoadingGratitude] = useState(true);

  // Función para obtener colores únicos para cada mood
  const getMoodColor = (index) => {
    const moodColors = [
      modernTheme.colors.turquoise,    // Excelente - Turquesa
      modernTheme.colors.coral,        // Muy bien - Coral
      modernTheme.colors.pastelYellow, // Bien - Amarillo pastel
      modernTheme.colors.lavender,     // Más o menos - Lavanda
      '#FFB3B3',                       // No tan bien - Rosa suave
    ];
    return moodColors[index] || modernTheme.colors.turquoise;
  };

  // Función para obtener colores únicos para cada tarjeta de ruta
  const getPathCardColor = (index) => {
    const pathColors = [
      modernTheme.colors.turquoise,    // Primera tarjeta - Turquesa
      modernTheme.colors.coral,        // Segunda tarjeta - Coral
      modernTheme.colors.lavender,     // Tercera tarjeta - Lavanda
      modernTheme.colors.pastelYellow, // Cuarta tarjeta - Amarillo pastel
      '#FFB3B3',                       // Quinta tarjeta - Rosa suave
      '#A8E6CF',                       // Sexta tarjeta - Verde menta
    ];
    return pathColors[index % pathColors.length] || modernTheme.colors.turquoise;
  };

  // Función para obtener iconos temáticos para cada ruta
  const getPathIcon = (index) => {
    const pathIcons = [
      '🧘',  // Mindfulness/Meditación
      '💪',  // Fortaleza/Crecimiento personal
      '🎨',  // Creatividad/Arte
      '📚',  // Estudio/Aprendizaje
      '🌱',  // Crecimiento/Desarrollo
      '⭐',  // Excelencia/Logros
    ];
    return pathIcons[index % pathIcons.length] || '🎯';
  };

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
        setLearningPaths(response.data.data.slice(0, 4));
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

  // Header que muestra los botones de Clases con diseño moderno
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Saludo juvenil y dinámico - MÁS COMPACTO */}
      <View style={styles.greetingContainer}>
        <View style={styles.greetingMainContainer}>
          <Text style={styles.greetingMain}>
            ¡Hola{user?.name ? `, ${user.name}` : ''}! 
          </Text>
          <Text style={styles.greetingEmoji}>👋✨</Text>
        </View>
        {/* ELIMINAMOS el subtexto "Que tal si exploramos algo nuevo" */}
        {user?.role === 'teacher' && (
          <Text style={styles.greetingSubtext}>
            ¿Listo para inspirar a tus estudiantes?
          </Text>
        )}
      </View>

      {/* Sección de Clases - Solo para docentes */}
      {user?.role === 'teacher' && (
        <View style={styles.teacherSection}>
          <Text style={styles.sectionLabel}>🎓 Tu espacio docente</Text>
          <View style={styles.actionCardsContainer}>
            <TouchableOpacity 
              style={[styles.actionCard, styles.primaryActionCard]}
              onPress={() => navigation.navigate('ClassList')}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>📚</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Mis Clases</Text>
                <Text style={styles.cardSubtitle}>Administra y analiza</Text>
              </View>
              <View style={styles.cardArrow}>
                <Text style={styles.cardArrowText}>→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionCard, styles.secondaryActionCard]}
              onPress={() => navigation.navigate('StudentList')}
            >
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>👥</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Estudiantes</Text>
                <Text style={styles.cardSubtitle}>Ver progreso</Text>
              </View>
              <View style={styles.cardArrow}>
                <Text style={styles.cardArrowText}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Sección de Unirse a Clase - Solo para estudiantes - MÁS COMPACTA */}
      {user?.role === 'student' && (
        <View style={styles.studentSection}>
          <Text style={styles.sectionLabel}>🚀 Tu aventura de aprendizaje</Text>
          <TouchableOpacity 
            style={[styles.actionCard, styles.studentActionCardCompact]}
            onPress={() => navigation.navigate('JoinClass')}
          >
            <View style={styles.cardIconSmall}>
              <Text style={styles.cardIconTextSmall}>🎯</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitleSmall}>Únete a una Clase</Text>
              <Text style={styles.cardSubtitleSmall}>Conecta con tu profesor</Text>
            </View>
            <View style={styles.cardArrowSmall}>
              <Text style={styles.cardArrowTextSmall}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
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
          <View style={styles.moodSection}>
            <View style={styles.moodHeaderContainer}>
              <Text style={styles.moodTitle}>¿Cómo te sientes hoy?</Text>
              <Text style={styles.moodSubtitle}>Toca el emoji que mejor te represente 😊</Text>
            </View>
            
            <View style={styles.moodGridContainer}>
              {moods.map((mood, index) => (
                <TouchableOpacity
                  key={mood.label}
                  style={[
                    styles.moodButton,
                    { backgroundColor: getMoodColor(index) }
                  ]}
                  onPress={() =>
                    navigation.navigate('EmotionSelection', { mood: mood.label })
                  }
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={styles.moodLabel}>{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* BOTÓN DE HISTORIAL TEMPORALMENTE OCULTO
            <View style={styles.moodActionContainer}>
              <TouchableOpacity 
                style={styles.historyButtonCompact}
                onPress={() => navigation.navigate('MoodHistory')}
              >
                <View style={styles.historyButtonIconSmall}>
                  <Text style={styles.historyButtonIconTextSmall}>📊</Text>
                </View>
                <View style={styles.historyButtonContent}>
                  <Text style={styles.historyButtonTitleSmall}>Mi Historial</Text>
                  <Text style={styles.historyButtonSubtitleSmall}>Ve cómo has estado</Text>
                </View>
                <View style={styles.historyButtonArrowSmall}>
                  <Text style={styles.historyButtonArrowTextSmall}>→</Text>
                </View>
              </TouchableOpacity>
            </View>
            */}
          </View>
        )}
        {item.type === 'learningPaths' && (
          <View style={styles.learningSection}>
            <View style={styles.learningHeaderContainer}>
              <Text style={styles.learningTitle}>🎯 Rutas de Aprendizaje</Text>
              <Text style={styles.learningSubtitle}>Descubre nuevas formas de crecer y aprender</Text>
            </View>
            
            <FlatList
              data={learningPaths}
              keyExtractor={path => path._id}
              numColumns={2}
              columnWrapperStyle={styles.pathColumnWrapper}
              renderItem={({ item: path, index }) => (
                <TouchableOpacity
                  style={[
                    styles.modernPathCard,
                    { backgroundColor: getPathCardColor(index) }
                  ]}
                  onPress={() =>
                    navigation.navigate('LearningPathDetail', { path })
                  }
                >
                  <View style={styles.pathCardHeader}>
                    <View style={styles.pathIconContainer}>
                      <Text style={styles.pathIcon}>{getPathIcon(index)}</Text>
                    </View>
                    <View style={styles.pathCardBadge}>
                      <Text style={styles.pathCardBadgeText}>NUEVO</Text>
                    </View>
                  </View>
                  
                  <View style={styles.pathCardContent}>
                    <Text style={styles.modernPathTitle}>{path.title}</Text>
                    {/* DESCRIPCIÓN TEMPORALMENTE OCULTA
                    <Text style={styles.modernPathDescription}>
                      {path.description}
                    </Text>
                    */}
                  </View>
                  
                  <View style={styles.pathCardFooter}>
                    <View style={styles.pathProgressContainer}>
                      <View style={styles.pathProgressBar}>
                        <View style={[styles.pathProgress, { width: '30%' }]} />
                      </View>
                      <Text style={styles.pathProgressText}>Comenzar</Text>
                    </View>
                    <View style={styles.pathArrowContainer}>
                      <Text style={styles.pathArrowText}>→</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyPathsContainer}>
                  <Text style={styles.emptyPathsEmoji}>📚</Text>
                  <Text style={styles.emptyPathsTitle}>¡Próximamente!</Text>
                  <Text style={styles.emptyPathsText}>
                    Estamos preparando rutas increíbles para ti
                  </Text>
                </View>
              }
            />
            
            <View style={styles.exploreMoreContainer}>
              <TouchableOpacity 
                style={styles.exploreMoreButtonCompact}
                onPress={() => navigation.navigate('LearningPaths')}
              >
                <View style={styles.exploreMoreIconSmall}>
                  <Text style={styles.exploreMoreIconTextSmall}>🌟</Text>
                </View>
                <View style={styles.exploreMoreContent}>
                  <Text style={styles.exploreMoreTitleSmall}>Explorar Más Rutas</Text>
                </View>
                <View style={styles.exploreMoreArrowSmall}>
                  <Text style={styles.exploreMoreArrowTextSmall}>→</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
        {item.type === 'gratitude' && (
          <View style={styles.gratitudeSection}>
            <View style={styles.gratitudeHeaderContainer}>
              <Text style={styles.gratitudeTitle}>✨ Mi Diario de Gratitud</Text>
              <Text style={styles.gratitudeSubtitle}>Cultiva momentos de agradecimiento</Text>
            </View>
            
            {!isLoadingGratitude && !hasGratitudeToday && (
              <View style={styles.reminderCard}>
                <Text style={styles.reminderText}>
                  ¡Hey! Aún no has registrado tu gratitud hoy 🌈
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.gratitudeActionButton}
              onPress={() => navigation.navigate('GratitudeEntry')}
            >
              <View style={styles.gratitudeButtonIcon}>
                <Text style={styles.gratitudeButtonIconText}>💭</Text>
              </View>
              <View style={styles.gratitudeButtonContent}>
                <Text style={styles.gratitudeButtonTitle}>Escribir mi gratitud</Text>
                <Text style={styles.gratitudeButtonSubtitle}>Reflexiona sobre lo bueno</Text>
              </View>
              <View style={styles.gratitudeButtonArrow}>
                <Text style={styles.gratitudeButtonArrowText}>→</Text>
              </View>
            </TouchableOpacity>
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
    padding: modernTheme.spacing.padding,
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginLarge,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: modernTheme.spacing.marginLarge,
    width: '100%',
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 55,
    height: 65,
    borderRadius: modernTheme.borderRadius.medium,
    marginHorizontal: 2,
    paddingVertical: modernTheme.spacing.paddingTiny,
    ...modernTheme.shadows.small,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 3,
  },
  moodLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: modernTheme.colors.chartBackground,
    textAlign: 'center',
    paddingHorizontal: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  pathCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    padding: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
    marginBottom: modernTheme.spacing.marginMedium,
    flex: 1,
    marginHorizontal: 5,
    ...modernTheme.shadows.small,
  },
  pathTitle: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  emptyText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    marginVertical: modernTheme.spacing.marginMedium,
  },
  reminderCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginMedium,
    borderColor: modernTheme.colors.pastelYellow,
    borderWidth: 2,
    alignItems: 'center',
    ...modernTheme.shadows.small,
  },
  reminderText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
  },
  button: {
    padding: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
    alignItems: 'center',
    marginVertical: modernTheme.spacing.marginSmall,
    width: '90%',
    ...modernTheme.shadows.small,
  },
  primaryButton: {
    backgroundColor: modernTheme.colors.turquoise,
  },
  secondaryButton: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderWidth: 2,
    borderColor: modernTheme.colors.turquoise,
  },
  coralButton: {
    backgroundColor: modernTheme.colors.coral,
  },
  buttonText: {
    fontSize: modernTheme.fontSizes.label,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: modernTheme.colors.chartBackground,
  },
  secondaryButtonText: {
    color: modernTheme.colors.turquoise,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginLarge,
    paddingVertical: modernTheme.spacing.paddingSmall,
  },
  greetingMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  greetingMain: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginRight: modernTheme.spacing.marginSmall,
  },
  greetingEmoji: {
    fontSize: modernTheme.fontSizes.title,
  },
  greetingSubtext: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: modernTheme.spacing.paddingMedium,
  },
  teacherSection: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  sectionLabel: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
    textAlign: 'center',
  },
  actionCardsContainer: {
    gap: modernTheme.spacing.marginMedium,
  },
  actionCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    padding: modernTheme.spacing.paddingLarge,
    borderRadius: modernTheme.borderRadius.large,
    flexDirection: 'row',
    alignItems: 'center',
    ...modernTheme.shadows.medium,
    borderWidth: 1,
    borderColor: modernTheme.colors.lavender,
  },
  primaryActionCard: {
    backgroundColor: modernTheme.colors.turquoise,
    borderColor: modernTheme.colors.turquoise,
  },
  secondaryActionCard: {
    backgroundColor: modernTheme.colors.coral,
    borderColor: modernTheme.colors.coral,
  },
  studentActionCardCompact: {
    backgroundColor: modernTheme.colors.coral,
    borderColor: modernTheme.colors.coral,
    padding: modernTheme.spacing.paddingSmall,
  },
  cardIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: modernTheme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.marginMedium,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: modernTheme.fontSizes.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardArrow: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArrowText: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
  },
  studentSection: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  moodSection: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  moodHeaderContainer: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  moodTitle: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  moodSubtitle: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  moodGridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  moodActionContainer: {
    alignItems: 'center',
  },
  historyButtonCompact: {
    backgroundColor: modernTheme.colors.chartBackground,
    padding: modernTheme.spacing.paddingSmall,
    borderRadius: modernTheme.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    borderWidth: 2,
    borderColor: modernTheme.colors.turquoise,
    ...modernTheme.shadows.small,
  },
  historyButtonIconSmall: {
    width: 32,
    height: 32,
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.marginSmall,
  },
  historyButtonIconTextSmall: {
    fontSize: 16,
  },
  historyButtonContent: {
    flex: 1,
  },
  historyButtonTitleSmall: {
    fontSize: modernTheme.fontSizes.caption,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: 2,
  },
  historyButtonSubtitleSmall: {
    fontSize: modernTheme.fontSizes.smallLabel,
    color: modernTheme.colors.secondaryText,
  },
  historyButtonArrowSmall: {
    width: 30,
    height: 30,
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyButtonArrowTextSmall: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
  },
  learningSection: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  learningHeaderContainer: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  learningTitle: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  learningSubtitle: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  pathColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  modernPathCard: {
    padding: modernTheme.spacing.paddingSmall,
    borderRadius: modernTheme.borderRadius.medium,
    marginBottom: modernTheme.spacing.marginSmall,
    flex: 1,
    marginHorizontal: 5,
    minHeight: 120,
    ...modernTheme.shadows.medium,
  },
  pathCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  pathIconContainer: {
    width: 35,
    height: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathIcon: {
    fontSize: 18,
  },
  pathCardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: modernTheme.spacing.paddingSmall,
    paddingVertical: 4,
    borderRadius: modernTheme.borderRadius.small,
  },
  pathCardBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
  },
  pathCardContent: {
    flex: 1,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  modernPathTitle: {
    fontSize: modernTheme.fontSizes.caption,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  modernPathDescription: {
    fontSize: modernTheme.fontSizes.smallLabel,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 14,
  },
  pathCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pathProgressContainer: {
    flex: 1,
    marginRight: modernTheme.spacing.marginSmall,
  },
  pathProgressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: modernTheme.borderRadius.small,
    height: 4,
    marginBottom: 2,
  },
  pathProgress: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.small,
    height: '100%',
  },
  pathProgressText: {
    fontSize: modernTheme.fontSizes.smallLabel,
    fontWeight: '600',
    color: modernTheme.colors.chartBackground,
  },
  pathArrowContainer: {
    width: 24,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathArrowText: {
    fontSize: 12,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
  },
  emptyPathsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPathsEmoji: {
    fontSize: 48,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  emptyPathsTitle: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  emptyPathsText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: modernTheme.spacing.paddingMedium,
  },
  exploreMoreContainer: {
    alignItems: 'center',
    marginTop: modernTheme.spacing.marginXLarge,
  },
  exploreMoreButtonCompact: {
    backgroundColor: modernTheme.colors.turquoise,
    padding: modernTheme.spacing.paddingSmall,
    borderRadius: modernTheme.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    ...modernTheme.shadows.small,
  },
  exploreMoreIconSmall: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.marginSmall,
  },
  exploreMoreIconTextSmall: {
    fontSize: 20,
  },
  exploreMoreContent: {
    flex: 1,
  },
  exploreMoreTitleSmall: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
  },
  exploreMoreArrowSmall: {
    width: 30,
    height: 30,
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exploreMoreArrowTextSmall: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
  },
  cardIconSmall: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: modernTheme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.marginMedium,
  },
  cardIconTextSmall: {
    fontSize: 24,
  },
  cardTitleSmall: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
    marginBottom: 2,
  },
  cardSubtitleSmall: {
    fontSize: modernTheme.fontSizes.caption,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardArrowSmall: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardArrowTextSmall: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
  },
  gratitudeSection: {
    marginBottom: modernTheme.spacing.marginXLarge,
    alignItems: 'center',
  },
  gratitudeHeaderContainer: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  gratitudeTitle: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  gratitudeSubtitle: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  reminderCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginMedium,
    borderColor: modernTheme.colors.pastelYellow,
    borderWidth: 2,
    alignItems: 'center',
    ...modernTheme.shadows.small,
  },
  gratitudeActionButton: {
    backgroundColor: modernTheme.colors.turquoise,
    padding: modernTheme.spacing.paddingSmall,
    borderRadius: modernTheme.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    ...modernTheme.shadows.small,
  },
  gratitudeButtonIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.marginSmall,
  },
  gratitudeButtonIconText: {
    fontSize: 20,
  },
  gratitudeButtonContent: {
    flex: 1,
  },
  gratitudeButtonTitle: {
    fontSize: modernTheme.fontSizes.caption,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
    marginBottom: 2,
  },
  gratitudeButtonSubtitle: {
    fontSize: modernTheme.fontSizes.smallLabel,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  gratitudeButtonArrow: {
    width: 30,
    height: 30,
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gratitudeButtonArrowText: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '700',
    color: modernTheme.colors.chartBackground,
  },
});

export default DashboardScreen;