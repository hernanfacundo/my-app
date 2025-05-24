// ./src/screens/JoinClassScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import config from '../config';
import theme from './theme';
import globalStyles from './globalStyles';

// Reutilizamos el CustomButton del DashboardScreen
const CustomButton = ({ title, onPress }) => (
  <TouchableOpacity style={[globalStyles.button]} onPress={onPress}>
    <Text style={globalStyles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const JoinClassScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [classCode, setClassCode] = useState('');

  const handleJoinClass = async () => {
    try {
      if (!classCode.trim()) {
        Alert.alert('Error', 'Por favor ingresa el código de la clase');
        return;
      }

      const response = await axios.post(
        `${config.API_BASE_URL}/classes/${classCode}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` }
        }
      );

      Alert.alert(
        'Éxito',
        'Te has unido a la clase correctamente',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ClassList')
          }
        ]
      );
    } catch (error) {
      console.error('Error al unirse a la clase:', error);
      let errorMessage = 'No se pudo unir a la clase';
      
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'El código de clase no existe';
        } else if (error.response.status === 400) {
          errorMessage = 'Ya estás inscrito en esta clase';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[globalStyles.title, styles.welcomeText]}>
          Unirse a una Clase
        </Text>
      </View>

      {/* Contenido principal */}
      <View style={styles.contentContainer}>
        {/* Botón Ver Mis Clases */}
        <CustomButton
          title="Ver Mis Clases"
          onPress={() => navigation.navigate('ClassList')}
        />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>¿Cómo unirte a una clase?</Text>
          <Text style={styles.infoText}>
            1. Solicita el código a tu profesor{'\n'}
            2. Ingresa el código en el campo de abajo{'\n'}
            3. Presiona "Unirme a la Clase"
          </Text>
        </View>

        <TextInput
          style={[globalStyles.input, styles.input]}
          placeholder="Ingresa el código de la clase"
          placeholderTextColor={theme.colors.secondaryText}
          value={classCode}
          onChangeText={setClassCode}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <CustomButton
          title="Unirme a la Clase"
          onPress={handleJoinClass}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primaryBackground,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.marginLarge,
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: theme.spacing.marginMedium,
  },
  contentContainer: {
    alignItems: 'center',
    padding: theme.spacing.padding,
    gap: theme.spacing.marginMedium,
  },
  infoCard: {
    backgroundColor: theme.colors.chartBackground,
    borderRadius: 8,
    padding: theme.spacing.paddingMedium,
    marginBottom: theme.spacing.marginLarge,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: theme.fontSizes.subtitle,
    color: theme.colors.primaryText,
    fontWeight: '600',
    marginBottom: theme.spacing.marginSmall,
  },
  infoText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    lineHeight: 24,
  },
  input: {
    width: '100%',
    marginBottom: theme.spacing.marginLarge,
    backgroundColor: theme.colors.chartBackground,
    color: theme.colors.primaryText,
  },
  button: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.padding * 0.8,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginVertical: theme.spacing.marginSmall,
  },
  buttonText: {
    color: theme.colors.chartBackground,
    fontSize: theme.fontSizes.label,
    fontWeight: '500',
  },
});

export default JoinClassScreen;
