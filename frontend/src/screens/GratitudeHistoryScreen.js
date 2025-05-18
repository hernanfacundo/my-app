import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import globalStyles from '../screens/globalStyles';
import theme from '../screens/theme';
import config from '../config'; // Ruta corregida

const GratitudeHistoryScreen = ({ navigation }) => {
  const [gratitudeEntries, setGratitudeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGratitudeEntries = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Por favor, inicia sesión nuevamente');
        navigation.navigate('SignIn');
        return;
      }

      const response = await axios.get(`${config.API_BASE_URL}/gratitude/last-seven-days`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Entradas de gratitud:', response.data);
      setGratitudeEntries(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar el historial:', error.response?.data || error.message);
      Alert.alert('Error', 'No se pudo cargar el historial de gratitud.');
      setGratitudeEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGratitudeEntries();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchGratitudeEntries();
    });

    return unsubscribe;
  }, [navigation]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = monthNames[date.getMonth()];
    return `${dayName} ${day} de ${month}`;
  };

  const renderGratitudeEntry = ({ item }) => (
    <View style={styles.entryCard}>
      <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
      <Text style={styles.entryText}>{item.text} 🌟</Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Mi Diario de Gratitud 📝</Text>
      {isLoading ? (
        <Text style={globalStyles.secondaryText}>Cargando...</Text>
      ) : gratitudeEntries.length === 0 ? (
        <Text style={globalStyles.secondaryText}>No hay entradas en los últimos 7 días. ¡Empieza hoy! 🌈</Text>
      ) : (
        <FlatList
          data={gratitudeEntries}
          renderItem={renderGratitudeEntry}
          keyExtractor={(item) => item._id}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    marginTop: theme.spacing.marginSmall,
  },
  entryCard: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 8,
    padding: theme.spacing.paddingMedium,
    marginBottom: theme.spacing.marginSmall,
    borderColor: theme.colors.accent,
    borderWidth: 1,
  },
  entryDate: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.primaryText,
    fontWeight: 'bold',
  },
  entryText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    marginTop: theme.spacing.marginSmall,
  },
});

export default GratitudeHistoryScreen;