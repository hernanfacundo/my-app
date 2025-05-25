const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['EMOTIONAL_DECLINE', 'SUDDEN_CHANGE', 'PERSISTENT_NEGATIVE', 'ISOLATION_RISK', 'GRATITUDE_DECLINE'],
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  indicators: [{
    metric: String,
    value: mongoose.Schema.Types.Mixed,
    threshold: mongoose.Schema.Types.Mixed
  }],
  status: {
    type: String,
    enum: ['NEW', 'REVIEWED', 'ADDRESSED', 'ARCHIVED'],
    default: 'NEW'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Alert', alertSchema); 