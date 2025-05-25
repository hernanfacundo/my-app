import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalStyles';
import modernTheme from './modernTheme';
import config from '../config';

const MoodHistoryScreen = () => {
  const { user } = useContext(AuthContext);
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Función para obtener emoji según la emoción
  const getEmotionEmoji = (emotion) => {
    const emotionEmojis = {
      'Feliz': '😊',
      'Entusiasmado': '🤩',
      'Alegre': '😄',
      'Contento': '😌',
      'Satisfecho': '😇',
      'Optimista': '🌟',
      'Tranquilo': '😊',
      'Neutral': '😐',
      'Relajado': '😌',
      'Confundido': '😕',
      'Inseguro': '😰',
      'Cansado': '😴',
      'Triste': '😢',
      'Ansioso': '😟',
      'Enojado': '😠',
    };
    return emotionEmojis[emotion] || '😐';
  };

  // Función para obtener emoji según el lugar
  const getPlaceEmoji = (place) => {
    const placeEmojis = {
      'Casa': '🏠',
      'Trabajo': '💼',
      'Parque': '🌳',
      'Escuela': '🎓',
      'Gimnasio': '💪',
      'Calle': '🚶',
      'Café': '☕',
      'Biblioteca': '📚',
      'Tienda': '🛍️',
      'Otro': '📍',
    };
    return placeEmojis[place] || '📍';
  };

  // Función para obtener color según el mood
  const getMoodColor = (mood) => {
    const moodColors = {
      'Excelente': modernTheme.colors.turquoise,
      'Muy bien': modernTheme.colors.coral,
      'Bien': modernTheme.colors.pastelYellow,
      'Más o menos': modernTheme.colors.lavender,
      'No tan bien': '#FFB3B3',
    };
    return moodColors[mood] || modernTheme.colors.turquoise;
  };

  // Función para formatear fecha de manera juvenil
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays - 1} días`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const fetchMoodHistory = async () => {
    try {
      if (!user || !user.token) {
        console.error('No user token available - forcing reload');
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setUser({ token: storedToken });
        } else {
          throw new Error('No token available even after reload');
        }
      }
      const url = `${config.API_BASE_URL.replace(/\/api$/, '')}/api/moods`;
      console.log('Enviando solicitud a:', url, 'con token:', user.token);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMoodData(response.data);
    } catch (error) {
      console.error('Error al obtener historial:', error.message);
      console.error('Código de estado:', error.response?.status);
      console.error('Detalles completos del error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMoodHistory();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMoodHistory();
  };

  const renderMoodItem = ({ item }) => (
    <View style={[styles.moodCard, { borderLeftColor: getMoodColor(item.mood) }]}>
      <View style={styles.moodCardHeader}>
        <View style={styles.emotionContainer}>
          <Text style={styles.emotionEmoji}>{getEmotionEmoji(item.emotion)}</Text>
          <Text style={styles.emotionText}>{item.emotion}</Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.moodCardContent}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Estado</Text>
            <Text style={[styles.detailValue, { color: getMoodColor(item.mood) }]}>
              {item.mood}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Lugar</Text>
            <View style={styles.placeContainer}>
              <Text style={styles.placeEmoji}>{getPlaceEmoji(item.place)}</Text>
              <Text style={styles.detailValue}>{item.place}</Text>
            </View>
          </View>
        </View>

        {item.comment && (
          <View style={styles.commentContainer}>
            <Text style={styles.commentLabel}>💭 Comentario:</Text>
            <Text style={styles.commentText}>{item.comment}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📊</Text>
      <Text style={styles.emptyTitle}>¡Tu historial está esperándote!</Text>
      <Text style={styles.emptyText}>
        Comienza a registrar tus emociones para ver patrones y tendencias en tu bienestar
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onRefresh}>
        <Text style={styles.emptyButtonText}>Actualizar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={modernTheme.colors.turquoise} />
        <Text style={styles.loadingText}>Cargando tu historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.mainTitle}>📈 Mi Historial Emocional</Text>
        <Text style={styles.subtitle}>
          Descubre patrones en tu bienestar emocional
        </Text>
      </View>

      <FlatList
        data={moodData}
        keyExtractor={(item) => item._id}
        renderItem={renderMoodItem}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[modernTheme.colors.turquoise]}
            tintColor={modernTheme.colors.turquoise}
          />
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
  },
  headerContainer: {
    alignItems: 'center',
    padding: modernTheme.spacing.paddingLarge,
    paddingBottom: modernTheme.spacing.paddingMedium,
  },
  mainTitle: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  subtitle: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  listContainer: {
    padding: modernTheme.spacing.paddingMedium,
    paddingTop: 0,
  },
  moodCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginSmall,
    borderLeftWidth: 4,
    ...modernTheme.shadows.small,
  },
  moodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  emotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionEmoji: {
    fontSize: 18,
    marginRight: modernTheme.spacing.marginSmall,
  },
  emotionText: {
    fontSize: modernTheme.fontSizes.subtitle,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
  },
  dateText: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    fontWeight: '500',
  },
  moodCardContent: {
    gap: modernTheme.spacing.marginMedium,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  detailValue: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
  },
  placeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeEmoji: {
    fontSize: 16,
    marginRight: modernTheme.spacing.marginSmall,
  },
  commentContainer: {
    backgroundColor: modernTheme.colors.primaryBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
  },
  commentLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    marginBottom: modernTheme.spacing.marginSmall,
  },
  commentText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.primaryText,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: modernTheme.spacing.paddingXLarge,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: modernTheme.spacing.marginLarge,
  },
  emptyTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginMedium,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    lineHeight: 22,
    marginBottom: modernTheme.spacing.marginLarge,
  },
  emptyButton: {
    backgroundColor: modernTheme.colors.turquoise,
    paddingHorizontal: modernTheme.spacing.paddingMedium,
    paddingVertical: modernTheme.spacing.paddingSmall,
    borderRadius: modernTheme.borderRadius.small,
  },
  emptyButtonText: {
    color: modernTheme.colors.chartBackground,
    fontSize: modernTheme.fontSizes.body,
    fontWeight: '600',
  },
  loadingContainer: {
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
});

export default MoodHistoryScreen;