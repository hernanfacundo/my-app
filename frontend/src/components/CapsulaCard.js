import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import modernTheme from '../screens/modernTheme';

const CapsulaCard = ({ capsula, onPress, index = 0 }) => {
  // Colores rotativos para las tarjetas
  const getCardColor = (index) => {
    const colors = [
      modernTheme.colors.turquoise,
      modernTheme.colors.coral,
      modernTheme.colors.lavender,
      modernTheme.colors.pastelYellow,
      '#A8E6CF', // Verde menta
      '#FFB3B3', // Rosa suave
    ];
    return colors[index % colors.length];
  };

  // Iconos por categoría
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

  // Color del nivel de dificultad
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
      case 'principiante': return 'Fácil';
      case 'intermedio': return 'Medio';
      case 'avanzado': return 'Avanzado';
      default: return 'Fácil';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.capsulaCard,
        { backgroundColor: getCardColor(index) }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header de la tarjeta */}
      <View style={styles.cardHeader}>
        <View style={styles.categoryIconContainer}>
          <Text style={styles.categoryIcon}>
            {getCategoryIcon(capsula.categoria)}
          </Text>
        </View>
        <View style={styles.cardBadges}>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: getDifficultyColor(capsula.nivelDificultad) }
          ]}>
            <Text style={styles.difficultyText}>
              {getDifficultyText(capsula.nivelDificultad)}
            </Text>
          </View>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{capsula.duracion}min</Text>
          </View>
        </View>
      </View>

      {/* Contenido principal */}
      <View style={styles.cardContent}>
        <Text style={styles.capsulaTitle} numberOfLines={2}>
          {capsula.titulo}
        </Text>
        <Text style={styles.capsulaDescription} numberOfLines={3}>
          {capsula.descripcion}
        </Text>
      </View>

      {/* Footer con estados */}
      <View style={styles.cardFooter}>
        <View style={styles.statusIndicators}>
          {capsula.yaVista && (
            <View style={styles.statusIndicator}>
              <Text style={styles.statusEmoji}>👁️</Text>
            </View>
          )}
          {capsula.meGusta && (
            <View style={styles.statusIndicator}>
              <Text style={styles.statusEmoji}>👍</Text>
            </View>
          )}
          {capsula.guardada && (
            <View style={styles.statusIndicator}>
              <Text style={styles.statusEmoji}>💾</Text>
            </View>
          )}
          {capsula.completada && (
            <View style={styles.statusIndicator}>
              <Text style={styles.statusEmoji}>✅</Text>
            </View>
          )}
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  capsulaCard: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 20,
  },
  cardBadges: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  durationBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  cardContent: {
    marginBottom: 16,
  },
  capsulaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 22,
  },
  capsulaDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicators: {
    flexDirection: 'row',
    gap: 8,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusEmoji: {
    fontSize: 12,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default CapsulaCard; 