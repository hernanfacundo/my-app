// Datos base para el seeding
const PERFILES_ALUMNOS = {
  ESTABLE: 'ESTABLE',
  FLUCTUANTE: 'FLUCTUANTE',
  ATENCION_INMEDIATA: 'ATENCION_INMEDIATA',
  BAJO_ENGAGEMENT: 'BAJO_ENGAGEMENT'
};

const ESTADOS_ANIMO = {
  FELIZ: 'Feliz',
  TRISTE: 'Triste',
  ANSIOSO: 'Ansioso',
  RELAJADO: 'Relajado',
  ENOJADO: 'Enojado',
  EXCELENTE: 'Excelente'
};

const NOMBRES_ALUMNOS = [
  'Ana García', 'Juan Pérez', 'María Rodríguez', 'Carlos López',
  'Laura Martínez', 'Diego Sánchez', 'Sofía Torres', 'Pablo Ruiz',
  'Valentina Díaz', 'Lucas Fernández', 'Isabella Castro', 'Mateo González',
  'Emma Ramírez', 'Santiago Silva', 'Victoria Morales', 'Sebastián Ortiz',
  'Camila Vargas', 'Nicolás Romero', 'Martina Flores', 'Daniel Herrera'
];

const TEMAS_GRATITUD = [
  'familia', 'amigos', 'logros', 'aprendizaje', 'salud',
  'naturaleza', 'mascotas', 'hobbies', 'música', 'deportes'
];

const DISTRIBUCIONES_PERFILES = {
  [PERFILES_ALUMNOS.ESTABLE]: {
    estadosAnimo: {
      [ESTADOS_ANIMO.FELIZ]: 0.4,
      [ESTADOS_ANIMO.RELAJADO]: 0.3,
      [ESTADOS_ANIMO.EXCELENTE]: 0.3
    },
    frecuenciaGratitud: 0.8,
    comentariosBase: [
      'Hoy fue un buen día',
      'Me siento productivo',
      'Disfruté la clase',
      'Aprendí algo nuevo'
    ]
  },
  [PERFILES_ALUMNOS.FLUCTUANTE]: {
    estadosAnimo: {
      [ESTADOS_ANIMO.FELIZ]: 0.3,
      [ESTADOS_ANIMO.ANSIOSO]: 0.2,
      [ESTADOS_ANIMO.RELAJADO]: 0.2,
      [ESTADOS_ANIMO.TRISTE]: 0.2,
      [ESTADOS_ANIMO.ENOJADO]: 0.1
    },
    frecuenciaGratitud: 0.5,
    comentariosBase: [
      'Día con altibajos',
      'Me costó concentrarme',
      'Mejoró mi día después del almuerzo',
      'Necesito organizar mejor mis tiempos'
    ]
  },
  [PERFILES_ALUMNOS.ATENCION_INMEDIATA]: {
    estadosAnimo: {
      [ESTADOS_ANIMO.TRISTE]: 0.4,
      [ESTADOS_ANIMO.ANSIOSO]: 0.3,
      [ESTADOS_ANIMO.ENOJADO]: 0.3
    },
    frecuenciaGratitud: 0.2,
    comentariosBase: [
      'No me siento bien',
      'Todo me cuesta mucho',
      'Preferiría estar en casa',
      'No puedo concentrarme'
    ]
  },
  [PERFILES_ALUMNOS.BAJO_ENGAGEMENT]: {
    estadosAnimo: {
      [ESTADOS_ANIMO.RELAJADO]: 0.5,
      [ESTADOS_ANIMO.TRISTE]: 0.3,
      [ESTADOS_ANIMO.ANSIOSO]: 0.2
    },
    frecuenciaGratitud: 0.1,
    comentariosBase: [
      'Normal',
      'Como siempre',
      'Nada especial',
      'Todo igual'
    ]
  }
};

const PLANTILLAS_GRATITUD = {
  familia: [
    'Agradecido por el apoyo de mi familia en...',
    'Hoy mi familia me ayudó con...',
    'Compartí un momento especial con mi familia cuando...'
  ],
  amigos: [
    'Mis amigos me hicieron reír cuando...',
    'Agradezco la ayuda de mis compañeros en...',
    'Hoy hice una nueva amistad con...'
  ],
  logros: [
    'Logré entender un tema difícil sobre...',
    'Me fue bien en la presentación de...',
    'Superé un desafío cuando...'
  ],
  aprendizaje: [
    'Aprendí algo interesante sobre...',
    'El profesor explicó muy bien...',
    'Descubrí que soy bueno en...'
  ]
};

const LUGARES = [
  'Casa', 'Escuela', 'Biblioteca', 'Parque', 'Gimnasio'
];

const EMOCIONES = {
  [ESTADOS_ANIMO.FELIZ]: ['Feliz', 'Entusiasmado', 'Alegre', 'Contento'],
  [ESTADOS_ANIMO.TRISTE]: ['Triste', 'Inseguro'],
  [ESTADOS_ANIMO.ANSIOSO]: ['Ansioso', 'Confundido'],
  [ESTADOS_ANIMO.ENOJADO]: ['Enojado'],
  [ESTADOS_ANIMO.RELAJADO]: ['Tranquilo', 'Relajado'],
  [ESTADOS_ANIMO.EXCELENTE]: ['Entusiasmado', 'Optimista']
};

module.exports = {
  PERFILES_ALUMNOS,
  ESTADOS_ANIMO,
  NOMBRES_ALUMNOS,
  TEMAS_GRATITUD,
  DISTRIBUCIONES_PERFILES,
  PLANTILLAS_GRATITUD,
  LUGARES,
  EMOCIONES
}; 