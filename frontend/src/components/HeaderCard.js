import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, spacing, shadows } from '../styles';

const HeaderCard = ({ userName, userRole }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días! 🌅';
    if (hour < 18) return '¡Buenas tardes! ☀️';
    return '¡Buenas noches! 🌙';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.name}>{userName || 'Estudiante'}</Text>
        <Text style={styles.role}>
          {userRole === 'teacher' ? '👩‍🏫 Docente' : '👨‍🎓 Estudiante'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.normal,
    margin: spacing.normal,
    ...shadows.default,
  },
  content: {
    padding: spacing.large,
  },
  greeting: {
    fontSize: fonts.size.title,
    fontWeight: fonts.weight.bold,
    color: colors.text,
    marginBottom: spacing.small,
  },
  name: {
    fontSize: fonts.size.title,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
    marginBottom: spacing.small,
  },
  role: {
    fontSize: fonts.size.large,
    fontWeight: fonts.weight.medium,
    color: colors.textLight,
  },
});

export default HeaderCard; 