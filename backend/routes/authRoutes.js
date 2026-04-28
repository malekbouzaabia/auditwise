const express = require('express');
const router = express.Router();

const {
  register,
  verifyMFA,
  login,
  getUsers,
  deleteUser,
  updateUser
} = require('../controllers/authController');

// ==================== Routes Authentification ====================
router.post('/register', register);           // Inscription + envoi code MFA
router.post('/verify-mfa', verifyMFA);        // Vérification du code MFA
router.post('/login', login);                 // Connexion classique

// ==================== Routes Admin ====================
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', updateUser);

// ==================== Route temporaire (utile en développement) ====================
router.get('/activate/:email', async (req, res) => {
  try {
    const User = require('../models/user');
    const email = decodeURIComponent(req.params.email);

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true, mfaCode: null, mfaExpires: null },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    res.json({ message: `✅ Compte activé avec succès : ${email}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;