import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import modernTheme from './modernTheme';
import config from '../config';

const GratitudeHistoryScreen = ({ navigation }) => {
  const [gratitudeEntries, setGratitudeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchGratitudeEntries = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Sesión expirada 🔐', 'Por favor, inicia sesión nuevamente para continuar');
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
      Alert.alert('Error al cargar 📚', 'No pudimos cargar tu historial de gratitud. ¿Intentas de nuevo?');
      setGratitudeEntries([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGratitudeEntries();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchGratitudeEntries();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    fetchGratitudeEntries(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Verificar si es hoy
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    
    // Verificar si es ayer
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }

    // Para fechas más antiguas
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return `Hace ${diffDays} días`;
    }

    // Formato completo para fechas más antiguas
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

  const getEntryIcon = (index) => {
    const icons = ['🌟', '✨', '💫', '🌈', '🙏', '💖', '🌸', '🦋', '🌺', '💝'];
    return icons[index % icons.length];
  };

  const getEntryColor = (index) => {
    const colors = [
      modernTheme.colors.turquoise,
      modernTheme.colors.coral,
      modernTheme.colors.pastelYellow,
      modernTheme.colors.lavender
    ];
    return colors[index % colors.length];
  };

  const renderGratitudeEntry = ({ item, index }) => (
    <View style={[styles.entryCard, { borderLeftColor: getEntryColor(index) }]}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryIcon}>{getEntryIcon(index)}</Text>
        <View style={styles.entryInfo}>
          <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
          <Text style={styles.entryTime}>
            {new Date(item.date).toLocaleTimeString('es-ES', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
      <Text style={styles.entryText}>{item.text}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>🌱</Text>
      <Text style={styles.emptyTitle}>¡Tu jardín de gratitud está esperando!</Text>
      <Text style={styles.emptyMessage}>
        No tienes entradas de gratitud en los últimos 7 días. Cada momento de agradecimiento es una semilla de felicidad.
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('GratitudeEntry')}
      >
        <Text style={styles.emptyButtonText}>🌟 Escribir mi primera gratitud</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerStats}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>{gratitudeEntries.length}</Text>
        <Text style={styles.statLabel}>Momentos de gratitud</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>7</Text>
        <Text style={styles.statLabel}>Días revisados</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header moderno */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📖</Text>
        <Text style={styles.title}>Mi Diario de Gratitud</Text>
        <Text style={styles.subtitle}>Tus momentos especiales de los últimos 7 días</Text>
      </View>

      {/* Botón para nueva entrada */}
      <TouchableOpacity
        style={styles.newEntryButton}
        onPress={() => navigation.navigate('GratitudeEntry')}
      >
        <Text style={styles.newEntryEmoji}>✨</Text>
        <Text style={styles.newEntryText}>Escribir nueva gratitud</Text>
        <Text style={styles.newEntryArrow}>→</Text>
      </TouchableOpacity>

      {/* Lista de entradas */}
      <FlatList
        data={gratitudeEntries}
        renderItem={renderGratitudeEntry}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={gratitudeEntries.length > 0 ? renderHeader : null}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[modernTheme.colors.turquoise]}
            tintColor={modernTheme.colors.turquoise}
          />
        }
        contentContainerStyle={gratitudeEntries.length === 0 ? styles.emptyListContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Loading state */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>⏳ Cargando tus momentos de gratitud...</Text>
        </View>
      )}

      {/* Footer motivacional */}
      {gratitudeEntries.length > 0 && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tip: Revisar tu gratitud pasada te ayuda a mantener una perspectiva positiva
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.primaryBackground,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingTop: modernTheme.spacing.paddingXLarge,
    paddingBottom: modernTheme.spacing.paddingMedium,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: modernTheme.spacing.marginMedium,
  },
  title: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginSmall,
  },
  subtitle: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.turquoise,
    marginHorizontal: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.paddingMedium,
    padding: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
    ...modernTheme.shadows.medium,
  },
  newEntryEmoji: {
    fontSize: 24,
    marginRight: modernTheme.spacing.marginMedium,
  },
  newEntryText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  newEntryArrow: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
  },
  headerStats: {
    flexDirection: 'row',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    marginBottom: modernTheme.spacing.marginLarge,
    gap: modernTheme.spacing.marginMedium,
  },
  statCard: {
    flex: 1,
    backgroundColor: modernTheme.colors.chartBackground,
    padding: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
    alignItems: 'center',
    ...modernTheme.shadows.small,
  },
  statNumber: {
    fontSize: modernTheme.fontSizes.largeTitle,
    fontWeight: 'bold',
    color: modernTheme.colors.turquoise,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  statLabel: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: modernTheme.spacing.paddingLarge,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: modernTheme.spacing.paddingLarge,
  },
  entryCard: {
    backgroundColor: modernTheme.colors.chartBackground,
    borderRadius: modernTheme.borderRadius.medium,
    padding: modernTheme.spacing.paddingMedium,
    marginBottom: modernTheme.spacing.marginMedium,
    borderLeftWidth: 4,
    ...modernTheme.shadows.medium,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  entryIcon: {
    fontSize: 24,
    marginRight: modernTheme.spacing.marginMedium,
  },
  entryInfo: {
    flex: 1,
  },
  entryDate: {
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    marginBottom: modernTheme.spacing.marginTiny,
  },
  entryTime: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
  },
  entryText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.primaryText,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: modernTheme.spacing.paddingXLarge,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: modernTheme.spacing.marginLarge,
  },
  emptyTitle: {
    fontSize: modernTheme.fontSizes.title,
    fontWeight: 'bold',
    color: modernTheme.colors.primaryText,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.marginMedium,
  },
  emptyMessage: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: modernTheme.spacing.marginXLarge,
    paddingHorizontal: modernTheme.spacing.paddingMedium,
  },
  emptyButton: {
    backgroundColor: modernTheme.colors.turquoise,
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingVertical: modernTheme.spacing.paddingMedium,
    borderRadius: modernTheme.borderRadius.medium,
    ...modernTheme.shadows.medium,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: modernTheme.fontSizes.body,
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: modernTheme.fontSizes.body,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: modernTheme.spacing.paddingLarge,
    paddingVertical: modernTheme.spacing.paddingMedium,
    alignItems: 'center',
  },
  footerText: {
    fontSize: modernTheme.fontSizes.caption,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});

export default GratitudeHistoryScreen;