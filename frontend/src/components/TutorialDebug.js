import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TutorialDebug = () => {
  const resetTutorial = async () => {
    try {
      await AsyncStorage.removeItem('tutorialShown');
      Alert.alert(
        '✅ Tutorial reseteado',
        'El tutorial se mostrará en el próximo login de un estudiante.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error reseteando tutorial:', error);
      Alert.alert('❌ Error', 'No se pudo resetear el tutorial');
    }
  };

  const checkTutorialStatus = async () => {
    try {
      const tutorialShown = await AsyncStorage.getItem('tutorialShown');
      Alert.alert(
        '📊 Estado del Tutorial',
        `Tutorial mostrado: ${tutorialShown ? 'Sí' : 'No'}\nValor: ${tutorialShown}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error verificando tutorial:', error);
      Alert.alert('❌ Error', 'No se pudo verificar el estado');
    }
  };

  // Solo mostrar en desarrollo
  if (__DEV__) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={resetTutorial}>
          <Text style={styles.buttonText}>🔄 Resetear Tutorial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={checkTutorialStatus}>
          <Text style={styles.buttonText}>📊 Ver Estado</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
    gap: 10,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 0.8,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TutorialDebug; 