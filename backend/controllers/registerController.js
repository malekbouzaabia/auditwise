const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.registerUser = async (req, res) => {
  try {
    const {
      nom,
      prenom,
      email,
      entreprise,
      taille,
      telephone,
      password
    } = req.body

    // Vérifier si email existe
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        message: 'Cet email est déjà utilisé'
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Création utilisateur
    const user = await User.create({
      nom,
      prenom,
      email,
      entreprise,
      taille,
      telephone,
      password: hashedPassword
    })

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email
      }
    })

  } catch (error) {
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message
    })
  }
}