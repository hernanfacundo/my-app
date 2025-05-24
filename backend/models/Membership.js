// /models/Membership.js
const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  alumnoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Aseguramos que un alumno no se duplique en la misma clase
MembershipSchema.index({ classId: 1, alumnoId: 1 }, { unique: true });

module.exports = mongoose.model('Membership', MembershipSchema);
