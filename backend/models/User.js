const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
}, { timestamps: true });

// Elimina cualquier middleware pre-save que re-hashee la contraseña
userSchema.pre('save', async function(next) {
  // Si la contraseña ya está hasheada, no la vuelvas a hashear
  if (this.password && !this.password.startsWith('$2b$')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);