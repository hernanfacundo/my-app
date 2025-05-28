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

const { width } = Dimensions.get('window');

const CustomModal = ({ 
  visible, 
  title, 
  message, 
  emoji, 
  buttonText = "Entendido",
  onClose 
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animación de entrada
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
      ]).start();
    } else {
      // Reset animaciones
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

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
      onClose && onClose();
    });
  };

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
          {/* Emoji principal */}
          {emoji && (
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>
          )}

          {/* Título */}
          <Text style={styles.title}>{title}</Text>

          {/* Mensaje */}
          <Text style={styles.message}>{message}</Text>

          {/* Botón de acción */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: modernTheme.spacing.large,
  },
  container: {
    backgroundColor: modernTheme.colors.white,
    borderRadius: 20,
    padding: modernTheme.spacing.large,
    alignItems: 'center',
    maxWidth: width * 0.85,
    minWidth: width * 0.75,
    ...modernTheme.shadows.large,
  },
  emojiContainer: {
    marginBottom: modernTheme.spacing.medium,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: modernTheme.typography.title.fontSize,
    fontFamily: modernTheme.fonts.bold,
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.small,
  },
  message: {
    fontSize: modernTheme.typography.body.fontSize,
    fontFamily: modernTheme.fonts.medium,
    color: modernTheme.colors.mediumGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: modernTheme.spacing.large,
  },
  button: {
    backgroundColor: modernTheme.colors.turquoise,
    paddingHorizontal: modernTheme.spacing.large,
    paddingVertical: modernTheme.spacing.medium,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    ...modernTheme.shadows.small,
  },
  buttonText: {
    fontSize: modernTheme.typography.body.fontSize,
    fontFamily: modernTheme.fonts.semiBold,
    color: modernTheme.colors.white,
  },
});

export default CustomModal; 