const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moodSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['Feliz', 'Triste', 'Ansioso', 'Relajado', 'Enojado', 'Excelente']
  },
  emotion: {
    type: String,
    required: true,
    enum: [
      'Feliz', 'Entusiasmado', 'Alegre', 'Contento', 'Satisfecho',
      'Optimista', 'Tranquilo', 'Neutral', 'Relajado', 'Confundido',
      'Inseguro', 'Cansado', 'Triste', 'Ansioso', 'Enojado'
    ]
  },
  place: {
    type: String,
    required: true,
    enum: [
      'Casa', 'Trabajo', 'Parque', 'Escuela', 'Gimnasio',
      'Calle', 'Café', 'Biblioteca', 'Tienda', 'Otro'
    ]
  },
  comment: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Mood', moodSchema);