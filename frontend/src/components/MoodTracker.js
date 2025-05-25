import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts, spacing, shadows } from '../styles';

const moods = [
  { id: 5, label: 'Excelente', emoji: '😊', color: '#4CAF50' },
  { id: 4, label: 'Muy bien', emoji: '🙂', color: '#8BC34A' },
  { id: 3, label: 'Bien', emoji: '😐', color: '#FFC107' },
  { id: 2, label: 'Más o menos', emoji: '😕', color: '#FF9800' },
  { id: 1, label: 'No tan bien', emoji: '😔', color: '#FF5722' }
];

const MoodTracker = ({ onMoodSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Cómo te sientes hoy?</Text>
      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[styles.moodButton, { backgroundColor: mood.color }]}
            onPress={() => onMoodSelect(mood)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.normal,
    padding: spacing.normal,
    margin: spacing.normal,
    ...shadows.default,
  },
  title: {
    fontSize: fonts.size.large,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginBottom: spacing.normal,
    textAlign: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: spacing.normal,
  },
  moodButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.normal,
    borderRadius: spacing.normal,
    width: '45%',
    aspectRatio: 1,
    ...shadows.default,
  },
  moodEmoji: {
    fontSize: fonts.size.title * 1.5,
    marginBottom: spacing.small,
  },
  moodLabel: {
    fontSize: fonts.size.small,
    fontWeight: fonts.weight.medium,
    color: colors.white,
    textAlign: 'center',
  },
});

export default MoodTracker; 