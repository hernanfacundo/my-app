// Configuración de insignias para testing y desarrollo
export const SAMPLE_BADGES = [
  {
    id: '1',
    name: 'Primer Paso',
    description: 'Escribiste tu primera entrada de gratitud',
    emoji: '🌱',
    category: 'total',
    color: 'turquoise',
    isUnlocked: true,
    unlockedAt: new Date().toISOString(),
    progress: { current: 1, required: 1, percentage: 100 }
  },
  {
    id: '2',
    name: 'Constante',
    description: 'Escribiste gratitud por 3 días consecutivos',
    emoji: '🔥',
    category: 'streak',
    color: 'coral',
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000).toISOString(), // Ayer
    progress: { current: 3, required: 3, percentage: 100 }
  },
  {
    id: '3',
    name: 'Explorador',
    description: 'Escribiste sobre 5 categorías diferentes',
    emoji: '🌈',
    category: 'variety',
    color: 'lavender',
    isUnlocked: false,
    progress: { current: 3, required: 5, percentage: 60 }
  },
  {
    id: '4',
    name: 'Dedicado',
    description: 'Escribiste 10 entradas de gratitud',
    emoji: '⭐',
    category: 'total',
    color: 'pastelYellow',
    isUnlocked: false,
    progress: { current: 7, required: 10, percentage: 70 }
  },
  {
    id: '5',
    name: 'Maestro de la Gratitud',
    description: 'Mantuviste una racha de 30 días',
    emoji: '🏆',
    category: 'streak',
    color: 'turquoise',
    isUnlocked: false,
    progress: { current: 3, required: 30, percentage: 10 }
  }
];

export const SAMPLE_STATS = {
  totalBadges: 2,
  currentStreak: 3,
  totalEntries: 7,
  categoriesExplored: 3
};

// Configuración de categorías de insignias
export const BADGE_CATEGORIES = {
  streak: {
    name: 'Constancia',
    emoji: '🔥',
    color: '#FF6B6B',
    description: 'Insignias por mantener rachas de gratitud'
  },
  total: {
    name: 'Cantidad',
    emoji: '📊',
    color: '#4ECDC4',
    description: 'Insignias por número total de entradas'
  },
  variety: {
    name: 'Variedad',
    emoji: '🌈',
    color: '#45B7D1',
    description: 'Insignias por explorar diferentes categorías'
  }
};

// Colores disponibles para insignias
export const BADGE_COLORS = {
  turquoise: '#5CD6C2',
  coral: '#FF7F7F',
  pastelYellow: '#FFD966',
  lavender: '#B39DDB'
}; 