const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ── Configuration Transporter Gmail ─────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test du transporter au démarrage
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erreur configuration SMTP :", error);
  } else {
    console.log("✅ SMTP Gmail configuré avec succès");
  }
});

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `"AuditWise" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email envoyé à ${to} | MessageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error("❌ Erreur envoi email :", err.message);
    throw err;   // Important : on propage l'erreur pour la voir
  }
}

// ── REGISTER avec MFA ─────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password, entreprise, taille, telephone } = req.body;

    const allowedDomains = ['@draexlmaier.com', '@drax.com', '@gmail.com'];
    if (!allowedDomains.some(d => email.endsWith(d))) {
      return res.status(403).json({ 
        message: 'Accès réservé aux emails @drax.com, @draexlmaier.com et @gmail.com' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    const mfaExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      nom: nom || '',
      prenom: prenom || '',
      email,
      entreprise: entreprise || '',
      taille: taille || '',
      telephone: telephone || '',
      password: hashedPassword,
      isVerified: false,
      mfaCode,
      mfaExpires
    });

    // Envoi du code MFA
    await sendEmail(email, '🔐 Code de vérification - AuditWise', `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0b1f45;">Bonjour ${nom || prenom || email.split('@')[0]},</h2>
        <p>Votre code de vérification pour activer votre compte AuditWise est :</p>
        <div style="background:#f0f6ff; padding: 20px; text-align: center; border-radius: 12px; margin: 20px 0; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #1b6fd8;">
          ${mfaCode}
        </div>
        <p style="color: #666; font-size: 14px;">Ce code expire dans 10 minutes.</p>
      </div>
    `);

    console.log(`📧 Code MFA généré et envoyé à ${email}`);

    res.status(201).json({
      message: "Compte créé avec succès. Un code de vérification a été envoyé à votre email.",
      requireMFA: true,
      email: email
    });

  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du compte." });
  }
};

// ── VERIFY MFA ────────────────────────────────────────────────
exports.verifyMFA = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (user.mfaCode !== code) {
      return res.status(401).json({ message: 'Code incorrect' });
    }

    if (new Date() > user.mfaExpires) {
      return res.status(401).json({ message: 'Code expiré. Veuillez vous réinscrire.' });
    }

    user.isVerified = true;
    user.mfaCode = null;
    user.mfaExpires = null;
    await user.save();

    res.json({ 
      message: 'Compte activé avec succès ! Vous pouvez maintenant vous connecter.' 
    });

  } catch (error) {
    console.error("Erreur verifyMFA:", error);
    res.status(500).json({ message: 'Erreur lors de la vérification du code.' });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const allowedDomains = ['@draexlmaier.com', '@drax.com', '@gmail.com'];
    if (!allowedDomains.some(d => email.endsWith(d))) {
      return res.status(403).json({ message: 'Accès réservé aux emails autorisés' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Votre compte n’est pas encore activé. Veuillez vérifier votre email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

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
    res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
};

// Routes Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'nom prenom email entreprise isVerified createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { nom, prenom, email, entreprise } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { nom, prenom, email, entreprise }, { new: true });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};