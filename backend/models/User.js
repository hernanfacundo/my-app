const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  role: { 
    type: String, 
    enum: ['student', 'teacher', 'admin', 'directivo'], 
    default: 'student' 
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: function() {
      return this.role === 'student';
    }
  }
}, { 
  timestamps: true 
});

// Elimina cualquier middleware pre-save que re-hashee la contraseña
userSchema.pre('save', async function(next) {
  // Si la contraseña ya está hasheada, no la vuelvas a hashear
  if (this.password && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);