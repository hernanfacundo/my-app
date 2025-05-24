const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
  comment: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MoodEntry', moodEntrySchema);