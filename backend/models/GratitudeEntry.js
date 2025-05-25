const mongoose = require('mongoose');

const gratitudeEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true, // Esto genera createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model('GratitudeEntry', gratitudeEntrySchema);