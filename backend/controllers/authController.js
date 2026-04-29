const User       = require('../models/user')
const bcrypt     = require('bcryptjs')
const jwt        = require('jsonwebtoken')
const nodemailer = require('nodemailer')

// ── Transporter Email ─────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   'smtp.gmail.com',
  port:    587,
  secure:  false,
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
  },
  tls: { rejectUnauthorized: false, servername: 'smtp.gmail.com' },
  family: 4,
})

async function sendEmail(to, subject, html) {
  try {
    console.log('📧 Envoi email a:', to)
    await transporter.sendMail({
      from: `"AuditWise" <${process.env.MAIL_USER}>`,
      to, subject, html,
    })
    console.log('✅ Email envoye avec succes a:', to)
  } catch (err) {
    console.error('❌ Erreur envoi email:', err.message)
    throw err
  }
}

// ── REGISTER ──────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { nom, email, password, entreprise } = req.body

    // Vérifier domaine
    const allowedDomains = ['@draexlmaier.com', '@drax.com', '@gmail.com']
    if (!allowedDomains.some(d => email.endsWith(d))) {
      return res.status(403).json({ message: 'Accès réservé aux employés Draexlmaier' })
    }

    const userExists = await User.findOne({ email })
    if (userExists) return res.status(400).json({ message: 'Utilisateur déjà existant' })

    const salt           = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const verifyToken    = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' })

    // Générer code MFA pour activation
    const mfaCode    = Math.floor(100000 + Math.random() * 900000).toString()
    const mfaExpires = new Date(Date.now() + 10 * 60 * 1000)

    await User.create({ nom, email, entreprise, password: hashedPassword, isVerified: false, verifyToken, mfaCode, mfaExpires })

    // Envoyer code MFA par email
    await sendEmail(email, '🔐 Code de vérification AuditWise', `
      <div style="font-family:Arial; max-width:500px; margin:0 auto;">
        <div style="background:linear-gradient(135deg,#0b1f45,#1b6fd8); padding:30px; border-radius:12px 12px 0 0; text-align:center;">
          <h1 style="color:white; margin:0;">🛡️ AuditWise</h1>
        </div>
        <div style="background:white; padding:30px; border:1px solid #e0eaff; border-radius:0 0 12px 12px; text-align:center;">
          <h2 style="color:#0b1f45;">Bonjour ${nom || email.split('@')[0]},</h2>
          <p style="color:#6b8cba;">Votre code de vérification pour activer votre compte :</p>
          <div style="background:#f0f6ff; border-radius:14px; padding:24px; margin:20px 0; border:2px solid #1b6fd8;">
            <span style="font-size:44px; font-weight:800; color:#1b6fd8; letter-spacing:10px;">${mfaCode}</span>
          </div>
          <p style="color:#94a3b8; font-size:12px;">⏱️ Expire dans 10 minutes. Ne le partagez pas.</p>
        </div>
      </div>
    `)

    console.log('✅ Compte cree pour:', email)
    res.status(201).json({ message: 'Compte créé ! Entrez le code envoyé par email pour activer votre compte.', requireCode: true, email })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ── VERIFY EMAIL ──────────────────────────────────────────────
exports.verifyEmail = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET)
    const user    = await User.findOne({ email: decoded.email })
    if (!user) return res.status(404).send('Compte introuvable')
    user.isVerified  = true
    user.verifyToken = null
    await user.save()
    res.send(`
      <html><body style="font-family:Arial; text-align:center; padding:60px; background:#f0f6ff;">
        <div style="background:white; padding:40px; border-radius:20px; max-width:420px; margin:0 auto; box-shadow:0 10px 40px rgba(11,31,69,0.1);">
          <div style="font-size:60px;">✅</div>
          <h2 style="color:#0b1f45;">Compte activé !</h2>
          <p style="color:#6b8cba;">Votre compte AuditWise est actif.</p>
          <a href="http://localhost:5173" style="display:inline-block; margin-top:20px; padding:12px 28px; background:#1b6fd8; color:white; text-decoration:none; border-radius:10px; font-weight:700;">
            Se connecter →
          </a>
        </div>
      </body></html>
    `)
  } catch (err) {
    res.status(400).send('Lien invalide ou expiré')
  }
}

// ── LOGIN ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Vérifier domaine
    const allowedDomains = ['@draexlmaier.com', '@drax.com', '@gmail.com']
    if (!allowedDomains.some(d => email.endsWith(d))) {
      return res.status(403).json({ message: 'Accès réservé aux employés Draexlmaier' })
    }

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect' })

    // Vérifier activation
    if (user.isVerified === false) {
      return res.status(403).json({ message: 'Compte non activé. Vérifiez votre email @drax.com' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Email ou mot de passe incorrect' })

    // Connexion directe - générer JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({
      message: 'Connexion réussie',
      token,
      user: { _id: user._id, nom: user.nom, email: user.email, entreprise: user.entreprise }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ── VERIFY MFA ────────────────────────────────────────────────
exports.verifyMFA = async (req, res) => {
  try {
    const { email, code } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' })
    if (user.mfaCode !== code) return res.status(401).json({ message: 'Code incorrect' })
    if (new Date() > user.mfaExpires) return res.status(401).json({ message: 'Code expiré — réinscrivez-vous' })

    // Activer le compte
    user.isVerified = true
    user.mfaCode    = null
    user.mfaExpires = null
    user.verifyToken = null
    await user.save()

    res.json({ message: 'Compte activé avec succès ! Vous pouvez maintenant vous connecter.' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ── GET USERS ─────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'nom email entreprise isVerified createdAt')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ── DELETE USER ───────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    res.json({ message: 'Utilisateur supprimé' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// ── UPDATE USER ───────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { nom, email, entreprise } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id, { nom, email, entreprise },
      { returnDocument: 'after' }
    )
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}