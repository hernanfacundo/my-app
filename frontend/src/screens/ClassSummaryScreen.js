import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import modernTheme from './modernTheme';

const ClassSummaryScreen = ({ route, navigation }) => {
  const { classId, className } = route.params;
  const { user } = useAuth();
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassAnalysis();
  }, []);

  const loadClassAnalysis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${config.API_BASE_URL}/classes/${classId}/analysis`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      setAnalysisData(response.data);
    } catch (error) {
      console.error('Error al cargar análisis:', error);
      Alert.alert('Error', 'No se pudo cargar el análisis de la clase');
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'HIGH': return '#FF6B6B';
      case 'MEDIUM': return '#FFD93D';
      case 'LOW': return '#6BCF7F';
      default: return modernTheme.colors.secondaryText;
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'HIGH': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'LOW': return '🟢';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={modernTheme.colors.turquoise} />
        <Text style={styles.loadingText}>Cargando análisis...</Text>
      </View>
    );
  }

  if (!analysisData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>No se pudo cargar el análisis</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadClassAnalysis}>
          <Text style={styles.retryButtonText}>🔄 Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{className}</Text>
        <Text style={styles.subtitle}>Resumen de la clase</Text>
      </View>

      {/* Estadísticas generales */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>📊 Estadísticas Generales</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{analysisData.classSize}</Text>
            <Text style={styles.statLabel}>👥 Estudiantes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{analysisData.moodAnalysis?.total || 0}</Text>
            <Text style={styles.statLabel}>😊 Estados de ánimo</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{analysisData.gratitudeAnalysis?.total || 0}</Text>
            <Text style={styles.statLabel}>🙏 Entradas de gratitud</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{analysisData.gratitudeAnalysis?.studentsWithGratitude || 0}</Text>
            <Text style={styles.statLabel}>✨ Practicando gratitud</Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      {analysisData.insights && (
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>💡 Insights de la Clase</Text>
          <View style={styles.insightsCard}>
            <Text style={styles.insightsText}>{analysisData.insights}</Text>
          </View>
        </View>
      )}

      {/* Alertas Críticas */}
      {(() => {
        // Filtrar solo alertas rojas (HIGH)
        const highAlerts = analysisData.alerts?.filter(alert => alert.severity === 'HIGH') || [];
        
        // Agrupar por estudiante y tomar solo la más reciente de cada uno
        const alertsByStudent = {};
        highAlerts.forEach(alert => {
          if (alert.studentId) {
            const studentId = alert.studentId._id || alert.studentId;
            const studentName = alert.studentId.name || alert.studentId;
            
            if (!alertsByStudent[studentId] || new Date(alert.createdAt) > new Date(alertsByStudent[studentId].createdAt)) {
              alertsByStudent[studentId] = {
                ...alert,
                studentName: studentName
              };
            }
          }
        });
        
        const uniqueHighAlerts = Object.values(alertsByStudent);
        
        return uniqueHighAlerts.length > 0 && (
          <View style={styles.alertsContainer}>
            <Text style={styles.sectionTitle}>🚨 Alertas Críticas ({uniqueHighAlerts.length})</Text>
            <Text style={styles.alertsSubtitle}>Solo se muestran alertas de alta prioridad, una por estudiante</Text>
            {uniqueHighAlerts.map((alert, index) => (
              <View 
                key={index} 
                style={[
                  styles.alertCard,
                  { borderLeftColor: '#FF6B6B' }
                ]}
              >
                <View style={styles.alertHeader}>
                  <View style={styles.alertHeaderLeft}>
                    <Text style={styles.alertIcon}>🔴</Text>
                    <Text style={styles.alertSeverity}>CRÍTICA</Text>
                  </View>
                  <Text style={styles.alertDate}>
                    {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : 'Reciente'}
                  </Text>
                </View>
                <Text style={styles.alertDescription}>{alert.description}</Text>
                <Text style={styles.alertStudent}>Estudiante: {alert.studentName}</Text>
              </View>
            ))}
          </View>
        );
      })()}

      {/* Sin alertas críticas */}
      {(() => {
        const highAlerts = analysisData.alerts?.filter(alert => alert.severity === 'HIGH') || [];
        return highAlerts.length === 0 && (
          <View style={styles.noAlertsContainer}>
            <Text style={styles.noAlertsEmoji}>✅</Text>
            <Text style={styles.noAlertsTitle}>¡Todo bien!</Text>
            <Text style={styles.noAlertsText}>No hay alertas críticas en esta clase</Text>
          </View>
        );
      })()}

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryAction]}
          onPress={() => loadClassAnalysis()}
        >
          <Text style={styles.actionButtonText}>🔄 Actualizar análisis</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingVertical: modernTheme.spacing.paddingXLarge,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  loadingText: {
    marginTop: modernTheme.spacing.marginMedium,
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.primaryBackground,
    paddingHorizontal: modernTheme.spacing.paddingLarge,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: modernTheme.spacing.marginLarge,
  },
  errorTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  retryButton: {
    backgroundColor: modernTheme.colors.turquoise,
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingVertical: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  header: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  backButtonText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.turquoise,
    fontWeight: '600',
  },
  title: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  subtitle: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
  },
  sectionTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  statsContainer: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: modernTheme.spacing.marginMedium,
  },
  statCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    width: '47%',
    ...modernTheme.shadows.small,
  },
  statNumber: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.turquoise,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  statLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  insightsContainer: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  insightsCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.turquoise,
    ...modernTheme.shadows.small,
  },
  insightsText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.primaryText,
    lineHeight: 22,
  },
  alertsContainer: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  alertsSubtitle: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginBottom: modernTheme.spacing.marginMedium,
    fontStyle: 'italic',
  },
  alertCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginMedium,
    borderLeftWidth: 4,
    ...modernTheme.shadows.small,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertIcon: {
    fontSize: 20,
    marginRight: modernTheme.spacing.marginSmall,
  },
  alertSeverity: {
    fontSize: modernTheme.fontSizes.caption,
    fontWeight: 'bold',
    color: modernTheme.colors.secondaryText,
    textTransform: 'uppercase',
  },
  alertDate: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    fontStyle: 'italic',
  },
  alertDescription: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  alertStudent: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    fontStyle: 'italic',
  },
  noAlertsContainer: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingXLarge,
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: '#6BCF7F',
    ...modernTheme.shadows.small,
  },
  noAlertsEmoji: {
    fontSize: 48,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  noAlertsTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  noAlertsText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: modernTheme.spacing.marginMedium,
  },
  actionButton: {
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    ...modernTheme.shadows.small,
  },
  primaryAction: {
    backgroundColor: modernTheme.colors.turquoise,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
});

export default ClassSummaryScreen; 