import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import modernTheme from '../screens/modernTheme';

const LoadingOverlay = ({ 
  visible, 
  title = 'Cargando...', 
  step = '', 
  progress = 0 
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={modernTheme.colors.turquoise} />
        <Text style={styles.title}>{title}</Text>
        {step !== '' && <Text style={styles.step}>{step}</Text>}
        
        {progress > 0 && (
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.large,
    padding: modernTheme.spacing.paddingXLarge,
    alignItems: 'center',
    margin: modernTheme.spacing.marginLarge,
    minWidth: 250,
    ...modernTheme.shadows.large,
  },
  title: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginTop: modernTheme.spacing.marginMedium,
    marginBottom: modernTheme.spacing.marginSmall,
    textAlign: 'center',
  },
  step: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.turquoise,
    marginBottom: modernTheme.spacing.marginLarge,
    textAlign: 'center',
  },
  progressBar: {
    width: 200,
    height: 6,
    backgroundColor: modernTheme.colors.lavender,
    borderRadius: modernTheme.borderRadius.small,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: modernTheme.colors.turquoise,
    borderRadius: modernTheme.borderRadius.small,
  },
});

export default LoadingOverlay; 