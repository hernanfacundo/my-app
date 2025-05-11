import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';

const MoodStartScreen = ({ navigation }) => {
  const moods = [
    { name: 'Feliz', emoji: '😊' },
    { name: 'Triste', emoji: '😔' },
    { name: 'Ansioso', emoji: '😣' },
    { name: 'Relajado', emoji: '😌' },
    { name: 'Enojado', emoji: '😣' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cómo te sientes hoy?</Text>
      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.name}
            style={styles.moodButton}
            onPress={() => navigation.navigate('EmotionSelection', { mood: mood.name })}
          >
            <Text style={styles.emoji}>{mood.emoji}</Text>
            <Text>{mood.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, marginBottom: 20 },
  moodContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  moodButton: { alignItems: 'center', margin: 10, padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10 },
  emoji: { fontSize: 40 },
});

export default MoodStartScreen;