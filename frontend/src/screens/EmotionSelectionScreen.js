import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';
import config from '../config'; // Ruta corregida


const EmotionSelectionScreen = ({ route, navigation }) => {
  const { mood } = route.params;

  useEffect(() => {
    console.log('Mood recibido en EmotionSelectionScreen:', mood);
  }, [mood]);

  const emotions = [
    'Feliz',
    'Entusiasmado',
    'Alegre',
    'Contento',
    'Satisfecho',
    'Optimista',
    'Tranquilo',
    'Neutral',
    'Relajado',
    'Confundido',
    'Inseguro',
    'Cansado',
    'Triste',
    'Ansioso',
    'Enojado',
  ];

  if (!emotions.length) {
    Alert.alert('Error', 'No se pudieron cargar las emociones.');
    return (
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Error al cargar las emociones</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Selecciona una emoción específica</Text>
      <View style={styles.emotionContainer}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion}
            style={styles.emotionButton}
            onPress={() => navigation.navigate('PlaceSelection', { mood, emotion })}
          >
            <Text style={styles.emotionText}>{emotion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emotionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emotionButton: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 10,
    margin: theme.spacing.marginSmall,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emotionText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
});

export default EmotionSelectionScreen;