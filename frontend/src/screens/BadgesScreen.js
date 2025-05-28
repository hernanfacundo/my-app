import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import modernTheme from '../screens/modernTheme';
import BadgeCard from '../components/BadgeCard';
import BadgeService from '../services/badgeService';
import CustomModal from '../components/CustomModal';

const { width } = Dimensions.get('window');

const BadgesScreen = ({ navigation }) => {
  const [badges, setBadges] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customModal, setCustomModal] = useState({ 
    visible: false, 
    title: '', 
    message: '', 
    emoji: '', 
    buttonText: 'Entendido' 
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadBadgesData();
  }, []);

  const loadBadgesData = async () => {
    try {
      setLoading(true);
      const [badgesData, statsData] = await Promise.all([
        BadgeService.getUserBadges(),
        BadgeService.getUserStats()
      ]);
      
      setBadges(badgesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading badges data:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las insignias. ¿Quieres intentar de nuevo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Reintentar', onPress: loadBadgesData }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para mostrar modal personalizado
  const showCustomModal = ({ title, message, emoji, buttonText = 'Entendido' }) => {
    setCustomModal({
      visible: true,
      title,
      message,
      emoji,
      buttonText
    });
  };

  // Función para cerrar modal personalizado
  const hideCustomModal = () => {
    setCustomModal({
      visible: false,
      title: '',
      message: '',
      emoji: '',
      buttonText: 'Entendido'
    });
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBadgesData();
    setRefreshing(false);
  }, []);

  const handleBadgePress = (badge) => {
    const message = BadgeService.getBadgeMotivationalMessage(badge);
    showCustomModal({
      title: badge.name,
      message: `${badge.description}\n\n${message}`,
      emoji: badge.emoji,
      buttonText: '¡Genial! 🎉'
    });
  };

  // Filtrar insignias por categoría
  const getFilteredBadges = () => {
    if (selectedCategory === 'all') return badges;
    return badges.filter(badge => badge.category === selectedCategory);
  };

  // Obtener estadísticas de insignias
  const unlockedBadges = badges.filter(badge => badge.isUnlocked);
  const totalBadges = badges.length;
  const completionPercentage = totalBadges > 0 ? (unlockedBadges.length / totalBadges) * 100 : 0;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando tus insignias... ✨</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header con estadísticas */}
        <View style={styles.header}>
          <Text style={styles.title}>🏆 Mis Insignias</Text>
          <Text style={styles.subtitle}>
            ¡Colecciona insignias escribiendo gratitud! 
          </Text>
          
          {/* Estadísticas principales */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{unlockedBadges.length}</Text>
              <Text style={styles.statLabel}>Desbloqueadas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.currentStreak || 0}</Text>
              <Text style={styles.statLabel}>Racha Actual</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalEntries || 0}</Text>
              <Text style={styles.statLabel}>Entradas</Text>
            </View>
          </View>

          {/* Barra de progreso general */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>
              Progreso General: {completionPercentage.toFixed(0)}%
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${completionPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressSubtitle}>
              {unlockedBadges.length} de {totalBadges} insignias desbloqueadas
            </Text>
          </View>
        </View>

        {/* Filtros de categoría */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'Todas', emoji: '🎯' },
              { key: 'streak', label: 'Constancia', emoji: '🔥' },
              { key: 'total', label: 'Cantidad', emoji: '📊' },
              { key: 'variety', label: 'Variedad', emoji: '🌈' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedCategory === filter.key && styles.filterButtonActive
                ]}
                onPress={() => setSelectedCategory(filter.key)}
              >
                <Text style={styles.filterEmoji}>{filter.emoji}</Text>
                <Text 
                  style={[
                    styles.filterText,
                    selectedCategory === filter.key && styles.filterTextActive
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Grid de insignias */}
        <View style={styles.badgesGrid}>
          {getFilteredBadges().map((badge, index) => (
            <BadgeCard
              key={badge.id || index}
              badge={badge}
              onPress={handleBadgePress}
              size="medium"
            />
          ))}
        </View>

        {/* Mensaje motivacional */}
        <View style={styles.motivationSection}>
          <Text style={styles.motivationTitle}>💪 ¡Sigue así!</Text>
          <Text style={styles.motivationText}>
            {getMotivationalMessage(unlockedBadges.length, totalBadges, stats)}
          </Text>
        </View>

        {/* Espacio inferior */}
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {/* Modal personalizado para mensajes */}
      <CustomModal
        visible={customModal.visible}
        title={customModal.title}
        message={customModal.message}
        emoji={customModal.emoji}
        buttonText={customModal.buttonText}
        onClose={hideCustomModal}
      />
    </View>
  );
};

