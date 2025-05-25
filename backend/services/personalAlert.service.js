const Alert = require('../models/Alert');
const Mood = require('../models/Mood');
const GratitudeEntry = require('../models/GratitudeEntry');

class PersonalAlertService {
  static async analyzePersonalData(userId) {
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // 1. Análisis de estados de ánimo recientes
      const moodQuery = Mood.find({
        userId,
        createdAt: { $gte: threeDaysAgo }
      }).sort({ createdAt: -1 });

      // 2. Análisis de gratitud
      const gratitudeQuery = GratitudeEntry.find({
        userId,
        date: { $gte: threeDaysAgo }
      }).sort({ date: -1 });

      // Esperar a que ambas consultas se completen
      const [recentMoods, recentGratitude] = await Promise.all([
        moodQuery.exec(),
        gratitudeQuery.exec()
      ]);

      // 3. Detectar patrones y generar recomendaciones
      const patterns = await this.analyzePatterns(recentMoods || [], recentGratitude || []);
      
      return {
        patterns,
        recommendations: this.generateRecommendations(patterns),
        needsImmediate: patterns.some(p => p.severity === 'HIGH')
      };
    } catch (error) {
      console.error('Error en analyzePersonalData:', error);
      throw error;
    }
  }

  static async analyzePatterns(moods, gratitudes) {
    const patterns = [];

    // Análisis de estado de ánimo
    if (moods && moods.length > 0) {
      const negativeEmotions = ['Triste', 'Ansioso', 'Enojado'];
      const recentNegative = moods.filter(m => negativeEmotions.includes(m.mood));
      
      if (recentNegative.length >= 2) {
        patterns.push({
          type: 'EMOTIONAL_PATTERN',
          severity: recentNegative.length >= 3 ? 'HIGH' : 'MEDIUM',
          description: 'Has estado experimentando emociones difíciles últimamente',
          detail: `Notamos ${recentNegative.length} momentos de malestar emocional en los últimos días`,
          suggestions: [
            'Considera hablar con alguien de confianza sobre cómo te sientes',
            'Practica ejercicios de respiración o mindfulness',
            'Recuerda que está bien no estar bien y pedir ayuda'
          ]
        });
      }

      // Detectar cambios bruscos de humor
      const moodChanges = moods.slice(0, -1).filter((mood, i) => {
        const nextMood = moods[i + 1];
        return (negativeEmotions.includes(mood.mood) && !negativeEmotions.includes(nextMood.mood)) ||
               (!negativeEmotions.includes(mood.mood) && negativeEmotions.includes(nextMood.mood));
      });

      if (moodChanges.length >= 2) {
        patterns.push({
          type: 'MOOD_SWINGS',
          severity: 'MEDIUM',
          description: 'Tus emociones han estado fluctuando',
          detail: 'Hemos notado algunos cambios significativos en tu estado de ánimo',
          suggestions: [
            'Lleva un diario de tus emociones para identificar desencadenantes',
            'Establece rutinas que te ayuden a mantener estabilidad',
            'Considera técnicas de autorregulación emocional'
          ]
        });
      }
    }

    // Análisis de gratitud
    if (!gratitudes || gratitudes.length === 0) {
      patterns.push({
        type: 'GRATITUDE_OPPORTUNITY',
        severity: 'LOW',
        description: 'Podrías beneficiarte de la práctica de gratitud',
        detail: 'No has registrado momentos de gratitud recientemente',
        suggestions: [
          'Intenta identificar una cosa positiva cada día',
          'Comparte tus momentos de alegría con otros',
          'Reflexiona sobre las pequeñas cosas que te hacen sonreír'
        ]
      });
    }

    return patterns;
  }

  static generateRecommendations(patterns) {
    const recommendations = {
      immediate: [],
      general: [],
      resources: []
    };

    patterns.forEach(pattern => {
      if (pattern.severity === 'HIGH') {
        recommendations.immediate.push({
          title: '¡Nos preocupamos por ti!',
          message: pattern.description,
          actions: [
            'Habla con tu profesor o un adulto de confianza',
            'Considera buscar apoyo profesional',
            'Recuerda que no estás solo/a'
          ]
        });
      }

      recommendations.general.push(...pattern.suggestions);

      // Agregar recursos específicos según el tipo de patrón
      switch (pattern.type) {
        case 'EMOTIONAL_PATTERN':
          recommendations.resources.push({
            type: 'meditation',
            title: 'Meditación Guiada para Calma Emocional',
            url: '/resources/meditation-emotional-balance'
          });
          break;
        case 'MOOD_SWINGS':
          recommendations.resources.push({
            type: 'exercise',
            title: 'Ejercicios de Estabilidad Emocional',
            url: '/resources/emotional-stability'
          });
          break;
        case 'GRATITUDE_OPPORTUNITY':
          recommendations.resources.push({
            type: 'practice',
            title: 'Guía de Práctica de Gratitud',
            url: '/resources/gratitude-guide'
          });
          break;
      }
    });

    return recommendations;
  }
}

module.exports = PersonalAlertService; 