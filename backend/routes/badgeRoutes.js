const express = require('express');
const BadgeService = require('../services/badgeService');
const UserBadge = require('../models/UserBadge');
const UserProgress = require('../models/UserProgress');
const GratitudeEntry = require('../models/GratitudeEntry');

// Función para crear las rutas con el middleware de autenticación
const createBadgeRoutes = (authenticateToken) => {
  const router = express.Router();

  // Obtener todas las insignias del usuario
  router.get('/user-badges', authenticateToken, async (req, res) => {
    try {
      const badges = await BadgeService.getUserBadges(req.user.id);
      res.json({
        success: true,
        data: badges
      });
    } catch (error) {
      console.error('Error getting user badges:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las insignias del usuario'
      });
    }
  });

  // Obtener estadísticas del usuario
  router.get('/user-stats', authenticateToken, async (req, res) => {
    try {
      const stats = await BadgeService.getUserStats(req.user.id);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener las estadísticas del usuario'
      });
    }
  });

  // Marcar insignia como notificada (para evitar mostrar el modal repetidamente)
  router.post('/mark-notified/:badgeId', authenticateToken, async (req, res) => {
    try {
      const { badgeId } = req.params;
      await UserBadge.findOneAndUpdate(
        { userId: req.user.id, badgeId },
        { isNotified: true }
      );
      
      res.json({
        success: true,
        message: 'Insignia marcada como notificada'
      });
    } catch (error) {
      console.error('Error marking badge as notified:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar la insignia'
      });
    }
  });

  // NUEVO: Dashboard de monitoreo del sistema (solo para admins/teachers)
  router.get('/system-stats', authenticateToken, async (req, res) => {
    try {
      // Verificar permisos (solo teachers y admins)
      if (!['teacher', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado'
        });
      }

      console.log('📊 [BadgeRoutes] Generando estadísticas del sistema...');

      // Estadísticas generales
      const totalUsers = await UserProgress.countDocuments();
      const totalBadges = await UserBadge.countDocuments();
      const totalEntries = await GratitudeEntry.countDocuments();

      // Usuarios activos (con al menos una entrada en los últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsers = await GratitudeEntry.distinct('userId', {
        date: { $gte: sevenDaysAgo }
      });

      // Insignias más populares
      const badgePopularity = await UserBadge.aggregate([
        {
          $group: {
            _id: '$badgeId',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]);

      // Estadísticas de streaks
      const streakStats = await UserProgress.aggregate([
        {
          $group: {
            _id: null,
            avgCurrentStreak: { $avg: '$currentStreak' },
            maxCurrentStreak: { $max: '$currentStreak' },
            avgLongestStreak: { $avg: '$longestStreak' },
            maxLongestStreak: { $max: '$longestStreak' }
          }
        }
      ]);

      // Categorías más utilizadas
      const categoryStats = await UserProgress.aggregate([
        { $unwind: '$categoriesUsed' },
        {
          $group: {
            _id: '$categoriesUsed.category',
            totalCount: { $sum: '$categoriesUsed.count' },
            userCount: { $sum: 1 }
          }
        },
        { $sort: { totalCount: -1 } }
      ]);

      // Actividad por día de la semana
      const weeklyActivity = await GratitudeEntry.aggregate([
        {
          $group: {
            _id: { $dayOfWeek: '$date' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } }
      ]);

      const response = {
        success: true,
        data: {
          overview: {
            totalUsers,
            totalBadges,
            totalEntries,
            activeUsers: activeUsers.length,
            avgEntriesPerUser: totalUsers > 0 ? (totalEntries / totalUsers).toFixed(2) : 0
          },
          streaks: streakStats[0] || {
            avgCurrentStreak: 0,
            maxCurrentStreak: 0,
            avgLongestStreak: 0,
            maxLongestStreak: 0
          },
          badges: {
            totalAwarded: totalBadges,
            popularity: badgePopularity
          },
          categories: categoryStats,
          activity: {
            weeklyDistribution: weeklyActivity,
            lastWeekActiveUsers: activeUsers.length
          }
        }
      };

      console.log('✅ [BadgeRoutes] Estadísticas generadas exitosamente');
      res.json(response);

    } catch (error) {
      console.error('❌ [BadgeRoutes] Error getting system stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas del sistema'
      });
    }
  });

  return router;
};

module.exports = createBadgeRoutes; 