// Configuración de insignias del sistema
const BADGES_CONFIG = {
  streak: [
    {
      id: 'streak_3',
      name: '¡Primer Paso!',
      description: '3 días consecutivos escribiendo gratitud. ¡Vas por buen camino! 🌱',
      criteria: 3,
      emoji: '🌱',
      color: 'turquoise'
    },
    {
      id: 'streak_7',
      name: '¡Una Semana Completa!',
      description: '7 días seguidos de gratitud. ¡Eres increíble! ⭐',
      criteria: 7,
      emoji: '⭐',
      color: 'coral'
    },
    {
      id: 'streak_14',
      name: '¡Dos Semanas de Fuego!',
      description: '14 días consecutivos. ¡Estás en llamas! 🔥',
      criteria: 14,
      emoji: '🔥',
      color: 'pastelYellow'
    },
    {
      id: 'streak_30',
      name: '¡Leyenda de la Gratitud!',
      description: '30 días seguidos. ¡Eres oficialmente una leyenda! 👑',
      criteria: 30,
      emoji: '👑',
      color: 'lavender'
    }
  ],
  total: [
    {
      id: 'total_5',
      name: 'Explorador de Gratitud',
      description: '5 entradas totales. ¡Comenzaste tu aventura! 🗺️',
      criteria: 5,
      emoji: '🗺️',
      color: 'turquoise'
    },
    {
      id: 'total_15',
      name: 'Coleccionista de Momentos',
      description: '15 entradas totales. ¡Coleccionas momentos hermosos! 💎',
      criteria: 15,
      emoji: '💎',
      color: 'coral'
    },
    {
      id: 'total_30',
      name: 'Maestro del Agradecimiento',
      description: '30 entradas totales. ¡Eres un maestro! 🎓',
      criteria: 30,
      emoji: '🎓',
      color: 'pastelYellow'
    },
    {
      id: 'total_50',
      name: 'Leyenda Eterna',
      description: '50 entradas totales. ¡Tu gratitud no tiene límites! 🏆',
      criteria: 50,
      emoji: '🏆',
      color: 'lavender'
    }
  ],
  variety: [
    {
      id: 'variety_4',
      name: 'Corazón Diverso',
      description: 'Agradeciste en 4 categorías diferentes. ¡Tu corazón es diverso! 🌈',
      criteria: 4,
      emoji: '🌈',
      color: 'coral'
    }
  ]
};

// Categorías de gratitud para clasificación automática
const GRATITUDE_CATEGORIES = {
  familia: {
    keywords: ['familia', 'mamá', 'papá', 'hermano', 'hermana', 'abuelo', 'abuela', 'primo', 'tío', 'tía', 'padres', 'hijos'],
    name: 'Familia',
    emoji: '👨‍👩‍👧‍👦'
  },
  amigos: {
    keywords: ['amigo', 'amiga', 'amigos', 'amigas', 'compañero', 'compañera', 'mejor amigo', 'mejor amiga'],
    name: 'Amigos',
    emoji: '👫'
  },
  escuela: {
    keywords: ['escuela', 'colegio', 'universidad', 'maestro', 'maestra', 'profesor', 'profesora', 'clase', 'examen', 'calificación', 'estudio'],
    name: 'Escuela',
    emoji: '🎓'
  },
  salud: {
    keywords: ['salud', 'sano', 'sana', 'ejercicio', 'deporte', 'médico', 'doctor', 'medicina', 'bienestar', 'energía'],
    name: 'Salud',
    emoji: '💪'
  },
  logros: {
    keywords: ['logro', 'éxito', 'ganar', 'premio', 'reconocimiento', 'meta', 'objetivo', 'triunfo', 'victoria'],
    name: 'Logros',
    emoji: '🏆'
  },
  naturaleza: {
    keywords: ['naturaleza', 'árbol', 'flores', 'mar', 'playa', 'montaña', 'cielo', 'sol', 'luna', 'lluvia', 'aire'],
    name: 'Naturaleza',
    emoji: '🌿'
  },
  comida: {
    keywords: ['comida', 'comer', 'desayuno', 'almuerzo', 'cena', 'cocinar', 'delicioso', 'rico', 'sabroso', 'restaurante'],
    name: 'Comida',
    emoji: '🍽️'
  },
  hobbies: {
    keywords: ['música', 'cantar', 'bailar', 'leer', 'libro', 'película', 'juego', 'videojuego', 'arte', 'dibujar', 'pintar'],
    name: 'Hobbies',
    emoji: '🎨'
  },
  momentos: {
    keywords: ['momento', 'día', 'tarde', 'noche', 'tiempo', 'experiencia', 'recuerdo', 'memoria', 'vivencia'],
    name: 'Momentos',
    emoji: '✨'
  },
  oportunidades: {
    keywords: ['oportunidad', 'chance', 'posibilidad', 'futuro', 'sueño', 'esperanza', 'plan', 'proyecto'],
    name: 'Oportunidades',
    emoji: '🚀'
  }
};

// Mensajes motivadores para cada tipo de insignia
const BADGE_MESSAGES = {
  streak: {
    3: "¡Increíble! 🌱 Llevas 3 días seguidos escribiendo gratitud. ¿Cómo te sientes con este nuevo hábito?",
    7: "¡WOW! ⭐ Una semana completa de gratitud. ¡Eres imparable! ¿Qué ha cambiado en ti?",
    14: "¡ÉPICO! 🔥 Dos semanas seguidas. Tu constancia es inspiradora. ¿Cómo ves la vida ahora?",
    30: "¡LEYENDA! 👑 Un mes entero de gratitud. Eres oficialmente una leyenda. ¿Qué consejo darías a otros?"
  },
  total: {
    5: "¡Genial! 🗺️ Ya tienes 5 momentos de gratitud guardados. ¿Cuál ha sido tu favorito?",
    15: "¡Asombroso! 💎 15 momentos hermosos coleccionados. ¿Notas algún patrón en lo que agradeces?",
    30: "¡Maestro! 🎓 30 entradas de gratitud. Tu corazón está lleno de agradecimiento. ¿Cómo te sientes?",
    50: "¡LEYENDA! 🏆 50 momentos de gratitud. Tu ejemplo inspira a otros. ¿Qué significa la gratitud para ti?"
  },
  variety: {
    4: "¡Corazón Diverso! 🌈 Agradeces muchas cosas diferentes. ¿Qué categoría te sorprende más?"
  }
};

module.exports = {
  BADGES_CONFIG,
  GRATITUDE_CATEGORIES,
  BADGE_MESSAGES
}; 