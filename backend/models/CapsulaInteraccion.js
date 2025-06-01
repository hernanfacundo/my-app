const mongoose = require('mongoose');

const CapsulaInteraccionSchema = new mongoose.Schema({
  docenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  capsulaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Capsula',
    required: true
  },
  tipoInteraccion: {
    type: String,
    enum: ['vista', 'like', 'dislike', 'guardada', 'completada'],
    required: true
  },
  fechaInteraccion: {
    type: Date,
    default: Date.now
  },
  // Para tracking de progreso
  tiempoVisualizacion: {
    type: Number, // en segundos
    default: 0
  },
  completado: {
    type: Boolean,
    default: false
  },
  // Para recomendaciones futuras
  estadoEmocionalPrevio: {
    type: String,
    enum: [
      'estresado', 'agotado', 'ansioso', 'frustrado',
      'tranquilo', 'motivado', 'optimista', 'equilibrado',
      'triste', 'abrumado', 'confundido', 'enojado',
      'desmotivado', 'inseguro'
    ]
  },
  // Feedback opcional
  comentario: {
    type: String,
    maxlength: 500
  },
  valoracion: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Índices para optimizar consultas
CapsulaInteraccionSchema.index({ docenteId: 1, capsulaId: 1 });
CapsulaInteraccionSchema.index({ docenteId: 1, fechaInteraccion: -1 });
CapsulaInteraccionSchema.index({ capsulaId: 1, tipoInteraccion: 1 });

// Prevenir duplicados para ciertas interacciones
CapsulaInteraccionSchema.index(
  { docenteId: 1, capsulaId: 1, tipoInteraccion: 1 }, 
  { 
    unique: true,
    partialFilterExpression: {
      tipoInteraccion: { $in: ['like', 'dislike', 'guardada'] }
    }
  }
);

module.exports = mongoose.model('CapsulaInteraccion', CapsulaInteraccionSchema); 