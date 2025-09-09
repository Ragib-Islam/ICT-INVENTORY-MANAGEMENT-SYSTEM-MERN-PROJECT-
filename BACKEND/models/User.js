const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'User'], // ✅ Changed to match your auth system
    default: 'User'
  },
  department: {
    type: String,
    default: 'General'
  },
  employeeId: {
    type: String
  }
}, {
  timestamps: true
});

// Normalize role casing before validation to avoid enum errors
userSchema.pre('validate', function(next) {
  if (this.role) {
    const normalized = String(this.role).toLowerCase() === 'admin' ? 'Admin' : 'User';
    this.role = normalized;
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);