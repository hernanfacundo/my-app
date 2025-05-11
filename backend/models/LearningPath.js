const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  type: { type: String, enum: ['video', 'pdf', 'audio'], required: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
});

const learningPathSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  resources: [resourceSchema],
});

module.exports = mongoose.model('LearningPath', learningPathSchema);