import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import modernTheme from './modernTheme';
import globalStyles from './globalStyles';
import config from '../config';
import CapsulaCard from '../components/CapsulaCard';

const CapsulasBienestarScreen = ({ navigation }) => {
  const [capsulas, setCapsulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});

  // Categorías disponibles con iconos
  const categorias = [
    { key: null, label: 'Todas', icon: '✨' },
    { key: 'mindfulness', label: 'Mindfulness', icon: '🧘‍♂️' },
    { key: 'respiracion', label: 'Respiración', icon: '🌬️' },
    { key: 'autocuidado', label: 'Autocuidado', icon: '💚' },
    { key: 'gestion_estres', label: 'Gestión del Estrés', icon: '🎯' },
    { key: 'motivacion', label: 'Motivación', icon: '⭐' },
    { key: 'equilibrio_vida', label: 'Equilibrio', icon: '⚖️' },
    { key: 'comunicacion', label: 'Comunicación', icon: '💬' },
    { key: 'resiliencia', label: 'Resiliencia', icon: '💪' },
  ];

  // Cargar cápsulas
  const cargarCapsulas = async (categoria = null) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Por favor, inicia sesión nuevamente');
        navigation.navigate('SignIn');
        return;
      }

      let url = `${config.API_BASE_URL}/teacher/capsulas`;
      if (categoria) {
        url += `?categoria=${categoria}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCapsulas(response.data.data.capsulas);
        setEstadisticas(response.data.data.estadisticas);
      }
    } catch (error) {
      console.error('Error cargando cápsulas:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las cápsulas de autocuidado'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Efecto para cargar cápsulas al montar
  useEffect(() => {
    cargarCapsulas(filtroCategoria);
  }, [filtroCategoria]);

  // Manejar refresh
  const onRefresh = () => {
    setRefreshing(true);
    cargarCapsulas(filtroCategoria);
  };

  // Navegar al detalle de la cápsula
  const verDetalleCapsula = (capsula) => {
    navigation.navigate('CapsulaDetalle', { capsula });
  };

  // Navegar a cápsulas guardadas
  const verCapsulasGuardadas = () => {
    navigation.navigate('CapsulasGuardadas');
  };

  // Renderizar filtro de categorías
  const renderFiltros = () => (
    <View style={styles.filtrosContainer}>
      <Text style={styles.filtrosTitle}>Categorías</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosScroll}
        contentContainerStyle={styles.filtrosContent}
      >
        {categorias.map((categoria) => (
          <TouchableOpacity
            key={categoria.key || 'todas'}
            style={[
              styles.filtroBoton,
              filtroCategoria === categoria.key && styles.filtroBotonActivo
            ]}
            onPress={() => setFiltroCategoria(categoria.key)}
          >
            <Text style={styles.filtroIcon}>{categoria.icon}</Text>
            <Text style={[
              styles.filtroTexto,
              filtroCategoria === categoria.key && styles.filtroTextoActivo
            ]}>
              {categoria.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Renderizar estadísticas
  const renderEstadisticas = () => (
    <View style={styles.estadisticasContainer}>
      <Text style={styles.estadisticasTitle}>Tu progreso</Text>
      <View style={styles.estadisticasGrid}>
        <View style={styles.estadisticaItem}>
          <Text style={styles.estadisticaNumero}>{estadisticas.vistasDelDocente || 0}</Text>
          <Text style={styles.estadisticaLabel}>Vistas</Text>
        </View>
        <View style={styles.estadisticaItem}>
          <Text style={styles.estadisticaNumero}>{estadisticas.guardadas || 0}</Text>
          <Text style={styles.estadisticaLabel}>Guardadas</Text>
        </View>
        <View style={styles.estadisticaItem}>
          <Text style={styles.estadisticaNumero}>{estadisticas.totalDisponibles || 0}</Text>
          <Text style={styles.estadisticaLabel}>Disponibles</Text>
        </View>
      </View>
    </View>
  );

  // Renderizar cápsula
  const renderCapsula = ({ item, index }) => (
    <CapsulaCard
      capsula={item}
      index={index}
      onPress={() => verDetalleCapsula(item)}
    />
  );

  // Renderizar header
  const renderHeader = () => (
    <View>
      {renderEstadisticas()}
      {renderFiltros()}
      
      {/* Acceso rápido a guardadas */}
      {estadisticas.guardadas > 0 && (
        <TouchableOpacity
          style={styles.guardadasAcceso}
          onPress={verCapsulasGuardadas}
        >
          <View style={styles.guardadasIcon}>
            <Text style={styles.guardadasIconText}>💾</Text>
          </View>
          <View style={styles.guardadasContent}>
            <Text style={styles.guardadasTitle}>Mis Cápsulas Guardadas</Text>
            <Text style={styles.guardadasSubtitle}>
              {estadisticas.guardadas} cápsulas marcadas
            </Text>
          </View>
          <View style={styles.guardadasArrow}>
            <Text style={styles.guardadasArrowText}>→</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {filtroCategoria ? 
            `${categorias.find(c => c.key === filtroCategoria)?.label || 'Filtradas'}` : 
            'Todas las cápsulas'
          }
        </Text>
        <Text style={styles.listSubtitle}>
          {capsulas.length} cápsula{capsulas.length !== 1 ? 's' : ''} disponible{capsulas.length !== 1 ? 's' : ''}
        </Text>
      </View>
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
          <Text style={styles.headerTitle}>Tu Bienestar</Text>
          <Text style={styles.headerSubtitle}>Cápsulas de autocuidado</Text>
        </View>
      </View>

      <FlatList
        data={capsulas}
        renderItem={renderCapsula}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
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
    backgroundColor: modernTheme.colors.chartBackground,
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
  estadisticasContainer: {
    backgroundColor: modernTheme.colors.lightBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  estadisticasTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
    marginBottom: 16,
  },
  estadisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  estadisticaItem: {
    alignItems: 'center',
  },
  estadisticaNumero: {
    fontSize: 24,
    fontWeight: '700',
    color: modernTheme.colors.coral,
    marginBottom: 4,
  },
  estadisticaLabel: {
    fontSize: 12,
    color: modernTheme.colors.secondaryText,
  },
  filtrosContainer: {
    marginBottom: 20,
  },
  filtrosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  filtrosScroll: {
    flexGrow: 0,
  },
  filtrosContent: {
    paddingRight: 20,
  },
  filtroBoton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.lightBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  filtroBotonActivo: {
    backgroundColor: modernTheme.colors.coral,
  },
  filtroIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filtroTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: modernTheme.colors.primaryText,
  },
  filtroTextoActivo: {
    color: '#FFFFFF',
  },
  guardadasAcceso: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.lightBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  guardadasIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: modernTheme.colors.turquoise,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  guardadasIconText: {
    fontSize: 20,
  },
  guardadasContent: {
    flex: 1,
  },
  guardadasTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: modernTheme.colors.primaryText,
    marginBottom: 4,
  },
  guardadasSubtitle: {
    fontSize: 14,
    color: modernTheme.colors.secondaryText,
  },
  guardadasArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: modernTheme.colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guardadasArrowText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listHeader: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: modernTheme.colors.primaryText,
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 14,
    color: modernTheme.colors.secondaryText,
  },
});

export default CapsulasBienestarScreen; 