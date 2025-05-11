import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import theme from './theme';
import globalStyles from './globalStyles';

const screenWidth = Dimensions.get('window').width;

const MoodHistoryScreen = () => {
  const [moodData, setMoodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMoodHistory = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      console.log('Token:', token);
      console.log('UserId:', userId);

      if (!userId) {
        console.error('Error: userId no está disponible');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('Solicitando historial desde:', `${config.API_BASE_URL}/moods`);
      
      const response = await axios.get(
        `${config.API_BASE_URL}/moods`, // Cambiado a /moods
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Respuesta del backend:', response.data);

      const moodValues = response.data.data.map(entry => ({
        value: getMoodValue(entry.mood),
        date: new Date(entry.date).toLocaleDateString()
      }));

      setMoodData(moodValues);
    } catch (error) {
      console.error('Error al obtener historial:', error.response?.data || error.message);
      console.error('Código de estado:', error.response?.status);
      console.error('Detalles completos del error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchMoodHistory();
  }, []);

  const getMoodValue = (mood) => {
    const moodValues = {
      'Muy mal': 1,
      'Mal': 2,
      'Regular': 3,
      'Bien': 4,
      'Muy bien': 5
    };
    return moodValues[mood] || 3;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  const chartData = {
    labels: moodData.map(entry => entry.date),
    datasets: [{
      data: moodData.map(entry => entry.value)
    }]
  };

  const chartConfig = {
    backgroundColor: theme.colors.chartBackground,
    backgroundGradientFrom: theme.colors.chartBackground,
    backgroundGradientTo: theme.colors.chartBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.accent
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={globalStyles.title}>Mi Historia Emocional</Text>
      
      {moodData.length === 0 ? (
        <Text style={styles.noDataText}>
          Aún no hay registros. ¡Comienza a registrar cómo te sientes!
        </Text>
      ) : (
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
          />
          <Text style={styles.chartLabel}>Últimos 7 días</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primaryBackground,
    padding: theme.spacing.padding
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartContainer: {
    marginVertical: theme.spacing.marginLarge,
    backgroundColor: theme.colors.chartBackground,
    borderRadius: 10,
    padding: theme.spacing.padding,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  chart: {
    marginVertical: theme.spacing.marginMedium,
    borderRadius: 16
  },
  chartLabel: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: theme.spacing.marginSmall
  },
  noDataText: {
    fontSize: theme.fontSizes.body,
    color: theme.colors.secondaryText,
    textAlign: 'center',
    marginTop: theme.spacing.marginLarge
  }
});

export default MoodHistoryScreen;