const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

// SIGN UP
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await User.create({
      email,
      password: hashedPassword
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    res.status(201).json({
      message: 'Utilisateur créé',
      token
    })

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// SIGN IN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    })

    res.json({
      message: 'Connexion réussie',
      token
    })

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

// GET USERS
exports.getUsers = async (req, res) => {
  try {
    // ne récupérer que nom, email et entreprise
    const users = await User.find({}, 'nom email entreprise')

    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}