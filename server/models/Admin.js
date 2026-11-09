const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: [true, 'Admin email is required'], unique: true, trim: true, lowercase: true },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // never returned unless explicitly requested
    },
    name: { type: String, default: 'Admin', trim: true },
    role: { type: String, default: 'admin' },
    // Tokens issued before this moment are rejected (set on password change)
    passwordChangedAt: { type: Date },
  },
  { timestamps: true }
);

// Hash the password with bcrypt whenever it changes
AdminSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) {
    // Back-date 1s so the token issued right after the change is still valid
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
  next();
});

AdminSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/** True if a token issued at `iatSeconds` predates the last password change. */
AdminSchema.methods.changedPasswordAfter = function changedPasswordAfter(iatSeconds) {
  if (!this.passwordChangedAt) return false;
  return iatSeconds * 1000 < this.passwordChangedAt.getTime();
};

AdminSchema.methods.toPublicJSON = function toPublicJSON() {
  return { id: this._id, email: this.email, name: this.name, role: this.role };
};

module.exports = mongoose.model('Admin', AdminSchema);
