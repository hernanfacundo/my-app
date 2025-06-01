import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import config from '../config';
import modernTheme from './modernTheme';

const { width } = Dimensions.get('window');

const AnalisisPorCurso = ({ navigation }) => {
  const { user } = useAuth();
  const [analisisCursos, setAnalisisCursos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarAnalisisPorCurso = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await axios.get(
        `${config.API_BASE_URL}/directivo/clima-emocional-por-curso`,
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );
      
      setAnalisisCursos(response.data.data);
      console.log('📊 Análisis por curso cargado:', response.data.data);
    } catch (error) {
      console.error('Error cargando análisis por curso:', error);
      Alert.alert(
        '❌ Error',
        'No se pudo cargar el análisis por curso',
        [{ text: 'Reintentar', onPress: () => cargarAnalisisPorCurso() }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarAnalisisPorCurso();
  }, []);

  const onRefresh = () => {
    cargarAnalisisPorCurso(true);
  };

  const getClimaColor = (clima) => {
    switch (clima) {
      case 'Excelente': return modernTheme.colors.success;
      case 'Muy positivo': return modernTheme.colors.turquoise;
      case 'Positivo': return modernTheme.colors.turquoise;
      case 'Regular': return modernTheme.colors.warning;
      case 'Necesita atención': return modernTheme.colors.error;
      default: return modernTheme.colors.mediumGray;
    }
  };

  const renderCursoCard = (curso, index) => {
    const { curso: infoCurso, climaHoy, tendencia7Dias, participacion } = curso;
    
    return (
      <View key={infoCurso.id} style={styles.cursoCard}>
        {/* Header del curso */}
        <View style={styles.cursoHeader}>
          <View style={styles.cursoInfo}>
            <Text style={styles.cursoNombre}>{infoCurso.nombre}</Text>
            <Text style={styles.cursoCodigo}>{infoCurso.codigo}</Text>
            <Text style={styles.docente}>👨‍🏫 {infoCurso.docente}</Text>
            <Text style={styles.estudiantes}>👥 {infoCurso.totalEstudiantes} estudiantes</Text>
          </View>
          <View style={styles.cursoIcono}>
            <Text style={styles.numeroClase}>{index + 1}</Text>
          </View>
        </View>

        {/* Participación */}
        <View style={styles.participacionSection}>
          <Text style={styles.sectionTitle}>📊 Participación</Text>
          <View style={styles.participacionRow}>
            <View style={styles.participacionCol}>
              <Text style={styles.participacionLabel}>Hoy</Text>
              <Text style={styles.participacionValor}>
                {participacion.registrosHoy} ({participacion.porcentajeParticipacionHoy}%)
              </Text>
            </View>
            <View style={styles.participacionCol}>
              <Text style={styles.participacionLabel}>7 días</Text>
              <Text style={styles.participacionValor}>
                {participacion.registros7Dias} ({participacion.porcentajeParticipacion7Dias}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Clima de hoy */}
        <View style={styles.climaSection}>
          <Text style={styles.sectionTitle}>🌡️ Clima Emocional de Hoy</Text>
          {climaHoy.suficientesRegistros ? (
            <View style={styles.climaInfo}>
              <View style={styles.climaMain}>
                <Text style={styles.climaEmoji}>{climaHoy.emoji}</Text>
                <View style={styles.climaTexto}>
                  <Text style={[styles.climaEstado, { color: getClimaColor(climaHoy.climaGeneral) }]}>
                    {climaHoy.climaGeneral}
                  </Text>
                  <Text style={styles.climaPuntuacion}>
                    {climaHoy.puntuacion}/5.0
                  </Text>
                </View>
              </View>
              
              {/* Emociones principales */}
              {climaHoy.emocionesPredominantes && climaHoy.emocionesPredominantes.length > 0 && (
                <View style={styles.emocionesSection}>
                  <Text style={styles.emocionesTitle}>Emociones principales:</Text>
                  <View style={styles.emocionesRow}>
                    {climaHoy.emocionesPredominantes.slice(0, 3).map((emocion, idx) => (
                      <View key={idx} style={styles.emocionTag}>
                        <Text style={styles.emocionTexto}>
                          {emocion.emocion} ({emocion.count})
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.climaInsuficiente}>
              <Text style={styles.climaEmoji}>🔒</Text>
              <Text style={styles.climaInsuficienteTexto}>
                Necesita {climaHoy.minimoRequerido - climaHoy.totalRegistros} registros más para análisis
              </Text>
            </View>
          )}
        </View>

        {/* Tendencia 7 días */}
        <View style={styles.tendenciaSection}>
          <Text style={styles.sectionTitle}>📈 Tendencia 7 Días</Text>
          {tendencia7Dias.suficientesRegistros ? (
            <View style={styles.tendenciaInfo}>
              <Text style={[styles.tendenciaTexto, { 
                color: getClimaColor(tendencia7Dias.resumen?.tendenciaGeneral || 'Regular') 
              }]}>
                {tendencia7Dias.resumen?.tendenciaGeneral || 'Sin datos'}
              </Text>
              <Text style={styles.tendenciaPuntuacion}>
                Promedio: {tendencia7Dias.resumen?.puntuacionPromedio || 0}/5.0
              </Text>
              {tendencia7Dias.resumen?.mejorDia && (
                <Text style={styles.mejorDia}>
                  💡 Mejor día: {tendencia7Dias.resumen.mejorDia.diaSemana}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.tendenciaInsuficiente}>
              Necesita más datos históricos
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={modernTheme.colors.turquoise} />
        <Text style={styles.loadingText}>Analizando cursos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Análisis por Curso</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {analisisCursos && (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[modernTheme.colors.turquoise]}
            />
          }
        >
          {/* Resumen general */}
          <View style={styles.resumenCard}>
            <Text style={styles.resumenTitle}>📋 Resumen General</Text>
            <View style={styles.resumenGrid}>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenValor}>{analisisCursos.resumenGeneral.totalCursos}</Text>
                <Text style={styles.resumenLabel}>Cursos</Text>
              </View>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenValor}>{analisisCursos.resumenGeneral.totalEstudiantes}</Text>
                <Text style={styles.resumenLabel}>Estudiantes</Text>
              </View>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenValor}>{analisisCursos.resumenGeneral.cursosConDatosHoy}</Text>
                <Text style={styles.resumenLabel}>Con datos hoy</Text>
              </View>
              <View style={styles.resumenItem}>
                <Text style={styles.resumenValor}>{analisisCursos.resumenGeneral.totalRegistrosHoy}</Text>
                <Text style={styles.resumenLabel}>Registros hoy</Text>
              </View>
            </View>
          </View>

          {/* Cursos */}
          <Text style={styles.cursosTitle}>🏫 Análisis por Curso</Text>
          {analisisCursos.cursos.map((curso, index) => renderCursoCard(curso, index))}

          {/* Footer info */}
          <View style={styles.footerInfo}>
            <Text style={styles.footerText}>
              📊 Última actualización: {new Date(analisisCursos.ultimaActualizacion).toLocaleTimeString()}
            </Text>
            <Text style={styles.footerNote}>
              💡 Se requieren al menos 3 registros por curso para mostrar análisis completo
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.background,
  },
  loadingText: {
    marginTop: modernTheme.spacing.marginMedium,
    color: modernTheme.colors.secondaryText,
    fontSize: modernTheme.fontSizes.body,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingVertical: modernTheme.spacing.paddingMedium,
    backgroundColor: modernTheme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: modernTheme.colors.lightGray,
  },
  backButton: {
    padding: modernTheme.spacing.paddingSmall,
  },
  backText: {
    color: modernTheme.colors.turquoise,
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.darkGray,
  },
  refreshButton: {
    padding: modernTheme.spacing.paddingSmall,
  },
  refreshText: {
    fontSize: modernTheme.fontSizes.title,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: modernTheme.spacing.paddingXLarge,
  },
  resumenCard: {
    backgroundColor: modernTheme.colors.white,
    margin: modernTheme.spacing.marginMedium,
    padding: modernTheme.spacing.paddingLarge,
    borderRadius: modernTheme.borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resumenTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.darkGray,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  resumenGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resumenItem: {
    alignItems: 'center',
    flex: 1,
  },
  resumenValor: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.turquoise,
  },
  resumenLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  cursosTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.darkGray,
    marginHorizontal: modernTheme.spacing.marginMedium,
    marginTop: modernTheme.spacing.marginMedium,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  cursoCard: {
    backgroundColor: modernTheme.colors.white,
    margin: modernTheme.spacing.marginMedium,
    padding: modernTheme.spacing.paddingLarge,
    borderRadius: modernTheme.borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cursoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  cursoInfo: {
    flex: 1,
  },
  cursoNombre: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.darkGray,
    marginBottom: 4,
  },
  cursoCodigo: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.turquoise,
    fontWeight: '600',
    marginBottom: 4,
  },
  docente: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginBottom: 2,
  },
  estudiantes: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
  },
  cursoIcono: {
    backgroundColor: modernTheme.colors.turquoise + '20',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numeroClase: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.turquoise,
  },
  participacionSection: {
    marginBottom: modernTheme.spacing.marginMedium,
    padding: modernTheme.spacing.paddingMedium,
    backgroundColor: modernTheme.colors.lightGray + '30',
    borderRadius: modernTheme.borderRadius.small,
  },
  sectionTitle: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.darkGray,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  participacionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  participacionCol: {
    alignItems: 'center',
  },
  participacionLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
  },
  participacionValor: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.darkGray,
  },
  climaSection: {
    marginBottom: modernTheme.spacing.marginMedium,
    padding: modernTheme.spacing.paddingMedium,
    backgroundColor: modernTheme.colors.turquoise + '20',
    borderRadius: modernTheme.borderRadius.small,
  },
  climaInfo: {
    
  },
  climaMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  climaEmoji: {
    fontSize: 32,
    marginRight: modernTheme.spacing.marginMedium,
  },
  climaTexto: {
    flex: 1,
  },
  climaEstado: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
  },
  climaPuntuacion: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
  },
  emocionesSection: {
    marginTop: modernTheme.spacing.marginSmall,
  },
  emocionesTitle: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginBottom: 4,
  },
  emocionesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emocionTag: {
    backgroundColor: modernTheme.colors.turquoise + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  emocionTexto: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.turquoise,
    fontWeight: '500',
  },
  climaInsuficiente: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  climaInsuficienteTexto: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    marginLeft: modernTheme.spacing.marginSmall,
  },
  tendenciaSection: {
    padding: modernTheme.spacing.paddingMedium,
    backgroundColor: modernTheme.colors.lightGray + '20',
    borderRadius: modernTheme.borderRadius.small,
  },
  tendenciaInfo: {
    
  },
  tendenciaTexto: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tendenciaPuntuacion: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    marginBottom: 4,
  },
  mejorDia: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.success,
    fontStyle: 'italic',
  },
  tendenciaInsuficiente: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    fontStyle: 'italic',
  },
  footerInfo: {
    marginHorizontal: modernTheme.spacing.marginMedium,
    marginTop: modernTheme.spacing.marginLarge,
    padding: modernTheme.spacing.paddingMedium,
    backgroundColor: modernTheme.colors.lightGray + '30',
    borderRadius: modernTheme.borderRadius.small,
  },
  footerText: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    marginBottom: 4,
  },
  footerNote: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AnalisisPorCurso; 