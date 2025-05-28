const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalEntries: {
    type: Number,
    default: 0
  },
  lastEntryDate: {
    type: Date,
    default: null
  },
  categoriesUsed: [{
    category: String,
    count: Number,
    firstUsed: Date
  }],
  streakHistory: [{
    startDate: Date,
    endDate: Date,
    length: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('UserProgress', userProgressSchema); 