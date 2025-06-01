const mongoose = require('mongoose');

const CapsulaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  tipo: {
    type: String,
    enum: ['audio', 'texto', 'imagen'],
    required: true
  },
  contenido: {
    type: String,
    required: true
    // Para audio/imagen: URL del archivo
    // Para texto: contenido completo
  },
  duracion: {
    type: Number,
    required: true
    // En minutos (ej: 3, 5, 10)
  },
  emocionesRelacionadas: [{
    type: String,
    enum: [
      'estresado', 'agotado', 'ansioso', 'frustrado',
      'tranquilo', 'motivado', 'optimista', 'equilibrado',
      'triste', 'abrumado', 'confundido', 'enojado',
      'desmotivado', 'inseguro'
    ]
  }],
  fechaPublicacion: {
    type: Date,
    default: Date.now
  },
  visibilidad: {
    type: Boolean,
    default: true
  },
  categoria: {
    type: String,
    enum: [
      'mindfulness', 'respiracion', 'reflexion', 
      'motivacion', 'autocuidado', 'gestion_estres',
      'equilibrio_vida', 'comunicacion', 'resiliencia'
    ],
    required: true
  },
  autor: {
    type: String,
    default: 'Equipo de Bienestar'
  },
  nivelDificultad: {
    type: String,
    enum: ['principiante', 'intermedio', 'avanzado'],
    default: 'principiante'
  },
  palabrasClave: [String],
  // Métricas de uso
  totalVisualizaciones: {
    type: Number,
    default: 0
  },
  totalLikes: {
    type: Number,
    default: 0
  },
  totalDislikes: {
    type: Number,
    default: 0
  },
  totalGuardadas: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Índices para optimizar búsquedas
CapsulaSchema.index({ categoria: 1 });
CapsulaSchema.index({ emocionesRelacionadas: 1 });
CapsulaSchema.index({ fechaPublicacion: -1 });
CapsulaSchema.index({ visibilidad: 1 });

module.exports = mongoose.model('Capsula', CapsulaSchema); 