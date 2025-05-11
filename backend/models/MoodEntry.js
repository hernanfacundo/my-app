const mongoose = require('mongoose');

const moodEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mood: { 
    type: String, 
    required: true, 
    enum: ['Excelente', 'Muy bien', 'Bien', 'Más o menos', 'No tan bien'] 
  },
  emotion: { type: String, required: true },
  place: { type: String, required: true },
  comment: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MoodEntry', moodEntrySchema);