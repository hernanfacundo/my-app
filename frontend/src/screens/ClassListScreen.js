// ./src/screens/ClassListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity,
  FlatList, Alert, StyleSheet, ScrollView, RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import modernTheme from './modernTheme';
import config from '../config';

const ClassListScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadClasses = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
      
      Alert.alert('Error al cargar 📚', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const viewClassAnalysis = async (classId, className) => {
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
          `Se han detectado ${highAlerts.length} situaciones que requieren atención inmediata en "${className}":\n\n` +
          highAlerts.map(alert => `• ${alert.description} (${alert.studentId.name})`).join('\n\n'),
          [
            {
              text: 'Ver Análisis Completo',
              onPress: () => showFullAnalysis(response.data, className)
            },
            { text: 'Cerrar', style: 'cancel' }
          ]
        );
      } else {
        // Si no hay alertas críticas, mostrar el análisis directamente
        showFullAnalysis(response.data, className);
      }
    } catch (error) {
      console.error('Error al obtener análisis:', error);
      Alert.alert('Error de análisis 📊', 'No se pudo obtener el análisis de la clase. ¿Intentas de nuevo?');
    } finally {
      setLoading(false);
    }
  };

  const showFullAnalysis = (data, className) => {
    const alertSummary = data.alerts.length > 0 
      ? '\n\n🚨 Alertas Activas:\n' + data.alerts
          .map(a => `• ${a.severity === 'HIGH' ? '🔴' : a.severity === 'MEDIUM' ? '🟡' : '🟢'} ${a.description}`)
          .join('\n')
      : '\n\n✅ No hay alertas activas';

    Alert.alert(
      `📊 Análisis de "${className}"`,
      data.insights + alertSummary,
      [
        {
          text: '📈 Ver Estadísticas',
          onPress: () => {
            Alert.alert(
              '📈 Estadísticas Detalladas',
              `👥 Tamaño de la clase: ${data.classSize} estudiantes\n\n` +
              `😊 Estados de ánimo registrados: ${data.moodAnalysis.total}\n` +
              `🙏 Entradas de gratitud: ${data.gratitudeAnalysis.total}\n` +
              `✨ Estudiantes practicando gratitud: ${data.gratitudeAnalysis.studentsWithGratitude}`
            );
          }
        },
        { text: 'Cerrar', style: 'cancel' }
      ]
    );
  };

  const onRefresh = () => {
    loadClasses(true);
  };

  const getClassIcon = (index) => {
    const icons = ['📚', '🎓', '📖', '✏️', '🧮', '🔬', '🎨', '🌍', '📝', '💡'];
    return icons[index % icons.length];
  };

  const getClassColor = (index) => {
    const colors = [
      modernTheme.colors.turquoise,
      modernTheme.colors.coral,
      modernTheme.colors.pastelYellow,
      modernTheme.colors.lavender
    ];
    return colors[index % colors.length];
  };

  const renderClassCard = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.classCard,
        { borderLeftColor: getClassColor(index) }
      ]}
      onPress={() => user?.role === 'teacher' ? viewClassAnalysis(item._id, item.name) : null}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.classIcon}>{getClassIcon(index)}</Text>
        <View style={styles.classInfo}>
          <Text style={styles.className}>{item.name}</Text>
          {item.description && (
            <Text style={styles.classDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        {user?.role === 'teacher' && (
          <Text style={styles.analysisArrow}>📊</Text>
        )}
      </View>
      
      {user?.role === 'teacher' && (
        <View style={styles.cardFooter}>
          <View style={styles.codeContainer}>
            <Text style={styles.codeLabel}>Código:</Text>
            <Text style={styles.classCode}>{item.code}</Text>
          </View>
          <Text style={styles.tapHint}>Toca para ver análisis</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>
        {user?.role === 'teacher' ? '👩‍🏫' : '🎓'}
      </Text>
      <Text style={styles.emptyTitle}>
        {user?.role === 'teacher' 
          ? '¡Crea tu primera clase!'
          : '¡Únete a una clase!'}
      </Text>
      <Text style={styles.emptyMessage}>
        {user?.role === 'teacher' 
          ? 'Comienza a conectar con tus estudiantes y monitorear su bienestar emocional'
          : 'Pide el código a tu profesor y comienza tu viaje de aprendizaje emocional'}
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate(user?.role === 'teacher' ? 'CreateClass' : 'JoinClass')}
      >
        <Text style={styles.emptyButtonText}>
          {user?.role === 'teacher' ? '🚀 Crear clase' : '🎯 Unirse a clase'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadClasses();
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Header moderno */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>
          {user?.role === 'teacher' ? '👩‍🏫' : '🎓'}
        </Text>
        <Text style={styles.title}>
          {user?.role === 'teacher' ? 'Mis Clases' : 'Mis Clases'}
        </Text>
        <Text style={styles.subtitle}>
          {user?.role === 'teacher' 
            ? 'Gestiona y analiza tus clases'
            : 'Tus clases inscritas'}
        </Text>
      </View>

      {/* Botones de acción rápida */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: modernTheme.colors.turquoise }]}
          onPress={() => navigation.navigate(user?.role === 'teacher' ? 'CreateClass' : 'JoinClass')}
        >
          <Text style={styles.actionButtonEmoji}>
            {user?.role === 'teacher' ? '➕' : '🔗'}
          </Text>
          <Text style={styles.actionButtonText}>
            {user?.role === 'teacher' ? 'Crear clase' : 'Unirse a clase'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: modernTheme.colors.coral }]}
          onPress={() => loadClasses()}
        >
          <Text style={styles.actionButtonEmoji}>🔄</Text>
          <Text style={styles.actionButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de clases */}
      <FlatList
        data={classes}
        keyExtractor={item => item._id}
        renderItem={renderClassCard}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[modernTheme.colors.turquoise]}
            tintColor={modernTheme.colors.turquoise}
          />
        }
        contentContainerStyle={classes.length === 0 ? styles.emptyListContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Footer informativo */}
      {classes.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {user?.role === 'teacher' 
              ? '💡 Tip: Toca una clase para ver el análisis emocional de tus estudiantes'
              : '📚 Tienes acceso a todas las funciones de bienestar emocional'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingTop: modernTheme.spacing.paddingXLarge,
    paddingBottom: modernTheme.spacing.paddingMedium,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  title: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  subtitle: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingBottom: modernTheme.spacing.paddingMedium,
    gap: modernTheme.spacing.marginMedium,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
    ...modernTheme.shadows.small,
  },
  actionButtonEmoji: {
    fontSize: 20,
    marginRight: modernTheme.spacing.marginSmall,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.label,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: modernTheme.spacing.paddingLarge,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
  },
  classCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginMedium,
    borderLeftWidth: 4,
    ...modernTheme.shadows.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  classIcon: {
    fontSize: 24,
    marginRight: modernTheme.spacing.marginMedium,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  classDescription: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    lineHeight: 18,
  },
  analysisArrow: {
    fontSize: 20,
    color: modernTheme.colors.turquoise,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: modernTheme.spacing.marginMedium,
    paddingTop: modernTheme.spacing.marginMedium,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.primaryBackground,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginRight: modernTheme.spacing.marginSmall,
  },
  classCode: {
    fontSize: modernTheme.fontSizes.label,
    fontWeight: 'bold',
    color: modernTheme.colors.turquoise,
    backgroundColor: modernTheme.colors.primaryBackground,
    paddingHorizontal: modernTheme.spacing.marginSmall,
    paddingVertical: modernTheme.spacing.marginTiny,
    borderRadius: modernTheme.borderRadius.small,
  },
  tapHint: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.coral,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: modernTheme.spacing.paddingXLarge,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: modernTheme.spacing.marginLarge,
  },
  emptyTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  emptyMessage: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: modernTheme.spacing.marginXLarge,
    paddingHorizontal: modernTheme.spacing.paddingMedium,
  },
  emptyButton: {
    backgroundColor: modernTheme.colors.turquoise,
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingVertical: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
    ...modernTheme.shadows.medium,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingVertical: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
  },
  footerText: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default ClassListScreen;
