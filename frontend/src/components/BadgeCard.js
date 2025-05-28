import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import modernTheme from '../screens/modernTheme';
import BadgeService from '../services/badgeService';

const BadgeCard = ({ badge, onPress, size = 'medium' }) => {
  const isUnlocked = badge.isUnlocked;
  const badgeColor = BadgeService.getBadgeColor(badge.color);
  const progress = badge.progress || { current: 0, required: 1, percentage: 0 };
  
  // Tamaños dinámicos
  const sizes = {
    small: { width: 80, height: 100, emoji: 24, title: 12, desc: 10 },
    medium: { width: 120, height: 140, emoji: 32, title: 14, desc: 11 },
    large: { width: 160, height: 180, emoji: 40, title: 16, desc: 12 }
  };
  
  const currentSize = sizes[size];
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          width: currentSize.width,
          height: currentSize.height,
          backgroundColor: isUnlocked ? badgeColor : modernTheme.colors.lightGray,
          borderColor: isUnlocked ? badgeColor : modernTheme.colors.mediumGray,
          opacity: isUnlocked ? 1 : 0.6,
        }
      ]}
      onPress={() => onPress && onPress(badge)}
      activeOpacity={0.8}
    >
      {/* Emoji de la insignia */}
      <View style={styles.emojiContainer}>
        <Text style={[styles.emoji, { fontSize: currentSize.emoji }]}>
          {badge.emoji}
        </Text>
        {isUnlocked && (
          <View style={[styles.unlockedBadge, { backgroundColor: modernTheme.colors.success }]}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>

      {/* Nombre de la insignia */}
      <Text 
        style={[
          styles.title, 
          { 
            fontSize: currentSize.title,
            color: isUnlocked ? modernTheme.colors.white : modernTheme.colors.darkGray 
          }
        ]}
        numberOfLines={2}
      >
        {badge.name}
      </Text>

      {/* Barra de progreso */}
      {!isUnlocked && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${progress.percentage}%`,
                  backgroundColor: badgeColor 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { fontSize: currentSize.desc }]}>
            {progress.current}/{progress.required}
          </Text>
        </View>
      )}

      {/* Fecha de desbloqueo para insignias desbloqueadas */}
      {isUnlocked && badge.unlockedAt && (
        <Text style={[styles.unlockedDate, { fontSize: currentSize.desc }]}>
          {formatUnlockedDate(badge.unlockedAt)}
        </Text>
      )}

      {/* Indicador de categoría */}
      <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(badge.category) }]}>
        <Text style={styles.categoryText}>{getCategoryIcon(badge.category)}</Text>
      </View>
    </TouchableOpacity>
  );
};

// Función para formatear la fecha de desbloqueo
const formatUnlockedDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
};

// Función para obtener el color de la categoría
const getCategoryColor = (category) => {
  const colors = {
    streak: '#FF6B6B',
    total: '#4ECDC4',
    variety: '#45B7D1'
  };
  return colors[category] || '#95A5A6';
};

// Función para obtener el icono de la categoría
const getCategoryIcon = (category) => {
  const icons = {
    streak: '🔥',
    total: '📊',
    variety: '🌈'
  };
  return icons[category] || '⭐';
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    margin: 6,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    ...modernTheme.shadows.medium,
  },
  emojiContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: {
    textAlign: 'center',
  },
  unlockedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: modernTheme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontFamily: modernTheme.fonts.semiBold,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 16,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: modernTheme.colors.lightGray,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: modernTheme.colors.mediumGray,
    fontFamily: modernTheme.fonts.medium,
  },
  unlockedDate: {
    color: modernTheme.colors.white,
    fontFamily: modernTheme.fonts.medium,
    opacity: 0.9,
  },
  categoryIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    fontSize: 12,
  },
});

export default BadgeCard; 