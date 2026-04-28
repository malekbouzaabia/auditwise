const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ── Configuration Email ─────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
  },
  tls: { rejectUnauthorized: false, servername: 'smtp.gmail.com' },
  family: 4,
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"AuditWise" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Erreur envoi email:", err.message);
  }
}

// ── REGISTER ──────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password, entreprise, taille, telephone } = req.body;

    // Validation des domaines email
    const allowedDomains = ['@draexlmaier.com', '@drax.com', '@gmail.com'];
    if (!allowedDomains.some(d => email.endsWith(d))) {
      return res.status(403).json({ 
        message: 'Accès réservé aux emails @drax.com, @draexlmaier.com et @gmail.com' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Création de l'utilisateur (activé directement pour simplifier)
    const user = await User.create({
      nom: nom || '',
      prenom: prenom || '',
      email,
      entreprise: entreprise || '',
      taille: taille || '',
      telephone: telephone || '',
      password: hashedPassword,
      isVerified: true,           // Activé directement
      verifyToken: null,
      mfaCode: null,
      mfaExpires: null
    });

    res.status(201).json({
      message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.',
      user: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        entreprise: user.entreprise
      }
    });

  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du compte.' });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const allowedDomains = ['@draexlmaier.com', '@drax.com', '@gmail.com'];
    if (!allowedDomains.some(d => email.endsWith(d))) {
      return res.status(403).json({ 
        message: 'Accès réservé aux emails autorisés (@drax.com, @draexlmaier.com, @gmail.com)' 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom || '',
        email: user.email,
        entreprise: user.entreprise
      }
    });

  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};

// ── GET USERS (Admin) ─────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'nom prenom email entreprise isVerified createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── DELETE USER (Admin) ───────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE USER (Admin) ───────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { nom, prenom, email, entreprise } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { nom, prenom, email, entreprise },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};