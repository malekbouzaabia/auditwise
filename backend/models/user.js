const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  entreprise: {
    type: String,
    required: true,
    trim: true
  },
  taille: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)