import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import modernTheme from './modernTheme';
import config from '../config';
import CapsulaCard from '../components/CapsulaCard';

const CapsulasGuardadasScreen = ({ navigation }) => {
  const [capsulasGuardadas, setCapsulasGuardadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarCapsulasGuardadas = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Por favor, inicia sesión nuevamente');
        navigation.navigate('SignIn');
        return;
      }

      const response = await axios.get(
        `${config.API_BASE_URL}/teacher/capsulas-guardadas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCapsulasGuardadas(response.data.data.capsulas);
      }
    } catch (error) {
      console.error('Error cargando cápsulas guardadas:', error);
      Alert.alert('Error', 'No se pudieron cargar las cápsulas guardadas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarCapsulasGuardadas();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    cargarCapsulasGuardadas();
  };

  const verDetalleCapsula = (capsula) => {
    navigation.navigate('CapsulaDetalle', { capsula });
  };

  const renderCapsulaGuardada = ({ item, index }) => (
    <View style={styles.capsulaContainer}>
      <CapsulaCard
        capsula={item}
        index={index}
        onPress={() => verDetalleCapsula(item)}
      />
      <View style={styles.fechaGuardadaContainer}>
        <Text style={styles.fechaGuardadaTexto}>
          💾 Guardada el {new Date(item.fechaGuardada).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>💾</Text>
      <Text style={styles.emptyTitle}>No tienes cápsulas guardadas</Text>
      <Text style={styles.emptyText}>
        Cuando encuentres cápsulas que te gusten, puedes guardarlas tocando el ícono 💾
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => navigation.navigate('CapsulasBienestar')}
      >
        <Text style={styles.exploreButtonText}>✨ Explorar Cápsulas</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mis Favoritas</Text>
          <Text style={styles.headerSubtitle}>
            {capsulasGuardadas.length} cápsula{capsulasGuardadas.length !== 1 ? 's' : ''} guardada{capsulasGuardadas.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <FlatList
        data={capsulasGuardadas}
        renderItem={renderCapsulaGuardada}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[modernTheme.colors.coral]}
            tintColor={modernTheme.colors.coral}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.chartBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: modernTheme.colors.lightBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: modernTheme.colors.secondaryText,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  capsulaContainer: {
    marginBottom: 8,
  },
  fechaGuardadaContainer: {
    backgroundColor: modernTheme.colors.lightBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: -8,
    marginHorizontal: 8,
  },
  fechaGuardadaTexto: {
    fontSize: 12,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: modernTheme.colors.secondaryText,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: modernTheme.colors.coral,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CapsulasGuardadasScreen; 