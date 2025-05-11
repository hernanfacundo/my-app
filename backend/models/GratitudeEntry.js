const mongoose = require('mongoose');

const gratitudeEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
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