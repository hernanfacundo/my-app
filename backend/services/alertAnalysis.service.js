const Alert = require('../models/Alert');
const Mood = require('../models/Mood');
const GratitudeEntry = require('../models/GratitudeEntry');
const Membership = require('../models/Membership');

class AlertAnalysisService {
  static async analyzeStudentData(studentId, classId) {
    const alerts = [];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // 1. Análisis de estados de ánimo
    const recentMoods = await Mood.find({
      userId: studentId,
      createdAt: { $gte: threeDaysAgo }
    }).sort({ createdAt: -1 });

    // 2. Análisis de gratitud
    const recentGratitude = await GratitudeEntry.find({
      userId: studentId,
      date: { $gte: threeDaysAgo }
    }).sort({ date: -1 });

    // Detectar patrones preocupantes
    await this.detectEmotionalDecline(recentMoods, studentId, classId, alerts);
    await this.detectGratitudeDecline(recentGratitude, studentId, classId, alerts);
    await this.detectPersistentNegative(recentMoods, studentId, classId, alerts);

    return alerts;
  }

  static async detectEmotionalDecline(moods, studentId, classId, alerts) {
    if (moods.length < 2) return;

    const negativeEmotions = ['Triste', 'Ansioso', 'Enojado'];
    const recentNegative = moods.filter(m => 
      negativeEmotions.includes(m.mood)
    ).length;

    if (recentNegative >= 2) {
      alerts.push({
        classId,
        studentId,
        type: 'EMOTIONAL_DECLINE',
        severity: recentNegative >= 3 ? 'HIGH' : 'MEDIUM',
        description: `El estudiante ha mostrado ${recentNegative} estados de ánimo negativos en los últimos 3 días`,
        indicators: [{
          metric: 'negative_moods_count',
          value: recentNegative,
          threshold: 2
        }]
      });
    }
  }

  static async detectGratitudeDecline(gratitudes, studentId, classId, alerts) {
    const previousWeek = new Date();
    previousWeek.setDate(previousWeek.getDate() - 7);
    
    const hasRecentGratitude = gratitudes.some(g => 
      g.date >= previousWeek
    );

    if (!hasRecentGratitude) {
      alerts.push({
        classId,
        studentId,
        type: 'GRATITUDE_DECLINE',
        severity: 'LOW',
        description: 'El estudiante no ha registrado momentos de gratitud en la última semana',
        indicators: [{
          metric: 'days_without_gratitude',
          value: 7,
          threshold: 7
        }]
      });
    }
  }

  static async detectPersistentNegative(moods, studentId, classId, alerts) {
    if (moods.length < 3) return;

    const allNegative = moods.every(m => 
      ['Triste', 'Ansioso', 'Enojado'].includes(m.mood)
    );

    if (allNegative) {
      alerts.push({
        classId,
        studentId,
        type: 'PERSISTENT_NEGATIVE',
        severity: 'HIGH',
        description: 'El estudiante muestra un patrón persistente de estados de ánimo negativos',
        indicators: [{
          metric: 'consecutive_negative_moods',
          value: moods.length,
          threshold: 3
        }]
      });
    }
  }

  static async analyzeClass(classId) {
    try {
      // Obtener todos los estudiantes de la clase
      const memberships = await Membership.find({ classId });
      const studentIds = memberships.map(m => m.alumnoId);

      // Analizar datos de cada estudiante
      for (const studentId of studentIds) {
        const alerts = await this.analyzeStudentData(studentId, classId);
        
        // Guardar nuevas alertas
        if (alerts.length > 0) {
          await Alert.insertMany(alerts);
        }
      }
    } catch (error) {
      console.error('Error en análisis de clase:', error);
    }
  }
}

module.exports = AlertAnalysisService; 