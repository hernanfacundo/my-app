import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from '../config';

class ContextAnalysisService {
  
  /**
   * Obtiene análisis contextual completo para inicializar el chatbot
   */
  static async getContextualAnalysis() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        return this.getFallbackContext();
      }

      // Obtener datos en paralelo
      const [moodAnalysis, gratitudeData, timeContext] = await Promise.all([
        this.getMoodAnalysis(token),
        this.getRecentGratitude(token),
        this.getTimeContext()
      ]);

      // Generar prompt contextual
      return this.generateContextualPrompt({
        moodAnalysis,
        gratitudeData,
        timeContext
      });

    } catch (error) {
      console.error('Error en análisis contextual:', error);
      return this.getFallbackContext();
    }
  }

  /**
   * Obtiene análisis de emociones de los últimos días
   */
  static async getMoodAnalysis(token) {
    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/analyze-emotions`,
        {},
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 
        }
      );
      return {
        hasData: true,
        analysis: response.data.analysis,
        source: 'api'
      };
    } catch (error) {
      console.log('No se pudo obtener análisis de mood:', error.message);
      return { hasData: false, analysis: null };
    }
  }

  /**
   * Obtiene entradas de gratitud recientes
   */
  static async getRecentGratitude(token) {
    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/gratitude/last-seven-days`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 
        }
      );
      
      const gratitudes = response.data.data || [];
      return {
        hasData: gratitudes.length > 0,
        count: gratitudes.length,
        recent: gratitudes.slice(0, 2), // Las 2 más recientes
        lastEntry: gratitudes[0]
      };
    } catch (error) {
      console.log('No se pudo obtener gratitud:', error.message);
      return { hasData: false, count: 0, recent: [] };
    }
  }

  /**
   * Obtiene contexto temporal (hora del día, día de la semana)
   */
  static getTimeContext() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let timeOfDay = 'día';
    let greeting = 'Hola';

    if (hour >= 5 && hour < 12) {
      timeOfDay = 'mañana';
      greeting = 'Buenos días';
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = 'tarde';
      greeting = 'Buenas tardes';
    } else if (hour >= 18 && hour < 22) {
      timeOfDay = 'noche';
      greeting = 'Buenas noches';
    } else {
      timeOfDay = 'madrugada';
      greeting = 'Hola';
    }

    return {
      hour,
      timeOfDay,
      greeting,
      isWeekend,
      dayName: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'][dayOfWeek]
    };
  }

  /**
   * Genera prompt contextual basado en los datos disponibles
   */
  static generateContextualPrompt({ moodAnalysis, gratitudeData, timeContext }) {
    const { greeting, timeOfDay, isWeekend } = timeContext;

    // Caso 1: Hay análisis de mood reciente
    if (moodAnalysis.hasData && moodAnalysis.analysis) {
      return {
        type: 'MOOD_CONTEXT',
        prompt: `${greeting} 😊 ${moodAnalysis.analysis}`,
        hasContext: true
      };
    }

    // Caso 2: Hay gratitud reciente pero no mood
    if (gratitudeData.hasData && gratitudeData.lastEntry) {
      const daysSince = this.getDaysSince(gratitudeData.lastEntry.date);
      let gratitudePrompt = '';

      if (daysSince === 0) {
        gratitudePrompt = `${greeting} ✨ Vi que hoy escribiste sobre "${gratitudeData.lastEntry.text.substring(0, 50)}...". Me encanta que practiques la gratitud. ¿Cómo te sientes al recordar ese momento?`;
      } else if (daysSince === 1) {
        gratitudePrompt = `${greeting} 🌟 Ayer escribiste algo hermoso sobre gratitud. ¿Cómo ha sido tu día hoy? ¿Hay algo nuevo por lo que te sientes agradecido?`;
      } else {
        gratitudePrompt = `${greeting} 💫 He visto que has estado practicando gratitud últimamente. ¿Cómo te ha hecho sentir esa práctica?`;
      }

      return {
        type: 'GRATITUDE_CONTEXT',
        prompt: gratitudePrompt,
        hasContext: true
      };
    }

    // Caso 3: Usuario activo pero sin datos recientes
    if (gratitudeData.count > 0 || moodAnalysis.hasData) {
      return {
        type: 'RETURNING_USER',
        prompt: `${greeting} 🤗 Me alegra verte de nuevo. ¿Cómo ha estado tu ${timeOfDay}? ¿Hay algo en particular que quieras compartir conmigo?`,
        hasContext: true
      };
    }

    // Caso 4: Usuario nuevo o sin historial
    return this.getFallbackContext(timeContext);
  }

  /**
   * Contexto de respaldo para usuarios nuevos o sin datos
   */
  static getFallbackContext(timeContext = null) {
    const { greeting, timeOfDay, isWeekend } = timeContext || this.getTimeContext();
    
    let weekendNote = '';
    if (isWeekend) {
      weekendNote = ' Espero que estés disfrutando tu fin de semana.';
    }

    return {
      type: 'NEW_USER',
      prompt: `${greeting} 🌟 Soy tu acompañante emocional y estoy aquí para escucharte.${weekendNote} ¿Cómo te sientes en esta ${timeOfDay}? ¿Hay algo que te gustaría compartir conmigo?`,
      hasContext: false
    };
  }

  /**
   * Calcula días desde una fecha
   */
  static getDaysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Genera contexto específico para cuando se viene desde mood
   */
  static generateMoodFollowUpContext(moodData, analysis) {
    const { mood, emotion, place } = moodData;
    
    if (analysis) {
      // Si ya hay análisis generado, usarlo
      return {
        type: 'MOOD_FOLLOW_UP',
        prompt: analysis,
        hasContext: true,
        sourceData: moodData
      };
    }

    // Fallback si no hay análisis
    return {
      type: 'MOOD_FOLLOW_UP',
      prompt: `Vi que te sientes ${emotion} y que estás ${mood} en ${place}. ¿Qué más me puedes contar sobre cómo te sientes ahora?`,
      hasContext: true,
      sourceData: moodData
    };
  }

  /**
   * Genera contexto específico para cuando se viene desde gratitud
   */
  static generateGratitudeFollowUpContext(gratitudeText, reflection) {
    if (reflection) {
      // Si ya hay reflexión generada, usarla
      return {
        type: 'GRATITUDE_FOLLOW_UP',
        prompt: reflection,
        hasContext: true,
        sourceData: { gratitudeText }
      };
    }

    // Fallback si no hay reflexión
    return {
      type: 'GRATITUDE_FOLLOW_UP',
      prompt: `Me encanta que hayas encontrado algo por lo que sentirte agradecido: "${gratitudeText.substring(0, 100)}...". ¿Cómo te hace sentir recordar ese momento?`,
      hasContext: true,
      sourceData: { gratitudeText }
    };
  }
}

export default ContextAnalysisService; 