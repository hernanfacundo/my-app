import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import useTutorial from '../hooks/useTutorial';
import OnboardingTutorial from './OnboardingTutorial';

const TutorialWrapper = ({ children }) => {
  const { user } = useAuth();
  const { shouldShowTutorial, isLoading, markTutorialAsShown } = useTutorial();

  // Mostrar loading mientras verificamos el estado
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CD6C2" />
      </View>
    );
  }

  // Solo mostrar tutorial para estudiantes que no lo han visto
  const shouldShowOnboarding = 
    user?.role === 'student' && shouldShowTutorial;

  if (shouldShowOnboarding) {
    return (
      <OnboardingTutorial 
        onComplete={markTutorialAsShown}
      />
    );
  }

  // Mostrar contenido normal
  return children;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
  },
});

export default TutorialWrapper; 