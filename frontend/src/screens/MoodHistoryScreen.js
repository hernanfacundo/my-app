import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import globalStyles from './globalStyles';
import theme from './theme';
import config from '../config';

const MoodHistoryScreen = () => {
  const { user } = useContext(AuthContext);
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMoodHistory = async () => {
    try {
      if (!user || !user.token) {
        console.error('No user token available - forcing reload');
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setUser({ token: storedToken });
        } else {
          throw new Error('No token available even after reload');
        }
      }
      const url = `${config.API_BASE_URL.replace(/\/api$/, '')}/api/moods`; // Elimina /api duplicado
      console.log('Enviando solicitud a:', url, 'con token:', user.token);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMoodData(response.data);
    } catch (error) {
      console.error('Error al obtener historial:', error.message);
      console.error('Código de estado:', error.response?.status);
      console.error('Detalles completos del error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMoodHistory();
  }, [user]); // Añade user como dependencia para recargar si cambia

  const onRefresh = () => {
    setRefreshing(true);
    fetchMoodHistory();
  };

  if (loading) {
    return (
      <View style={globalStyles.container}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Historial de Estados de Ánimo</Text>
      <FlatList
        data={moodData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={globalStyles.card}>
            <Text>Emoción: {item.emotion}</Text>
            <Text>Lugar: {item.place}</Text>
            <Text>Comentario: {item.comment || 'Sin comentario'}</Text>
            <Text>Fecha: {new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.accent]} />
        }
      />
    </View>
  );
};

export default MoodHistoryScreen;