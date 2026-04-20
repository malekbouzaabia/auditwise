const express = require('express')
const router  = express.Router()

const {
  register, verifyEmail, login, verifyMFA,
  getUsers, deleteUser, updateUser
} = require('../controllers/authController')

router.post('/register',    register)
router.get('/verify/:token',verifyEmail)
router.post('/login',       login)
router.post('/verify-mfa',  verifyMFA)
router.get('/users',        getUsers)
router.delete('/users/:id', deleteUser)
router.put('/users/:id',    updateUser)

// ── Route temporaire pour activer un compte manuellement ─────
router.get('/activate/:email', async (req, res) => {
  try {
    const User = require('../models/user')
    const email = decodeURIComponent(req.params.email)
    const user  = await User.findOneAndUpdate(
      { email },
      { isVerified: true, verifyToken: null },
      { returnDocument: 'after' }
    )
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    res.json({ message: '✅ Compte activé : ' + email })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router