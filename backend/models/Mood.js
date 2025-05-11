const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  mood: { type: String, required: true },
  emotion: { type: String },
  place: { type: String },
  comment: { type: String },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Mood', MoodSchema);