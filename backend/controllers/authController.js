const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ── Transporter Email ─────────────────────────────────────────
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

    // Vérification domaine email
    const allowedDomains = ['@draexlmaier.com', '@drax.com', '@gmail.com'];
    if (!allowedDomains.some(d => email.endsWith(d))) {
      return res.status(403).json({ 
        message: 'Accès réservé aux emails @drax.com, @draexlmaier.com et @gmail.com' 
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Générer code MFA
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    const mfaExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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
      mfaExpires,
      verifyToken: null
    });

    // Envoyer le code MFA
    await sendEmail(email, '🔐 Code de vérification - AuditWise', `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg,#0b1f45,#1b6fd8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color:white; margin:0;">🛡️ AuditWise</h1>
        </div>
        <div style="background:white; padding:30px; border:1px solid #e0eaff; border-radius:0 0 12px 12px; text-align:center;">
          <h2 style="color:#0b1f45;">Bonjour ${nom || prenom || email.split('@')[0]},</h2>
          <p style="color:#6b8cba;">Voici votre code pour activer votre compte :</p>
          <div style="background:#f0f6ff; border-radius:14px; padding:24px; margin:25px 0; border:2px solid #1b6fd8;">
            <span style="font-size:42px; font-weight:800; color:#1b6fd8; letter-spacing:12px;">${mfaCode}</span>
          </div>
          <p style="color:#94a3b8; font-size:13px;">Ce code expire dans <strong>10 minutes</strong>.<br>Ne le partagez avec personne.</p>
        </div>
      </div>
    `);

    res.status(201).json({
      message: "Compte créé ! Un code de vérification a été envoyé à votre email.",
      requireMFA: true,
      email
    });

  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({ message: "Erreur serveur lors de la création du compte." });
  }
};

// ── VERIFY MFA (Activation du compte) ─────────────────────────
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

    // Activer le compte
    user.isVerified = true;
    user.mfaCode = null;
    user.mfaExpires = null;
    await user.save();

    res.json({ 
      message: 'Compte activé avec succès ! Vous pouvez maintenant vous connecter.',
      success: true 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
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
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

    if (user.isVerified === false) {
      return res.status(403).json({ 
        message: 'Votre compte n’est pas encore activé. Veuillez vérifier votre email.' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

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
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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