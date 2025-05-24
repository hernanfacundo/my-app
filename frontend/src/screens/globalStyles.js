import { StyleSheet } from 'react-native';
import theme from './theme';

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.padding,
    backgroundColor: theme.colors.primaryBackground,
  },
  title: {
    fontSize: theme.fontSizes.title,
    fontWeight: '600',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.marginLarge,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSizes.subtitle,
    fontWeight: '500',
    color: theme.colors.primaryText,
    marginBottom: theme.spacing.marginMedium,
    textAlign: 'center',
  },
  secondaryText: {
    fontSize: theme.fontSizes.label,
    color: theme.colors.secondaryText,
    textAlign: 'center',
  },
  smallLabel: {
    fontSize: theme.fontSizes.smallLabel,
    color: theme.colors.secondaryText,
    textAlign: 'right',
  },
  // Estilos globales para botones
  button: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.padding * 0.6, // Reducido a 60% (40% más bajo que el original)
    paddingHorizontal: theme.spacing.padding,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginVertical: theme.spacing.marginSmall,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSizes.subtitle * 0.8,
    fontWeight: '500',
  },
  // Variantes de botones
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  buttonSecondaryText: {
    color: theme.colors.accent,
  },
  buttonSmall: {
    paddingVertical: theme.spacing.padding * 0.4, // También reducimos el botón pequeño proporcionalmente
    paddingHorizontal: theme.spacing.padding * 0.8,
  },
  buttonSmallText: {
    fontSize: theme.fontSizes.label * 0.8,
  }
});

export default globalStyles;