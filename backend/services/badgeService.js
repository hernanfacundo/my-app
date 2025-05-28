const UserProgress = require('../models/UserProgress');
const UserBadge = require('../models/UserBadge');
const { BADGES_CONFIG, GRATITUDE_CATEGORIES, BADGE_MESSAGES } = require('../config/badges');

class BadgeService {
  
  /**
   * Categoriza automáticamente una entrada de gratitud
   */
  static categorizeGratitude(text) {
    console.log('🏷️ [BadgeService] Categorizando gratitud:', text.substring(0, 50) + '...');
    const lowerText = text.toLowerCase();
    
    // Buscar en cada categoría
    for (const [categoryKey, categoryData] of Object.entries(GRATITUDE_CATEGORIES)) {
      for (const keyword of categoryData.keywords) {
        if (lowerText.includes(keyword)) {
          console.log(`✅ [BadgeService] Categoría detectada: ${categoryKey} (palabra clave: "${keyword}")`);
          return categoryKey;
        }
      }
    }
    
    // Categoría por defecto si no encuentra coincidencias
    console.log('📝 [BadgeService] Usando categoría por defecto: momentos');
    return 'momentos';
  }

  /**
   * Calcula el streak actual basado en las fechas de entradas
   */
  static calculateStreak(entries) {
    console.log(`📊 [BadgeService] Calculando streak con ${entries?.length || 0} entradas`);
    
    if (!entries || entries.length === 0) {
      console.log('⚠️ [BadgeService] No hay entradas, streak = 0');
      return 0;
    }

    // Ordenar entradas por fecha descendente (más reciente primero)
    const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Obtener fechas únicas (sin duplicados del mismo día)
    const uniqueDates = [];
    const seenDates = new Set();
    
    for (const entry of sortedEntries) {
      const dateStr = new Date(entry.date).toDateString();
      if (!seenDates.has(dateStr)) {
        seenDates.add(dateStr);
        uniqueDates.push(new Date(entry.date));
      }
    }
    
    if (uniqueDates.length === 0) {
      console.log('⚠️ [BadgeService] No hay fechas únicas, streak = 0');
      return 0;
    }
    
    // Calcular streak desde la fecha más reciente
    let streak = 1; // Empezamos con 1 porque tenemos al menos una entrada
    let expectedDate = new Date(uniqueDates[0]);
    expectedDate.setDate(expectedDate.getDate() - 1); // Día anterior esperado
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      
      // Normalizar fechas para comparar solo día/mes/año
      expectedDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      if (currentDate.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1); // Siguiente día anterior esperado
      } else {
        // Si no es consecutivo, terminar el streak
        break;
      }
    }

    console.log(`🔥 [BadgeService] Streak calculado: ${streak} días consecutivos`);
    console.log(`📅 [BadgeService] Fechas procesadas: ${uniqueDates.map(d => d.toDateString()).join(', ')}`);
    return streak;
  }

  /**
   * Actualiza el progreso del usuario después de una nueva entrada
   */
  static async updateUserProgress(userId, newEntry, allUserEntries) {
    try {
      console.log(`📈 [BadgeService] Actualizando progreso para usuario: ${userId}`);
      
      let progress = await UserProgress.findOne({ userId });
      
      if (!progress) {
        console.log('🆕 [BadgeService] Creando nuevo registro de progreso');
        progress = new UserProgress({ userId });
      } else {
        console.log('📊 [BadgeService] Progreso existente encontrado');
      }

      // Calcular nuevo streak
      const newStreak = this.calculateStreak(allUserEntries);
      const oldStreak = progress.currentStreak;
      progress.currentStreak = newStreak;
      progress.longestStreak = Math.max(progress.longestStreak, newStreak);
      
      // Actualizar total de entradas
      const oldTotal = progress.totalEntries;
      progress.totalEntries = allUserEntries.length;
      progress.lastEntryDate = new Date();

      // Categorizar la nueva entrada
      const category = this.categorizeGratitude(newEntry.text);
      
      // Actualizar categorías usadas
      const existingCategory = progress.categoriesUsed.find(cat => cat.category === category);
      const oldCategoriesCount = progress.categoriesUsed.length;
      
      if (existingCategory) {
        existingCategory.count++;
        console.log(`📝 [BadgeService] Categoría existente actualizada: ${category} (${existingCategory.count} veces)`);
      } else {
        progress.categoriesUsed.push({
          category,
          count: 1,
          firstUsed: new Date()
        });
        console.log(`🆕 [BadgeService] Nueva categoría agregada: ${category}`);
      }

      await progress.save();
      
      console.log(`✅ [BadgeService] Progreso actualizado:`, {
        streak: `${oldStreak} → ${newStreak}`,
        total: `${oldTotal} → ${progress.totalEntries}`,
        categories: `${oldCategoriesCount} → ${progress.categoriesUsed.length}`
      });
      
      return progress;
    } catch (error) {
      console.error('❌ [BadgeService] Error updating user progress:', error);
      throw error;
    }
  }

  /**
   * Verifica si el usuario ha desbloqueado nuevas insignias
   */
  static async checkForNewBadges(userId, progress) {
    try {
      console.log(`🏆 [BadgeService] Verificando nuevas insignias para usuario: ${userId}`);
      
      const existingBadges = await UserBadge.find({ userId }).select('badgeId');
      const existingBadgeIds = existingBadges.map(badge => badge.badgeId);
      const newBadges = [];

      console.log(`📋 [BadgeService] Insignias existentes: ${existingBadgeIds.length} (${existingBadgeIds.join(', ')})`);

      // Verificar insignias de streak
      for (const badge of BADGES_CONFIG.streak) {
        if (progress.currentStreak >= badge.criteria && !existingBadgeIds.includes(badge.id)) {
          newBadges.push(badge);
          console.log(`🔥 [BadgeService] Nueva insignia de streak desbloqueada: ${badge.name} (${badge.criteria} días)`);
        }
      }

      // Verificar insignias de total
      for (const badge of BADGES_CONFIG.total) {
        if (progress.totalEntries >= badge.criteria && !existingBadgeIds.includes(badge.id)) {
          newBadges.push(badge);
          console.log(`📈 [BadgeService] Nueva insignia de total desbloqueada: ${badge.name} (${badge.criteria} entradas)`);
        }
      }

      // Verificar insignias de variedad
      for (const badge of BADGES_CONFIG.variety) {
        if (progress.categoriesUsed.length >= badge.criteria && !existingBadgeIds.includes(badge.id)) {
          newBadges.push(badge);
          console.log(`🌈 [BadgeService] Nueva insignia de variedad desbloqueada: ${badge.name} (${badge.criteria} categorías)`);
        }
      }

      // Guardar nuevas insignias
      for (const badge of newBadges) {
        await UserBadge.create({
          userId,
          badgeId: badge.id,
          unlockedAt: new Date()
        });
        console.log(`💾 [BadgeService] Insignia guardada en BD: ${badge.id}`);
      }

      if (newBadges.length === 0) {
        console.log('📝 [BadgeService] No se desbloquearon nuevas insignias');
      } else {
        console.log(`🎉 [BadgeService] Total de nuevas insignias: ${newBadges.length}`);
      }

      return newBadges;
    } catch (error) {
      console.error('❌ [BadgeService] Error checking for new badges:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las insignias del usuario con su estado
   */
  static async getUserBadges(userId) {
    try {
      const userBadges = await UserBadge.find({ userId });
      const userBadgeIds = userBadges.map(badge => badge.badgeId);
      const progress = await UserProgress.findOne({ userId }) || {};

      const allBadges = [
        ...BADGES_CONFIG.streak,
        ...BADGES_CONFIG.total,
        ...BADGES_CONFIG.variety
      ];

      return allBadges.map(badge => ({
        ...badge,
        isUnlocked: userBadgeIds.includes(badge.id),
        unlockedAt: userBadges.find(ub => ub.badgeId === badge.id)?.unlockedAt || null,
        progress: this.getBadgeProgress(badge, progress)
      }));
    } catch (error) {
      console.error('Error getting user badges:', error);
      throw error;
    }
  }

  /**
   * Calcula el progreso hacia una insignia específica
   */
  static getBadgeProgress(badge, userProgress) {
    switch (badge.category) {
      case 'streak':
        return {
          current: userProgress.currentStreak || 0,
          required: badge.criteria,
          percentage: Math.min(100, ((userProgress.currentStreak || 0) / badge.criteria) * 100)
        };
      case 'total':
        return {
          current: userProgress.totalEntries || 0,
          required: badge.criteria,
          percentage: Math.min(100, ((userProgress.totalEntries || 0) / badge.criteria) * 100)
        };
      case 'variety':
        return {
          current: userProgress.categoriesUsed?.length || 0,
          required: badge.criteria,
          percentage: Math.min(100, ((userProgress.categoriesUsed?.length || 0) / badge.criteria) * 100)
        };
      default:
        return { current: 0, required: badge.criteria, percentage: 0 };
    }
  }

  /**
   * Obtiene el mensaje motivador para una insignia
   */
  static getBadgeMessage(badge) {
    const messages = BADGE_MESSAGES[badge.category];
    return messages?.[badge.criteria] || `¡Felicidades por desbloquear ${badge.name}! 🎉`;
  }

  /**
   * Obtiene estadísticas generales del usuario
   */
  static async getUserStats(userId) {
    try {
      const progress = await UserProgress.findOne({ userId });
      const userBadges = await UserBadge.find({ userId });

      return {
        currentStreak: progress?.currentStreak || 0,
        longestStreak: progress?.longestStreak || 0,
        totalEntries: progress?.totalEntries || 0,
        totalBadges: userBadges.length,
        categoriesUsed: progress?.categoriesUsed?.length || 0,
        lastEntryDate: progress?.lastEntryDate
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }
}

module.exports = BadgeService; 