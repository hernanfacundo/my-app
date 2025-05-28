import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import modernTheme from '../screens/modernTheme';
import BadgeService from '../services/badgeService';

const { width, height } = Dimensions.get('window');

const BadgeNotificationModal = ({ 
  visible, 
  badge, 
  onClose, 
  onViewAllBadges 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && badge) {
      // Animación de entrada
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        // Animación de rebote del emoji
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        ),
      ]).start();
    } else {
      // Reset animaciones
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      bounceAnim.setValue(0);
    }
  }, [visible, badge]);

  const handleClose = () => {
    // Animación de salida
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const handleViewAllBadges = () => {
    handleClose();
    setTimeout(() => {
      onViewAllBadges && onViewAllBadges();
    }, 250);
  };

  if (!badge) return null;

  const badgeColor = BadgeService.getBadgeColor(badge.color);
  const motivationalMessage = BadgeService.getBadgeMotivationalMessage(badge);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Confetti de fondo */}
          <View style={styles.confettiContainer}>
            <Text style={styles.confetti}>🎉</Text>
            <Text style={styles.confetti}>✨</Text>
            <Text style={styles.confetti}>🎊</Text>
            <Text style={styles.confetti}>⭐</Text>
            <Text style={styles.confetti}>🌟</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.congratsText}>¡FELICIDADES!</Text>
            <Text style={styles.newBadgeText}>Nueva insignia desbloqueada</Text>
          </View>

          {/* Insignia principal */}
          <View style={[styles.badgeContainer, { backgroundColor: badgeColor }]}>
            <Animated.Text
              style={[
                styles.badgeEmoji,
                {
                  transform: [
                    {
                      scale: bounceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              {badge.emoji}
            </Animated.Text>
            
            {/* Indicador de desbloqueado */}
            <View style={styles.unlockedIndicator}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </View>

          {/* Información de la insignia */}
          <View style={styles.badgeInfo}>
            <Text style={styles.badgeName}>{badge.name}</Text>
            <Text style={styles.badgeDescription}>{badge.description}</Text>
          </View>

          {/* Mensaje motivacional */}
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationText}>{motivationalMessage}</Text>
          </View>

          {/* Categoría */}
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(badge.category) }]}>
              <Text style={styles.categoryEmoji}>{getCategoryIcon(badge.category)}</Text>
              <Text style={styles.categoryText}>{getCategoryName(badge.category)}</Text>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Continuar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleViewAllBadges}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Ver Todas 🏆</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Funciones auxiliares
const getCategoryColor = (category) => {
  const colors = {
    streak: '#FF6B6B',
    total: '#4ECDC4',
    variety: '#45B7D1'
  };
  return colors[category] || '#95A5A6';
};

const getCategoryIcon = (category) => {
  const icons = {
    streak: '🔥',
    total: '📊',
    variety: '🌈'
  };
  return icons[category] || '⭐';
};

const getCategoryName = (category) => {
  const names = {
    streak: 'Constancia',
    total: 'Cantidad',
    variety: 'Variedad'
  };
  return names[category] || 'Especial';
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: modernTheme.spacing.large,
  },
  container: {
    backgroundColor: modernTheme.colors.white,
    borderRadius: 24,
    padding: modernTheme.spacing.large,
    alignItems: 'center',
    maxWidth: width * 0.9,
    position: 'relative',
    ...modernTheme.shadows.large,
  },
  confettiContainer: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    zIndex: 1,
  },
  confetti: {
    fontSize: 24,
    opacity: 0.8,
  },
  header: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.large,
    marginTop: modernTheme.spacing.medium,
  },
  congratsText: {
    fontSize: 28,
    fontFamily: modernTheme.fonts.bold,
    color: modernTheme.colors.primary,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.extraSmall,
  },
  newBadgeText: {
    fontSize: modernTheme.typography.body.fontSize,
    fontFamily: modernTheme.fonts.medium,
    color: modernTheme.colors.mediumGray,
    textAlign: 'center',
  },
  badgeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: modernTheme.spacing.large,
    position: 'relative',
    ...modernTheme.shadows.medium,
  },
  badgeEmoji: {
    fontSize: 48,
  },
  unlockedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: modernTheme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: modernTheme.colors.white,
  },
  checkmark: {
    color: modernTheme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  badgeInfo: {
    alignItems: 'center',
    marginBottom: modernTheme.spacing.large,
  },
  badgeName: {
    fontSize: modernTheme.typography.title.fontSize,
    fontFamily: modernTheme.fonts.bold,
    color: modernTheme.colors.darkGray,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.small,
  },
  badgeDescription: {
    fontSize: modernTheme.typography.body.fontSize,
    fontFamily: modernTheme.fonts.medium,
    color: modernTheme.colors.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
  },
  motivationContainer: {
    backgroundColor: modernTheme.colors.secondary,
    padding: modernTheme.spacing.medium,
    borderRadius: 12,
    marginBottom: modernTheme.spacing.large,
  },
  motivationText: {
    fontSize: modernTheme.typography.body.fontSize,
    fontFamily: modernTheme.fonts.medium,
    color: modernTheme.colors.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  categoryContainer: {
    marginBottom: modernTheme.spacing.large,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: modernTheme.spacing.medium,
    paddingVertical: modernTheme.spacing.small,
    borderRadius: 20,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: modernTheme.spacing.extraSmall,
  },
  categoryText: {
    fontSize: modernTheme.typography.caption.fontSize,
    fontFamily: modernTheme.fonts.semiBold,
    color: modernTheme.colors.white,
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: modernTheme.spacing.medium,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: modernTheme.spacing.extraSmall,
  },
  primaryButton: {
    backgroundColor: modernTheme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: modernTheme.colors.lightGray,
    borderWidth: 1,
    borderColor: modernTheme.colors.mediumGray,
  },
  primaryButtonText: {
    fontSize: modernTheme.typography.body.fontSize,
    fontFamily: modernTheme.fonts.semiBold,
    color: modernTheme.colors.white,
  },
  secondaryButtonText: {
    fontSize: modernTheme.typography.body.fontSize,
    fontFamily: modernTheme.fonts.semiBold,
    color: modernTheme.colors.darkGray,
  },
});

export default BadgeNotificationModal; 