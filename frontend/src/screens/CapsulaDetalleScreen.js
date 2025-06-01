import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Share,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import modernTheme from './modernTheme';
import config from '../config';
import CapsulaCard from '../components/CapsulaCard';

const CapsulaDetalleScreen = ({ navigation, route }) => {
  const { capsula: capsulaInicial } = route.params;
  const [capsula, setCapsula] = useState(capsulaInicial);
  const [relacionadas, setRelacionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar detalle completo de la cápsula
  useEffect(() => {
    cargarDetalleCompleto();
  }, []);

  const cargarDetalleCompleto = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const response = await axios.get(
        `${config.API_BASE_URL}/teacher/capsulas/${capsulaInicial._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCapsula(response.data.data);
        setRelacionadas(response.data.data.relacionadas || []);
      }
    } catch (error) {
      console.error('Error cargando detalle:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar interacciones
  const manejarInteraccion = async (tipo, estado = null) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      const payload = { tipoInteraccion: tipo };
      if (estado) payload.estadoEmocionalPrevio = estado;

      await axios.post(
        `${config.API_BASE_URL}/teacher/capsulas/${capsula._id}/interaccion`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar estado local
      setCapsula(prev => ({
        ...prev,
        [tipo === 'like' ? 'meGusta' : 
         tipo === 'guardada' ? 'guardada' : 
         tipo === 'completada' ? 'completada' : tipo]: true
      }));

      // Mostrar confirmación
      const mensajes = {
        like: '👍 ¡Te gustó esta cápsula!',
        guardada: '💾 Cápsula guardada en favoritos',
        completada: '✅ ¡Cápsula completada!'
      };
      
      Alert.alert('¡Perfecto!', mensajes[tipo]);
    } catch (error) {
      console.error('Error en interacción:', error);
      Alert.alert('Error', 'No se pudo registrar la acción');
    }
  };

  // Eliminar interacción
  const eliminarInteraccion = async (tipo) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return;

      await axios.delete(
        `${config.API_BASE_URL}/teacher/capsulas/${capsula._id}/interaccion/${tipo}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar estado local
      setCapsula(prev => ({
        ...prev,
        [tipo === 'like' ? 'meGusta' : 
         tipo === 'guardada' ? 'guardada' : tipo]: false
      }));
    } catch (error) {
      console.error('Error eliminando interacción:', error);
    }
  };

  // Compartir cápsula
  const compartirCapsula = async () => {
    try {
      await Share.share({
        message: `Te recomiendo esta cápsula de autocuidado: "${capsula.titulo}"\n\n${capsula.descripcion}`,
        title: capsula.titulo,
      });
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  // Obtener icono de categoría
  const getCategoryIcon = (categoria) => {
    const icons = {
      'mindfulness': '🧘‍♂️',
      'respiracion': '🌬️',
      'autocuidado': '💚',
      'gestion_estres': '🎯',
      'motivacion': '⭐',
      'equilibrio_vida': '⚖️',
      'comunicacion': '💬',
      'resiliencia': '💪',
      'reflexion': '🤔'
    };
    return icons[categoria] || '✨';
  };

  const getDifficultyColor = (nivel) => {
    switch (nivel) {
      case 'principiante': return '#4CAF50';
      case 'intermedio': return '#FF9800';
      case 'avanzado': return '#F44336';
      default: return '#4CAF50';
    }
  };

  const getDifficultyText = (nivel) => {
    switch (nivel) {
      case 'principiante': return 'Principiante';
      case 'intermedio': return 'Intermedio';
      case 'avanzado': return 'Avanzado';
      default: return 'Principiante';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={compartirCapsula}
          >
            <Text style={styles.headerActionText}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Section */}
      <View style={[styles.heroSection, { backgroundColor: modernTheme.colors.turquoise }]}>
        <View style={styles.categoryIconLarge}>
          <Text style={styles.categoryIconLargeText}>
            {getCategoryIcon(capsula.categoria)}
          </Text>
        </View>
        
        <Text style={styles.capsulaTitle}>{capsula.titulo}</Text>
        <Text style={styles.capsulaDescription}>{capsula.descripcion}</Text>
        
        <View style={styles.heroMetadata}>
          <View style={[
            styles.difficultyBadgeLarge,
            { backgroundColor: getDifficultyColor(capsula.nivelDificultad) }
          ]}>
            <Text style={styles.difficultyTextLarge}>
              {getDifficultyText(capsula.nivelDificultad)}
            </Text>
          </View>
          <View style={styles.durationBadgeLarge}>
            <Text style={styles.durationTextLarge}>{capsula.duracion} minutos</Text>
          </View>
        </View>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.primaryActionButton
          ]}
          onPress={() => manejarInteraccion('completada')}
        >
          <Text style={styles.actionButtonIcon}>
            {capsula.completada ? '✅' : '▶️'}
          </Text>
          <Text style={styles.actionButtonText}>
            {capsula.completada ? 'Completada' : 'Comenzar'}
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[
              styles.secondaryActionButton,
              capsula.meGusta && styles.secondaryActionButtonActive
            ]}
            onPress={() => 
              capsula.meGusta ? 
              eliminarInteraccion('like') : 
              manejarInteraccion('like')
            }
          >
            <Text style={styles.secondaryActionIcon}>👍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryActionButton,
              capsula.guardada && styles.secondaryActionButtonActive
            ]}
            onPress={() => 
              capsula.guardada ? 
              eliminarInteraccion('guardada') : 
              manejarInteraccion('guardada')
            }
          >
            <Text style={styles.secondaryActionIcon}>💾</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido */}
      <View style={styles.contentSection}>
        <Text style={styles.contentTitle}>Contenido</Text>
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>{capsula.contenido}</Text>
        </View>
      </View>

      {/* Emociones relacionadas */}
      {capsula.emocionesRelacionadas && capsula.emocionesRelacionadas.length > 0 && (
        <View style={styles.emotionsSection}>
          <Text style={styles.sectionTitle}>Útil cuando te sientes:</Text>
          <View style={styles.emotionsContainer}>
            {capsula.emocionesRelacionadas.map((emocion, index) => (
              <View key={index} style={styles.emotionTag}>
                <Text style={styles.emotionText}>{emocion}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Cápsulas relacionadas */}
      {relacionadas.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.sectionTitle}>Cápsulas relacionadas</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedContainer}
          >
            {relacionadas.map((capsulaRelacionada, index) => (
              <View key={capsulaRelacionada._id} style={styles.relatedCard}>
                <CapsulaCard
                  capsula={capsulaRelacionada}
                  index={index}
                  onPress={() => {
                    navigation.replace('CapsulaDetalle', { 
                      capsula: capsulaRelacionada 
                    });
                  }}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Espaciado final */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.chartBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modernTheme.colors.lightBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modernTheme.colors.lightBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    fontSize: 16,
  },
  heroSection: {
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  categoryIconLargeText: {
    fontSize: 36,
  },
  capsulaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 30,
  },
  capsulaDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  heroMetadata: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  difficultyTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  durationBadgeLarge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  durationTextLarge: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  primaryActionButton: {
    backgroundColor: modernTheme.colors.coral,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  secondaryActionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: modernTheme.colors.lightBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionButtonActive: {
    backgroundColor: modernTheme.colors.coral,
  },
  secondaryActionIcon: {
    fontSize: 24,
  },
  contentSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: 16,
  },
  contentContainer: {
    backgroundColor: modernTheme.colors.lightBackground,
    borderRadius: 16,
    padding: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: modernTheme.colors.primaryText,
  },
  emotionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
    marginBottom: 16,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emotionTag: {
    backgroundColor: modernTheme.colors.turquoise,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  emotionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  relatedSection: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  relatedContainer: {
    paddingRight: 20,
  },
  relatedCard: {
    width: 280,
    marginRight: 16,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CapsulaDetalleScreen; 