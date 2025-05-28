import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';
import modernTheme from './modernTheme';

const { width } = Dimensions.get('window');

const AnalisisDetallado = ({ navigation }) => {
  const { user } = useAuth();
  const [climaEmocional, setClimaEmocional] = useState(null);
  const [tendencias7Dias, setTendencias7Dias] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para obtener todos los datos
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [climaResponse, tendenciasResponse] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/directivo/clima-emocional-diario`, {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        axios.get(`${config.API_BASE_URL}/directivo/tendencias-7-dias`, {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);
      
      setClimaEmocional(climaResponse.data.data);
      setTendencias7Dias(tendenciasResponse.data.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={modernTheme.colors.turquoise} />
        <Text style={styles.loadingText}>Cargando análisis detallado...</Text>
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
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Análisis Detallado</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={cargarDatos}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Clima Emocional Detallado */}
      {climaEmocional && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Clima Emocional de Hoy</Text>
          
          {climaEmocional.suficientesRegistros ? (
            <>
              {/* Indicador principal */}
              <View style={styles.climaMainCard}>
                <Text style={styles.climaEmoji}>{climaEmocional.clima.emoji}</Text>
                <View style={styles.climaInfo}>
                  <Text style={styles.climaEstado}>{climaEmocional.clima.climaGeneral}</Text>
                  <Text style={styles.climaPuntuacion}>
                    {climaEmocional.clima.puntuacion}/5.0
                  </Text>
                  <Text style={styles.climaFecha}>
                    📅 {new Date(climaEmocional.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </Text>
                </View>
              </View>

              {/* Estadísticas */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{climaEmocional.totalRegistros}</Text>
                  <Text style={styles.statLabel}>Registros hoy</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {climaEmocional.clima.emocionesPredominantes[0]?.emocion || 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Emoción principal</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {climaEmocional.clima.lugaresComunes[0]?.lugar || 'N/A'}
                  </Text>
                  <Text style={styles.statLabel}>Lugar más común</Text>
                </View>
              </View>

              {/* Distribución de moods */}
              <View style={styles.distribucionCard}>
                <Text style={styles.cardTitle}>Distribución de Estados</Text>
                <View style={styles.distribucionContainer}>
                  {Object.entries(climaEmocional.clima.distribucion).map(([mood, count]) => {
                    const percentage = ((count / climaEmocional.totalRegistros) * 100).toFixed(1);
                    return (
                      <View key={mood} style={styles.distribucionItem}>
                        <View style={styles.distribucionInfo}>
                          <Text style={styles.moodName}>{mood}</Text>
                          <Text style={styles.moodCount}>{count} ({percentage}%)</Text>
                        </View>
                        <View style={styles.barContainer}>
                          <View 
                            style={[
                              styles.distributionBar,
                              { 
                                width: `${percentage}%`,
                                backgroundColor: mood === 'Excelente' ? modernTheme.colors.turquoise :
                                               mood === 'Muy bien' ? modernTheme.colors.yellow :
                                               mood === 'Bien' ? '#90EE90' :
                                               mood === 'Más o menos' ? modernTheme.colors.coral :
                                               modernTheme.colors.lavender
                              }
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noDataCard}>
              <Text style={styles.noDataIcon}>🔒</Text>
              <Text style={styles.noDataTitle}>Datos insuficientes</Text>
              <Text style={styles.noDataMessage}>
                Se necesitan al menos {climaEmocional.minimoRequerido} registros para mostrar el análisis.
              </Text>
              <Text style={styles.noDataCount}>
                Actual: {climaEmocional.totalRegistros} registros
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Tendencias de 7 días */}
      {tendencias7Dias && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Tendencias de 7 días</Text>
          
          {tendencias7Dias.suficientesRegistros ? (
            <>
              {/* Resumen de tendencias */}
              <View style={styles.tendenciasResumenCard}>
                <Text style={styles.tendenciaEstado}>
                  {tendencias7Dias.tendencias.resumen.tendenciaGeneral}
                </Text>
                <Text style={styles.tendenciaPuntuacion}>
                  {tendencias7Dias.tendencias.resumen.puntuacionPromedio}/5.0
                </Text>
                <Text style={styles.tendenciaPeriodo}>
                  📅 {tendencias7Dias.periodo.inicio} - {tendencias7Dias.periodo.fin}
                </Text>
              </View>

              {/* Gráfico de líneas mejorado */}
              <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>Evolución Semanal</Text>
                <View style={styles.chartContainer}>
                  <View style={styles.yAxis}>
                    {[5, 4, 3, 2, 1].map(value => (
                      <Text key={value} style={styles.yAxisLabel}>{value}</Text>
                    ))}
                  </View>
                  <View style={styles.chartArea}>
                    {/* Líneas de referencia */}
                    {[1, 2, 3, 4, 5].map(value => (
                      <View 
                        key={value} 
                        style={[
                          styles.gridLine, 
                          { bottom: `${(value - 1) * 20}%` }
                        ]} 
                      />
                    ))}
                    
                    {/* Puntos y líneas del gráfico */}
                    <View style={styles.lineChart}>
                      {tendencias7Dias.tendencias.dias.map((dia, index) => {
                        const bottomPosition = ((dia.puntuacion - 1) / 4) * 100;
                        const leftPosition = (index / 6) * 100;
                        
                        return (
                          <View key={index}>
                            {/* Punto */}
                            <View 
                              style={[
                                styles.chartPoint,
                                {
                                  bottom: `${bottomPosition}%`,
                                  left: `${leftPosition}%`,
                                  backgroundColor: dia.puntuacion >= 4 ? modernTheme.colors.turquoise :
                                                 dia.puntuacion >= 3 ? modernTheme.colors.yellow :
                                                 dia.puntuacion >= 2 ? modernTheme.colors.coral :
                                                 modernTheme.colors.lavender
                                }
                              ]}
                            />
                            
                            {/* Línea al siguiente punto */}
                            {index < tendencias7Dias.tendencias.dias.length - 1 && (
                              <View
                                style={[
                                  styles.chartLine,
                                  {
                                    bottom: `${bottomPosition}%`,
                                    left: `${leftPosition}%`,
                                    width: `${100/6}%`,
                                    transform: [{
                                      rotate: `${Math.atan2(
                                        (tendencias7Dias.tendencias.dias[index + 1].puntuacion - dia.puntuacion) * 20,
                                        100/6
                                      )}rad`
                                    }]
                                  }
                                ]}
                              />
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>
                
                {/* Etiquetas del eje X */}
                <View style={styles.xAxis}>
                  {tendencias7Dias.tendencias.dias.map((dia, index) => (
                    <View key={index} style={styles.xAxisItem}>
                      <Text style={styles.dayEmoji}>{dia.emoji}</Text>
                      <Text style={styles.dayLabel}>{dia.diaSemana}</Text>
                      <Text style={styles.dayValue}>{dia.puntuacion}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Estadísticas destacadas */}
              <View style={styles.statsRow}>
                <View style={styles.highlightStat}>
                  <Text style={styles.highlightIcon}>🌟</Text>
                  <Text style={styles.highlightLabel}>Mejor día</Text>
                  <Text style={styles.highlightValue}>
                    {tendencias7Dias.tendencias.resumen.mejorDia?.diaSemana} ({tendencias7Dias.tendencias.resumen.mejorDia?.puntuacion})
                  </Text>
                </View>
                <View style={styles.highlightStat}>
                  <Text style={styles.highlightIcon}>📊</Text>
                  <Text style={styles.highlightLabel}>Total registros</Text>
                  <Text style={styles.highlightValue}>
                    {tendencias7Dias.totalRegistros}
                  </Text>
                </View>
              </View>

              {/* Insights */}
              <View style={styles.insightsCard}>
                <Text style={styles.cardTitle}>💡 Insights</Text>
                <View style={styles.insightsList}>
                  {tendencias7Dias.tendencias.resumen.mejorDia && tendencias7Dias.tendencias.resumen.peorDia && (
                    <Text style={styles.insightItem}>
                      • Diferencia entre mejor y peor día: {
                        (tendencias7Dias.tendencias.resumen.mejorDia.puntuacion - 
                         tendencias7Dias.tendencias.resumen.peorDia.puntuacion).toFixed(1)
                      } puntos
                    </Text>
                  )}
                  <Text style={styles.insightItem}>
                    • Promedio diario: {Math.round(tendencias7Dias.totalRegistros / 7)} registros
                  </Text>
                  {tendencias7Dias.tendencias.resumen.puntuacionPromedio >= 3.5 ? (
                    <Text style={styles.insightItem}>
                      • ✅ Tendencia general positiva esta semana
                    </Text>
                  ) : (
                    <Text style={styles.insightItem}>
                      • ⚠️ La tendencia podría necesitar atención
                    </Text>
                  )}
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noDataCard}>
              <Text style={styles.noDataIcon}>🔒</Text>
              <Text style={styles.noDataTitle}>Datos insuficientes</Text>
              <Text style={styles.noDataMessage}>
                Se necesitan al menos {tendencias7Dias.minimoRequerido} registros en 7 días.
              </Text>
              <Text style={styles.noDataCount}>
                Actual: {tendencias7Dias.totalRegistros} registros
              </Text>
            </View>
          )}
        </View>
      )}
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
    paddingBottom: modernTheme.spacing.paddingXLarge,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  loadingText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    marginTop: modernTheme.spacing.marginMedium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: modernTheme.spacing.paddingLarge,
    paddingTop: 50, // Para el status bar
  },
  backButton: {
    padding: modernTheme.spacing.paddingSmall,
    borderRadius: modernTheme.borderRadius.small,
    backgroundColor: modernTheme.colors.chartBackground,
  },
  backIcon: {
    fontSize: 24,
    color: modernTheme.colors.primaryText,
  },
  title: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: modernTheme.spacing.paddingSmall,
    borderRadius: modernTheme.borderRadius.small,
    backgroundColor: modernTheme.colors.turquoise,
  },
  refreshIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: modernTheme.spacing.marginXLarge,
  },
  sectionTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginLarge,
  },
  climaMainCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginLarge,
    flexDirection: 'row',
    alignItems: 'center',
    ...modernTheme.shadows.medium,
  },
  climaEmoji: {
    fontSize: 48,
    marginRight: modernTheme.spacing.marginLarge,
  },
  climaInfo: {
    flex: 1,
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
    marginBottom: modernTheme.spacing.marginSmall,
  },
  climaFecha: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.marginLarge,
  },
  statCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: modernTheme.spacing.marginTiny,
    ...modernTheme.shadows.small,
  },
  statNumber: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginTiny,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  distribucionCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    ...modernTheme.shadows.medium,
  },
  cardTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  distribucionContainer: {
    gap: modernTheme.spacing.marginMedium,
  },
  distribucionItem: {
    marginBottom: modernTheme.spacing.marginSmall,
  },
  distribucionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: modernTheme.spacing.marginTiny,
  },
  moodName: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
  },
  moodCount: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
  },
  barContainer: {
    height: 8,
    backgroundColor: modernTheme.colors.primaryBackground,
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    borderRadius: 4,
  },
  tendenciasResumenCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginLarge,
    alignItems: 'center',
    ...modernTheme.shadows.medium,
  },
  tendenciaEstado: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  tendenciaPuntuacion: {
    fontSize: modernTheme.fontSizes.title,
    color: modernTheme.colors.coral,
    fontWeight: '600',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  tendenciaPeriodo: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    fontStyle: 'italic',
  },
  chartCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginLarge,
    ...modernTheme.shadows.medium,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 200,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    marginLeft: modernTheme.spacing.marginSmall,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
    opacity: 0.5,
  },
  lineChart: {
    flex: 1,
    position: 'relative',
  },
  chartPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
    marginBottom: -6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: modernTheme.colors.turquoise,
    marginBottom: -1,
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: modernTheme.spacing.paddingSmall,
  },
  xAxisItem: {
    alignItems: 'center',
    flex: 1,
  },
  dayEmoji: {
    fontSize: 16,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  dayLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    fontWeight: 'bold',
    marginBottom: modernTheme.spacing.marginTiny,
  },
  dayValue: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.primaryText,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: modernTheme.spacing.marginLarge,
  },
  highlightStat: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: modernTheme.spacing.marginSmall,
    ...modernTheme.shadows.small,
  },
  highlightIcon: {
    fontSize: 20,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  highlightLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginTiny,
  },
  highlightValue: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
  },
  insightsCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingLarge,
    ...modernTheme.shadows.medium,
  },
  insightsList: {
    gap: modernTheme.spacing.marginSmall,
  },
  insightItem: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    lineHeight: 22,
    paddingLeft: modernTheme.spacing.paddingSmall,
  },
  noDataCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingXLarge,
    alignItems: 'center',
    ...modernTheme.shadows.medium,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  noDataTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  noDataMessage: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  noDataCount: {
    fontSize: modernTheme.fontSizes.label,
    color: modernTheme.colors.coral,
    fontWeight: 'bold',
  },
});

export default AnalisisDetallado; 