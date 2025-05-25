const PersonalAlertService = require('../../services/personalAlert.service');
const Mood = require('../../models/Mood');
const GratitudeEntry = require('../../models/GratitudeEntry');

// Mock de los modelos de Mongoose
jest.mock('../../models/Mood');
jest.mock('../../models/GratitudeEntry');

describe('PersonalAlertService', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('analyzePersonalData', () => {
    it('debería analizar correctamente datos sin patrones preocupantes', async () => {
      // Configurar mocks
      Mood.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { mood: 'Feliz', createdAt: new Date() },
          { mood: 'Tranquilo', createdAt: new Date() }
        ])
      });
      
      GratitudeEntry.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { content: 'Agradecido por mi familia', date: new Date() }
        ])
      });

      const result = await PersonalAlertService.analyzePersonalData('user123');

      expect(result.patterns).toHaveLength(0);
      expect(result.needsImmediate).toBeFalsy();
    });

    it('debería detectar patrones emocionales negativos', async () => {
      // Configurar mocks para emociones negativas
      Mood.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { mood: 'Triste', createdAt: new Date() },
          { mood: 'Ansioso', createdAt: new Date() },
          { mood: 'Enojado', createdAt: new Date() }
        ])
      });
      
      GratitudeEntry.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const result = await PersonalAlertService.analyzePersonalData('user123');

      expect(result.patterns).toHaveLength(2); // Un patrón emocional y uno de gratitud
      expect(result.patterns[0].type).toBe('EMOTIONAL_PATTERN');
      expect(result.patterns[0].severity).toBe('HIGH');
      expect(result.needsImmediate).toBeTruthy();
    });

    it('debería detectar cambios bruscos de humor', async () => {
      Mood.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          { mood: 'Feliz', createdAt: new Date() },
          { mood: 'Triste', createdAt: new Date() },
          { mood: 'Feliz', createdAt: new Date() },
          { mood: 'Ansioso', createdAt: new Date() }
        ])
      });
      
      GratitudeEntry.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const result = await PersonalAlertService.analyzePersonalData('user123');

      const moodSwingPattern = result.patterns.find(p => p.type === 'MOOD_SWINGS');
      expect(moodSwingPattern).toBeTruthy();
      expect(moodSwingPattern.severity).toBe('MEDIUM');
    });
  });

  describe('analyzePatterns', () => {
    it('debería identificar oportunidades de gratitud', async () => {
      const moods = [{ mood: 'Feliz', createdAt: new Date() }];
      const gratitudes = [];

      const patterns = await PersonalAlertService.analyzePatterns(moods, gratitudes);

      const gratitudePattern = patterns.find(p => p.type === 'GRATITUDE_OPPORTUNITY');
      expect(gratitudePattern).toBeTruthy();
      expect(gratitudePattern.severity).toBe('LOW');
    });

    it('no debería generar patrones con datos normales', async () => {
      const moods = [
        { mood: 'Feliz', createdAt: new Date() },
        { mood: 'Tranquilo', createdAt: new Date() }
      ];
      const gratitudes = [
        { content: 'Agradecido por el día', date: new Date() }
      ];

      const patterns = await PersonalAlertService.analyzePatterns(moods, gratitudes);
      expect(patterns).toHaveLength(0);
    });
  });

  describe('generateRecommendations', () => {
    it('debería generar recomendaciones inmediatas para severidad alta', () => {
      const patterns = [{
        type: 'EMOTIONAL_PATTERN',
        severity: 'HIGH',
        description: 'Patrón emocional preocupante',
        suggestions: [
          'Habla con alguien de confianza',
          'Practica ejercicios de respiración'
        ]
      }];

      const recommendations = PersonalAlertService.generateRecommendations(patterns);

      expect(recommendations.immediate).toHaveLength(1);
      expect(recommendations.resources).toHaveLength(1);
      expect(recommendations.resources[0].type).toBe('meditation');
      expect(recommendations.general).toContain('Habla con alguien de confianza');
    });

    it('debería generar recursos específicos según el tipo de patrón', () => {
      const patterns = [
        { 
          type: 'MOOD_SWINGS', 
          severity: 'MEDIUM',
          suggestions: ['Establece rutinas diarias']
        },
        { 
          type: 'GRATITUDE_OPPORTUNITY', 
          severity: 'LOW',
          suggestions: ['Identifica momentos positivos']
        }
      ];

      const recommendations = PersonalAlertService.generateRecommendations(patterns);

      expect(recommendations.resources).toHaveLength(2);
      expect(recommendations.resources[0].type).toBe('exercise');
      expect(recommendations.resources[1].type).toBe('practice');
      expect(recommendations.general).toContain('Establece rutinas diarias');
      expect(recommendations.general).toContain('Identifica momentos positivos');
    });
  });
}); 