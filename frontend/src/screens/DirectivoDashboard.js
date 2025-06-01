import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';
import modernTheme from './modernTheme';

const DirectivoDashboard = ({ navigation }) => {
  const { user } = useAuth();
  const [climaEmocional, setClimaEmocional] = useState(null);
  const [loadingClima, setLoadingClima] = useState(false);

  // Función para obtener el clima emocional diario
  const obtenerClimaEmocional = async () => {
    try {
      setLoadingClima(true);
      const response = await axios.get(
        `${config.API_BASE_URL}/directivo/clima-emocional-diario`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      
      setClimaEmocional(response.data.data);
      console.log('Clima emocional obtenido:', response.data.data);
    } catch (error) {
      console.error('Error obteniendo clima emocional:', error);
      Alert.alert(
        '❌ Error',
        'No se pudo obtener el clima emocional',
        [{ text: 'Entendido', style: 'default' }]
      );
    } finally {
      setLoadingClima(false);
    }
  };

  // Cargar datos al iniciar
  useEffect(() => {
    obtenerClimaEmocional();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Buenos días';
    if (hour < 18) return '☀️ Buenas tardes';
    return '🌙 Buenas noches';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header de bienvenida */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.welcomeText}>
          ¡Hola, {user?.name || 'Director'}! 👋
        </Text>
        <Text style={styles.subtitle}>
          Bienvenido al panel de dirección escolar
        </Text>
        

      </View>

      {/* Tarjeta de Clima Emocional Simplificada */}
      <TouchableOpacity 
        style={styles.climaCardSimple}
        onPress={() => navigation.navigate('AnalisisDetallado')}
        disabled={loadingClima}
      >
        <View style={styles.climaHeaderSimple}>
          <Text style={styles.climaIcon}>📊</Text>
          <Text style={styles.climaTitleSimple}>Clima Emocional de Hoy</Text>
          <Text style={styles.verMasIcon}>👁️</Text>
        </View>
        
        {loadingClima ? (
          <View style={styles.loadingContainerSimple}>
            <ActivityIndicator size="small" color={modernTheme.colors.turquoise} />
            <Text style={styles.loadingTextSimple}>Cargando...</Text>
          </View>
        ) : climaEmocional ? (
          climaEmocional.suficientesRegistros ? (
            <View style={styles.climaIndicadorSimple}>
              <Text style={styles.climaEmojiSimple}>{climaEmocional.clima.emoji}</Text>
              <View style={styles.climaInfoSimple}>
                <Text style={styles.climaEstadoSimple}>{climaEmocional.clima.climaGeneral}</Text>
                <Text style={styles.climaPuntuacionSimple}>
                  {climaEmocional.clima.puntuacion}/5.0 • {climaEmocional.totalRegistros} registros
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.climaIndicadorSimple}>
              <Text style={styles.climaEmojiSimple}>🔒</Text>
              <View style={styles.climaInfoSimple}>
                <Text style={styles.climaEstadoSimple}>Datos insuficientes</Text>
                <Text style={styles.climaPuntuacionSimple}>
                  {climaEmocional.totalRegistros}/{climaEmocional.minimoRequerido} registros
                </Text>
              </View>
            </View>
          )
        ) : (
          <View style={styles.climaIndicadorSimple}>
            <Text style={styles.climaEmojiSimple}>⚠️</Text>
            <View style={styles.climaInfoSimple}>
              <Text style={styles.climaEstadoSimple}>Error de carga</Text>
              <Text style={styles.climaPuntuacionSimple}>Toca para reintentar</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Nueva tarjeta: Análisis por Curso */}
      <TouchableOpacity 
        style={styles.analisisCursoCard}
        onPress={() => navigation.navigate('AnalisisPorCurso')}
      >
        <View style={styles.analisisCursoHeader}>
          <Text style={styles.analisisCursoIcon}>🏫</Text>
          <Text style={styles.analisisCursoTitle}>Análisis por Curso</Text>
          <Text style={styles.verMasIcon}>→</Text>
        </View>
        <Text style={styles.analisisCursoSubtitle}>
          Ve el clima emocional específico de cada curso en tu escuela
        </Text>
        <View style={styles.analisisHints}>
          <Text style={styles.analisisHint}>📚 Por materia</Text>
          <Text style={styles.analisisHint}>👥 Por profesor</Text>
          <Text style={styles.analisisHint}>📊 Con métricas</Text>
        </View>
      </TouchableOpacity>

      {/* Resumen Ejecutivo */}
      {climaEmocional && climaEmocional.suficientesRegistros && (
        <View style={styles.resumenEjecutivoCard}>
          <View style={styles.resumenHeader}>
            <Text style={styles.resumenIcon}>📋</Text>
            <Text style={styles.resumenTitle}>Resumen Ejecutivo</Text>
          </View>
          
          <View style={styles.resumenContent}>
            <View style={styles.resumenMetrica}>
              <Text style={styles.resumenMetricaLabel}>Estado actual</Text>
              <Text style={styles.resumenMetricaValor}>
                {climaEmocional.clima.climaGeneral} {climaEmocional.clima.emoji}
              </Text>
            </View>
            
            <View style={styles.resumenMetrica}>
              <Text style={styles.resumenMetricaLabel}>Puntuación hoy</Text>
              <Text style={styles.resumenMetricaValor}>
                {climaEmocional.clima.puntuacion}/5.0
              </Text>
            </View>
            
            <View style={styles.resumenMetrica}>
              <Text style={styles.resumenMetricaLabel}>Participación hoy</Text>
              <Text style={styles.resumenMetricaValor}>
                {climaEmocional.totalRegistros} estudiantes
              </Text>
            </View>
            
            <View style={styles.resumenMetrica}>
              <Text style={styles.resumenMetricaLabel}>Emoción principal</Text>
              <Text style={styles.resumenMetricaValor}>
                {climaEmocional.clima.emocionesPredominantes[0]?.emocion || 'N/A'}
              </Text>
            </View>
          </View>
          
          {/* Recomendaciones */}
          <View style={styles.resumenRecomendaciones}>
            <Text style={styles.recomendacionesTitle}>🎯 Recomendaciones</Text>
            {climaEmocional.clima.puntuacion >= 4.0 ? (
              <Text style={styles.recomendacionItem}>
                ✅ Excelente clima emocional. Continúa con las estrategias actuales.
              </Text>
            ) : climaEmocional.clima.puntuacion >= 3.0 ? (
              <Text style={styles.recomendacionItem}>
                📈 Clima positivo. Considera actividades para mantener el bienestar.
              </Text>
            ) : (
              <Text style={styles.recomendacionItem}>
                ⚠️ Clima que requiere atención. Evalúa implementar programas de apoyo.
              </Text>
            )}
            
            <Text style={styles.recomendacionItem}>
              💡 Toca "Clima Emocional de Hoy" para ver análisis detallado y tendencias.
            </Text>
          </View>
        </View>
      )}

      {/* Próximas funcionalidades */}
      <View style={styles.comingSoonCard}>
        <Text style={styles.comingSoonTitle}>🚀 Próximamente</Text>
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏫</Text>
            <Text style={styles.featureText}>Análisis por escuela</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureText}>Reportes ejecutivos</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔔</Text>
            <Text style={styles.featureText}>Alertas inteligentes</Text>
          </View>
        </View>
      </View>

      {/* Información del usuario */}
      <View style={styles.userInfoCard}>
        <Text style={styles.userInfoTitle}>👤 Información de la sesión</Text>
        <View style={styles.userInfoContent}>
          <Text style={styles.userInfoItem}>
            <Text style={styles.userInfoLabel}>Nombre:</Text> {user?.name}
          </Text>
          <Text style={styles.userInfoItem}>
            <Text style={styles.userInfoLabel}>Email:</Text> {user?.email}
          </Text>
          <Text style={styles.userInfoItem}>
            <Text style={styles.userInfoLabel}>Rol:</Text> {user?.role}
          </Text>
        </View>
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
  header: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  greeting: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  welcomeText: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.turquoise,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  subtitle: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.turquoise,
    ...modernTheme.shadows.medium,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: modernTheme.spacing.marginMedium,
  },
  statusTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
  },
  statusDescription: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    marginBottom: modernTheme.spacing.marginLarge,
    lineHeight: 22,
  },
  testButton: {
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    ...modernTheme.shadows.small,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  testResult: {
    backgroundColor: modernTheme.colors.primaryBackground,
    borderRadius: modernTheme.borderRadius.small,
    padding: modernTheme.spacing.paddingMedium,
    marginTop: modernTheme.spacing.marginMedium,
    borderWidth: 1,
    borderColor: modernTheme.colors.turquoise,
  },
  testResultTitle: {
    fontSize: modernTheme.fontSizes.label,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  testResultText: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  comingSoonCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.coral,
    ...modernTheme.shadows.medium,
  },
  comingSoonTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  featuresList: {
    gap: modernTheme.spacing.marginMedium,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 20,
    marginRight: modernTheme.spacing.marginMedium,
  },
  featureText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    flex: 1,
  },
  userInfoCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.lavender,
    ...modernTheme.shadows.medium,
  },
  userInfoTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  userInfoContent: {
    gap: modernTheme.spacing.marginSmall,
  },
  userInfoItem: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    lineHeight: 22,
  },
  userInfoLabel: {
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
  },
  // Estilos para el botón de logout temporal
  logoutButton: {
    backgroundColor: modernTheme.colors.coral,
    borderRadius: modernTheme.borderRadius.medium,
    paddingHorizontal: modernTheme.spacing.paddingMedium,
    paddingVertical: modernTheme.spacing.paddingSmall,
    marginTop: modernTheme.spacing.marginMedium,
    alignSelf: 'center',
    ...modernTheme.shadows.small,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // Estilos para la tarjeta de clima emocional simplificada
  climaCardSimple: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.turquoise,
    ...modernTheme.shadows.medium,
  },
  climaHeaderSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  climaTitleSimple: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    flex: 1,
    marginLeft: modernTheme.spacing.marginMedium,
  },
  verMasIcon: {
    fontSize: 20,
    color: modernTheme.colors.turquoise,
  },
  loadingContainerSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: modernTheme.spacing.paddingMedium,
  },
  loadingTextSimple: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    marginLeft: modernTheme.spacing.marginSmall,
  },
  climaIndicadorSimple: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  climaEmojiSimple: {
    fontSize: 32,
    marginRight: modernTheme.spacing.marginMedium,
  },
  climaInfoSimple: {
    flex: 1,
  },
  climaEstadoSimple: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  climaPuntuacionSimple: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
  },
  climaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  climaIcon: {
    fontSize: 24,
    marginRight: modernTheme.spacing.marginMedium,
  },
  climaTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    flex: 1,
  },
  refreshButton: {
    padding: modernTheme.spacing.paddingSmall,
    borderRadius: modernTheme.borderRadius.small,
    backgroundColor: modernTheme.colors.turquoise,
  },
  refreshIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: modernTheme.spacing.paddingLarge,
  },
  loadingText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    marginTop: modernTheme.spacing.marginMedium,
  },
  climaContent: {
    alignItems: 'center',
  },
  climaMainIndicator: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginLarge,
  },
  climaEmoji: {
    fontSize: 48,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  climaEstado: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  climaPuntuacion: {
    fontSize: modernTheme.fontSizes.title,
    color: modernTheme.colors.turquoise,
    fontWeight: '600',
  },
  climaStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: modernTheme.spacing.marginLarge,
    paddingHorizontal: modernTheme.spacing.paddingMedium,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginTiny,
  },
  statLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  climaFecha: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    fontStyle: 'italic',
  },
  privacyContainer: {
    alignItems: 'center',
    paddingVertical: modernTheme.spacing.paddingLarge,
  },
  privacyIcon: {
    fontSize: 32,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  privacyTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  privacyMessage: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  privacyCount: {
    fontSize: modernTheme.fontSizes.label,
    color: modernTheme.colors.coral,
    fontWeight: 'bold',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: modernTheme.spacing.paddingLarge,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  errorText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  // Estilos para la tarjeta de tendencias de 7 días
  tendenciasCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.coral,
    ...modernTheme.shadows.medium,
  },
  tendenciasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  tendenciasIcon: {
    fontSize: 24,
    marginRight: modernTheme.spacing.marginMedium,
  },
  tendenciasTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    flex: 1,
  },
  tendenciasContent: {
    alignItems: 'center',
  },
  tendenciasResumen: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginLarge,
  },
  tendenciasEstado: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  tendenciasPuntuacion: {
    fontSize: modernTheme.fontSizes.title,
    color: modernTheme.colors.coral,
    fontWeight: '600',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  tendenciasPeriodo: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    fontStyle: 'italic',
  },
  tendenciasGrafico: {
    width: '100%',
    marginBottom: modernTheme.spacing.marginLarge,
  },
  graficoTitulo: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  barrasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: modernTheme.spacing.paddingMedium,
  },
  barraItem: {
    alignItems: 'center',
    flex: 1,
  },
  barraWrapper: {
    height: 60,
    justifyContent: 'flex-end',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  barra: {
    width: 20,
    borderRadius: modernTheme.borderRadius.small,
    minHeight: 10,
  },
  barraEmoji: {
    fontSize: 16,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  barraDia: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    fontWeight: 'bold',
    marginBottom: modernTheme.spacing.marginTiny,
  },
  barraPuntuacion: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.primaryText,
    fontWeight: '600',
  },
  tendenciasStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: modernTheme.spacing.paddingMedium,
  },
  statDestacada: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
    borderRadius: modernTheme.borderRadius.small,
    padding: modernTheme.spacing.paddingMedium,
    marginHorizontal: modernTheme.spacing.marginSmall,
  },
  statDestacadaIcon: {
    fontSize: 20,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  statDestacadaLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginTiny,
  },
  statDestacadaValor: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
  },
  // Estilos para el header mejorado
  refreshInfo: {
    alignItems: 'center',
    marginTop: modernTheme.spacing.marginLarge,
  },
  refreshAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.chartBackground,
    paddingHorizontal: modernTheme.spacing.paddingMedium,
    paddingVertical: modernTheme.spacing.paddingSmall,
    borderRadius: modernTheme.borderRadius.medium,
    marginBottom: modernTheme.spacing.marginSmall,
    ...modernTheme.shadows.small,
  },
  refreshAllIcon: {
    fontSize: 16,
    marginRight: modernTheme.spacing.marginSmall,
  },
  refreshAllText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.primaryText,
    fontWeight: '600',
  },
  lastRefreshText: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    fontStyle: 'italic',
  },
  // Estilos para distribución de clima emocional
  climaDistribucion: {
    width: '100%',
    marginTop: modernTheme.spacing.marginLarge,
    paddingTop: modernTheme.spacing.paddingMedium,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.primaryBackground,
  },
  distribucionTitulo: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
    textAlign: 'center',
  },
  distribucionBarras: {
    gap: modernTheme.spacing.marginSmall,
  },
  distribucionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginTiny,
  },
  distribucionBarra: {
    height: 8,
    borderRadius: 4,
    marginRight: modernTheme.spacing.marginSmall,
    minWidth: 20,
  },
  distribucionLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    flex: 1,
  },
  // Estilos para insights de tendencias
  tendenciasInsights: {
    width: '100%',
    marginTop: modernTheme.spacing.marginMedium,
    paddingTop: modernTheme.spacing.paddingMedium,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.primaryBackground,
  },
  insightsTitle: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
    textAlign: 'center',
  },
  insightsList: {
    gap: modernTheme.spacing.marginSmall,
  },
  insightItem: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    lineHeight: 18,
    paddingLeft: modernTheme.spacing.paddingSmall,
  },
  // Estilos para resumen ejecutivo
  resumenEjecutivoCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.yellow,
    ...modernTheme.shadows.medium,
  },
  resumenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  resumenIcon: {
    fontSize: 24,
    marginRight: modernTheme.spacing.marginMedium,
  },
  resumenTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
  },
  resumenContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.marginLarge,
  },
  resumenMetrica: {
    width: '48%',
    backgroundColor: modernTheme.colors.primaryBackground,
    borderRadius: modernTheme.borderRadius.small,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginMedium,
    alignItems: 'center',
  },
  resumenMetricaLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginBottom: modernTheme.spacing.marginTiny,
    textAlign: 'center',
  },
  resumenMetricaValor: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
  },
  resumenRecomendaciones: {
    paddingTop: modernTheme.spacing.paddingMedium,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.primaryBackground,
  },
  recomendacionesTitle: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  recomendacionItem: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    lineHeight: 18,
    marginBottom: modernTheme.spacing.marginSmall,
    paddingLeft: modernTheme.spacing.paddingSmall,
  },
  // Estilos para la nueva tarjeta: Análisis por Curso
  analisisCursoCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginXLarge,
    borderLeftWidth: 4,
    borderLeftColor: modernTheme.colors.turquoise,
    ...modernTheme.shadows.medium,
  },
  analisisCursoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  analisisCursoIcon: {
    fontSize: 24,
    marginRight: modernTheme.spacing.marginMedium,
  },
  analisisCursoTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    flex: 1,
  },
  analisisCursoSubtitle: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  analisisHints: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  analisisHint: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
  },
});

export default DirectivoDashboard; 