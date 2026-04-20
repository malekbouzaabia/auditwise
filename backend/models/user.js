const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  nom:         { type: String, default: '' },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  entreprise:  { type: String, default: '' },
  isVerified:  { type: Boolean, default: true },
  verifyToken: { type: String,  default: null },
  mfaCode:     { type: String,  default: null },
  mfaExpires:  { type: Date,    default: null },
  createdAt:   { type: Date,    default: Date.now },
})

module.exports = mongoose.models.User || mongoose.model('User', userSchema)