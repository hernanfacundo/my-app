import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useTutorial = () => {
  const [shouldShowTutorial, setShouldShowTutorial] = useState(null); // null = loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTutorialStatus();
  }, []);

  const checkTutorialStatus = async () => {
    try {
      setIsLoading(true);
      const tutorialShown = await AsyncStorage.getItem('tutorialShown');
      
      // Si no existe el flag o es false, mostrar tutorial
      setShouldShowTutorial(!tutorialShown || tutorialShown !== 'true');
    } catch (error) {
      console.error('Error verificando estado del tutorial:', error);
      // En caso de error, no mostrar tutorial para evitar bloqueos
      setShouldShowTutorial(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markTutorialAsShown = async () => {
    try {
      await AsyncStorage.setItem('tutorialShown', 'true');
      setShouldShowTutorial(false);
    } catch (error) {
      console.error('Error marcando tutorial como visto:', error);
      // Continuar aunque falle el guardado
      setShouldShowTutorial(false);
    }
  };

  const resetTutorial = async () => {
    try {
      await AsyncStorage.removeItem('tutorialShown');
      setShouldShowTutorial(true);
    } catch (error) {
      console.error('Error reseteando tutorial:', error);
    }
  };

  return {
    shouldShowTutorial,
    isLoading,
    markTutorialAsShown,
    resetTutorial,
    checkTutorialStatus,
  };
};

export default useTutorial; 