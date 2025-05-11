import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import theme from '../theme';

const CustomButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: theme.spacing.marginSmall,
  },
  buttonText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
});

export default CustomButton;
