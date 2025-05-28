import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const OnboardingTutorial = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const tutorialSteps = [
    {
      icon: '🔒',
      title: 'Tu privacidad es sagrada',
      description: 'Solo tú ves tus textos. Nadie más puede leer lo que escribes al bot.',
      iconSize: 80,
    },
    {
      icon: '📊',
      title: 'Datos anónimos y seguros',
      description: 'El colegio ve datos en grupo, no nombres. Usamos promedios anónimos para mejorar tu bienestar.',
      iconSize: 80,
    },
    {
      icon: '🗑️',
      title: 'Tú tienes el control',
      description: 'Tú mandas: puedes borrar cualquier entrada. Tu control, tu espacio.',
      iconSize: 80,
    },
  ];

  const animateToNext = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep(currentStep + 1);
      slideAnim.setValue(width);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      animateToNext();
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      await AsyncStorage.setItem('tutorialShown', 'true');
      onComplete();
    } catch (error) {
      console.error('Error guardando flag del tutorial:', error);
      onComplete(); // Continuar aunque falle el guardado
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem('tutorialShown', 'true');
      onComplete();
    } catch (error) {
      console.error('Error guardando flag del tutorial:', error);
      onComplete(); // Continuar aunque falle el guardado
    }
  };

  const currentStepData = tutorialSteps[currentStep];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
      
      {/* Botón Omitir */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Omitir</Text>
      </TouchableOpacity>

      {/* Indicadores de progreso */}
      <View style={styles.progressContainer}>
        {tutorialSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Contenido principal */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Icono principal */}
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { fontSize: currentStepData.iconSize }]}>
            {currentStepData.icon}
          </Text>
        </View>

        {/* Título */}
        <Text style={styles.title}>{currentStepData.title}</Text>

        {/* Descripción */}
        <Text style={styles.description}>{currentStepData.description}</Text>
      </Animated.View>

      {/* Botones de navegación */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === tutorialSteps.length - 1 ? '¡Entendido!' : 'Siguiente'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Espaciado inferior */}
      <View style={styles.bottomSpacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 24,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 40,
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
  },
  progressDotActive: {
    backgroundColor: '#5CD6C2',
    width: 32,
    borderRadius: 6,
  },
  progressDotCompleted: {
    backgroundColor: '#5CD6C2',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'System', // Fallback para Poppins
    lineHeight: 36,
  },
  description: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  nextButton: {
    backgroundColor: '#5CD6C2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5CD6C2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default OnboardingTutorial; 