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
});

export default globalStyles;