// Función para obtener mensaje motivacional
const getMotivationalMessage = (unlocked, total, stats) => {
  const percentage = (unlocked / total) * 100;
  
  if (percentage === 100) {
    return "¡Increíble! Has desbloqueado todas las insignias. Eres una leyenda de la gratitud! 🏆";
  } else if (percentage >= 75) {
    return "¡Estás súper cerca! Solo te faltan unas pocas insignias más. ¡No te rindas! 🚀";
  } else if (percentage >= 50) {
    return "¡Vas por buen camino! Ya tienes más de la mitad. ¡Sigue escribiendo gratitud! ✨";
  } else if (percentage >= 25) {
    return "¡Buen comienzo! Cada entrada de gratitud te acerca más a nuevas insignias. 🌟";
  } else if (unlocked > 0) {
    return "¡Genial! Ya desbloqueaste tu primera insignia. ¡Hay muchas más esperándote! 🎉";
  } else {
    return "¡Comienza tu aventura! Escribe tu primera entrada de gratitud para desbloquear insignias. 🌱";
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.background,
  },
  loadingText: {
    fontSize: modernTheme.typography.body.fontSize,
    color: modernTheme.colors.mediumGray,
    fontFamily: modernTheme.fonts.medium,
  },
  header: {
    padding: modernTheme.spacing.large,
    paddingTop: modernTheme.spacing.extraLarge,
  },
  title: {
    fontSize: modernTheme.typography.largeTitle.fontSize,
    fontFamily: modernTheme.fonts.bold,
    color: modernTheme.colors.primary,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.small,
  },
  subtitle: {
    fontSize: modernTheme.typography.body.fontSize,
    fontFamily: modernTheme.fonts.medium,
    color: modernTheme.colors.mediumGray,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.large,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: modernTheme.spacing.large,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: modernTheme.colors.white,
    padding: modernTheme.spacing.medium,
    borderRadius: 12,
    minWidth: 80,
    ...modernTheme.shadows.small,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: modernTheme.fonts.bold,
    color: modernTheme.colors.primary,
  },
  statLabel: {
    fontSize: modernTheme.typography.caption.fontSize,
    fontFamily: modernTheme.fonts.medium,
    color: modernTheme.colors.mediumGray,
    marginTop: 4,
  },
  progressSection: {
    backgroundColor: modernTheme.colors.white,
    padding: modernTheme.spacing.medium,
    borderRadius: 12,
    ...modernTheme.shadows.small,
  },
  progressTitle: {
    fontSize: modernTheme.typography.body.fontSize,
    fontFamily: modernTheme.fonts.semiBold,
    color: modernTheme.colors.darkGray,
    textAlign: 'center',
    marginBottom: modernTheme.spacing.small,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: modernTheme.colors.lightGray,
    borderRadius: 4,
    marginBottom: modernTheme.spacing.small,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: modernTheme.colors.primary,
    borderRadius: 4,
  },
  progressSubtitle: {
    fontSize: modernTheme.typography.caption.fontSize,
    fontFamily: modernTheme.fonts.medium,
    color: modernTheme.colors.mediumGray,
    textAlign: 'center',
  },
  filtersContainer: {
    paddingHorizontal: modernTheme.spacing.medium,
    marginBottom: modernTheme.spacing.medium,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.white,
    paddingHorizontal: modernTheme.spacing.medium,
    paddingVertical: modernTheme.spacing.small,
    borderRadius: 20,
    marginRight: modernTheme.spacing.small,
    borderWidth: 1,
    borderColor: modernTheme.colors.lightGray,
  },
  filterButtonActive: {
    backgroundColor: modernTheme.colors.primary,
    borderColor: modernTheme.colors.primary,
  },
  filterEmoji: {
    fontSize: 16,
    marginRight: modernTheme.spacing.extraSmall,
  },
  filterText: {
    fontSize: modernTheme.typography.caption.fontSize,
    fontFamily: modernTheme.fonts.medium,
    color: modernTheme.colors.darkGray,
  },
  filterTextActive: {
    color: modernTheme.colors.white,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: modernTheme.spacing.small,
  },
  motivationSection: {
    margin: modernTheme.spacing.large,
    padding: modernTheme.spacing.medium,
    backgroundColor: modernTheme.colors.secondary,
    borderRadius: 12,
    alignItems: 'center',
  },
  motivationTitle: {
    fontSize: modernTheme.typography.title.fontSize,
    fontFamily: modernTheme.fonts.bold,
    color: modernTheme.colors.white,
    marginBottom: modernTheme.spacing.small,
  },
  motivationText: {
    fontSize: modernTheme.typography.body.fontSize,
    fontFamily: modernTheme.fonts.medium,
    color: modernTheme.colors.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSpace: {
    height: modernTheme.spacing.extraLarge,
  },
});

export default BadgesScreen; 