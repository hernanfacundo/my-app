import AsyncStorage from '@react-native-async-storage/async-storage';
import { SAMPLE_BADGES, SAMPLE_STATS } from '../config/badgeConfig';

const API_BASE_URL = 'http://localhost:3000/api';
const USE_SAMPLE_DATA = true; // Cambiar a false cuando el backend esté listo

class BadgeService {
  
  /**
   * Obtiene el token de autenticación almacenado
   */
  static async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  /**
   * Obtiene todas las insignias del usuario
   */
  static async getUserBadges() {
    // Usar datos de ejemplo durante desarrollo
    if (USE_SAMPLE_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(SAMPLE_BADGES), 500); // Simular delay de red
      });
    }

    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/badges/user-badges`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching user badges:', error);
      // Fallback a datos de ejemplo si hay error
      return SAMPLE_BADGES;
    }
  }

  /**
   * Obtiene las estadísticas del usuario
   */
  static async getUserStats() {
    // Usar datos de ejemplo durante desarrollo
    if (USE_SAMPLE_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(SAMPLE_STATS), 500); // Simular delay de red
      });
    }

    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/badges/user-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Fallback a datos de ejemplo si hay error
      return SAMPLE_STATS;
    }
  }

  /**
   * Marca una insignia como notificada
   */
  static async markBadgeAsNotified(badgeId) {
    // Durante desarrollo, solo simular éxito
    if (USE_SAMPLE_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 200);
      });
    }

    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/badges/mark-notified/${badgeId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error marking badge as notified:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas del sistema (solo para teachers/admins)
   */
  static async getSystemStats() {
    // Durante desarrollo, retornar datos vacíos
    if (USE_SAMPLE_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => resolve({}), 500);
      });
    }

    try {
      const token = await this.getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/badges/system-stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error fetching system stats:', error);
      return {};
    }
  }

  /**
   * Obtiene el color del tema para una insignia
   */
  static getBadgeColor(colorName) {
    const colors = {
      turquoise: '#5CD6C2',
      coral: '#FF7F7F',
      pastelYellow: '#FFD966',
      lavender: '#B39DDB'
    };
    return colors[colorName] || '#5CD6C2';
  }

  /**
   * Formatea el progreso de una insignia
   */
  static formatBadgeProgress(badge) {
    if (!badge.progress) return '0%';
    
    const percentage = Math.min(100, badge.progress.percentage);
    return `${badge.progress.current}/${badge.progress.required} (${percentage.toFixed(0)}%)`;
  }

  /**
   * Obtiene el mensaje motivador para una insignia
   */
  static getBadgeMotivationalMessage(badge) {
    if (badge.isUnlocked) {
      return `¡Felicidades! Desbloqueaste ${badge.name} 🎉`;
    }

    const remaining = badge.progress.required - badge.progress.current;
    const category = badge.category;

    switch (category) {
      case 'streak':
        return `¡Solo ${remaining} días más de gratitud consecutiva! 🔥`;
      case 'total':
        return `¡Te faltan ${remaining} entradas para desbloquear esta insignia! 📈`;
      case 'variety':
        return `¡Explora ${remaining} categorías más de gratitud! 🌈`;
      default:
        return `¡Sigue así, estás muy cerca! 💪`;
    }
  }
}

export default BadgeService; 