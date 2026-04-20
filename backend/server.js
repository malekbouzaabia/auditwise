require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')
const XLSX    = require('xlsx')

const connectDB       = require('./config/db')
const registerRoutes  = require('./routes/registerRoutes')
const authRoutes      = require('./routes/authRoutes')
const { documents }   = require('./document')

const app = express()
connectDB()
app.use(cors())
app.use(express.json())
app.use('/api/auth',     registerRoutes)
app.use('/api/auth',     authRoutes)
app.use('/api/sessions', require('./routes/Chatroutes'))
app.use('/api/pdf',      require('./routes/pdfroutes'))

// ── Lecture Excel au démarrage ───────────────────────────────
// Place ton fichier Excel dans backend/ avec ce nom exact
const EXCEL_PATH = path.join(__dirname, 'ISO27001_Questionnaire_Complet.xlsx')
let DOMAINS_FROM_EXCEL = []

function loadExcel() {
  try {
    const workbook = XLSX.readFile(EXCEL_PATH)
    const sheet    = workbook.Sheets['Questionnaire']

    // Lire avec header:1 pour accéder aux colonnes par index
    // Colonnes : 0=Domaine, 1=Question, 2=Score, 3=Réponse, 4=Commentaire, 5=Clause
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

    const map = {}
    let headerRow = true

    for (const row of rows) {
      // Ignorer la première ligne (entêtes)
      if (headerRow) { headerRow = false; continue }

      const domain   = (row[0] || '').toString().trim()
      const question = (row[1] || '').toString().trim()
      // Colonne 5 = Clause (6ème colonne dans l'Excel)
      const clause   = (row[5] || '').toString().trim()

      if (!domain || !question) continue

      if (!map[domain]) {
        map[domain] = {
          label:     domain,
          questions: [],
          clause:    clause || null
        }
      }

      map[domain].questions.push(question)

      // Prendre la clause si pas encore définie
      if (!map[domain].clause && clause) {
        map[domain].clause = clause
      }
    }

    DOMAINS_FROM_EXCEL = Object.values(map)
    console.log('✅ Excel chargé :', DOMAINS_FROM_EXCEL.length, 'domaines,',
      DOMAINS_FROM_EXCEL.reduce((a, d) => a + d.questions.length, 0), 'questions')
    console.log('📄 Clauses depuis Excel :')
    DOMAINS_FROM_EXCEL.forEach(d => console.log('  ', d.label, '→ Clause', d.clause || '❌ manquante'))
  } catch (err) {
    console.warn('⚠️ Erreur Excel :', err.message)
    DOMAINS_FROM_EXCEL = []
  }
}

loadExcel() // Charger au démarrage

// ── Schéma MongoDB pour les domaines/questions ──────────────
const mongoose = require('mongoose')
const domainSchema = new mongoose.Schema({
  label:     { type: String, required: true },
  clause:    { type: String, default: null },
  icon:      { type: String, default: '📋' },
  order:     { type: Number, default: 0 },
  questions: [{ type: String }],
  source:    { type: String, default: 'excel' }, // 'excel' ou 'admin'
  updatedAt: { type: Date, default: Date.now },
})
const Domain = mongoose.models.Domain || mongoose.model('Domain', domainSchema)

// ── Sync Excel → MongoDB au démarrage ────────────────────────
async function syncExcelToMongo() {
  try {
    const count = await Domain.countDocuments()
    if (count === 0 && DOMAINS_FROM_EXCEL.length > 0) {
      // Premier démarrage : importer Excel dans MongoDB
      await Domain.insertMany(DOMAINS_FROM_EXCEL.map((d, i) => ({
        label: d.label, clause: d.clause, icon: d.icon || '📋',
        order: i, questions: d.questions, source: 'excel'
      })))
      console.log('✅ Excel importé dans MongoDB :', DOMAINS_FROM_EXCEL.length, 'domaines')
    } else {
      console.log('✅ MongoDB contient déjà', count, 'domaines')
    }
  } catch (e) {
    console.error('❌ Erreur sync MongoDB:', e.message)
  }
}
setTimeout(syncExcelToMongo, 2000) // Attendre la connexion MongoDB

// ── GET domaines depuis MongoDB (priorité) ou Excel (fallback) ─
app.get('/api/domains', async (req, res) => {
  try {
    const domains = await Domain.find().sort({ order: 1 }).lean()
    if (domains.length > 0) return res.json(domains)
    // Fallback Excel
    if (DOMAINS_FROM_EXCEL.length > 0) return res.json(DOMAINS_FROM_EXCEL)
    res.status(404).json({ error: 'Aucun domaine trouvé' })
  } catch (e) {
    if (DOMAINS_FROM_EXCEL.length > 0) return res.json(DOMAINS_FROM_EXCEL)
    res.status(500).json({ error: e.message })
  }
})

// ── POST ajouter une question à un domaine ────────────────────
app.post('/api/domains/:id/questions', async (req, res) => {
  try {
    const { question } = req.body
    if (!question?.trim()) return res.status(400).json({ error: 'Question vide' })
    const domain = await Domain.findByIdAndUpdate(
      req.params.id,
      { $push: { questions: question.trim() }, updatedAt: new Date() },
      { returnDocument: 'after' }
    )
    if (!domain) return res.status(404).json({ error: 'Domaine introuvable' })
    console.log('✅ Question ajoutée:', domain.label, '→', question.trim())
    res.json(domain)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── DELETE supprimer une question ─────────────────────────────
app.delete('/api/domains/:id/questions/:index', async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id)
    if (!domain) return res.status(404).json({ error: 'Domaine introuvable' })
    domain.questions.splice(parseInt(req.params.index), 1)
    domain.updatedAt = new Date()
    await domain.save()
    res.json(domain)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── PUT modifier une question ─────────────────────────────────
app.put('/api/domains/:id/questions/:index', async (req, res) => {
  try {
    const { question } = req.body
    const domain = await Domain.findById(req.params.id)
    if (!domain) return res.status(404).json({ error: 'Domaine introuvable' })
    domain.questions[parseInt(req.params.index)] = question.trim()
    domain.updatedAt = new Date()
    await domain.save()
    res.json(domain)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Route : recharger l'Excel sans redémarrer le serveur ─────
app.post('/api/domains/reload', (req, res) => {
  loadExcel()
  res.json({
    message: 'Excel rechargé',
    domains: DOMAINS_FROM_EXCEL.length,
    questions: DOMAINS_FROM_EXCEL.reduce((a, d) => a + d.questions.length, 0)
  })
})

// ── Route : importer un nouvel Excel (upload) ─────────────────
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs     = require('fs')

app.post('/api/domains/import-excel', upload.single('excel'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' })

    // Lire le fichier uploadé
    const workbook = XLSX.readFile(req.file.path)
    const sheet    = workbook.Sheets[workbook.SheetNames[0]]
    const rows     = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })

    const map = {}
    let headerRow = true
    for (const row of rows) {
      if (headerRow) { headerRow = false; continue }
      const domain   = (row[0] || '').toString().trim()
      const question = (row[1] || '').toString().trim()
      const clause   = (row[5] || row[2] || '').toString().trim()
      if (!domain || !question) continue
      if (!map[domain]) map[domain] = { label: domain, questions: [], clause: clause || null }
      map[domain].questions.push(question)
      if (!map[domain].clause && clause) map[domain].clause = clause
    }

    const newDomains = Object.values(map)
    if (newDomains.length === 0) return res.status(400).json({ error: 'Aucun domaine trouvé dans le fichier' })

    // Remplacer dans MongoDB
    await Domain.deleteMany({})
    await Domain.insertMany(newDomains.map((d, i) => ({
      label: d.label, clause: d.clause, icon: '📋',
      order: i, questions: d.questions, source: 'import'
    })))

    // Supprimer le fichier temporaire
    fs.unlinkSync(req.file.path)

    const totalQ = newDomains.reduce((a, d) => a + d.questions.length, 0)
    console.log('✅ Nouvel Excel importé:', newDomains.length, 'domaines,', totalQ, 'questions')

    res.json({
      message: 'Import réussi',
      domains: newDomains.length,
      questions: totalQ
    })
  } catch (err) {
    if (req.file?.path) try { fs.unlinkSync(req.file.path) } catch {}
    res.status(500).json({ error: err.message })
  }
})

// ── Mapping clauses ──────────────────────────────────────────
const CLAUSE_MAPPING = {
  '5.2':   '5.2 Policy',
  '5.15':  '5.15 Access control',
  '6.3':   '6.3 Information security awareness, education and training',
  '5.9':   '5.9 Inventory of information and other associated assets',
  '8.24':  '8.24 Use of cryptography',
  '7.1':   '7.1 Physical security perimeters',
  '5.24':  '5.24 Information security incident management planning and preparation',
  '8.20':  '8.20 Networks security',
  '5.30':  '5.30 ICT readiness for business continuity',
  '9.2.1': '9.2.1 General',
}

// ── RAG ──────────────────────────────────────────────────────
function getClauseFromDocument(clauseId) {
  const cleanId = clauseId?.toString().trim()
  if (!cleanId) return null
  const exactTitle = CLAUSE_MAPPING[cleanId]
  if (exactTitle) {
    const clause = documents.find(doc => doc.title === exactTitle)
    if (clause) return clause
  }
  let clause = documents.find(doc => doc.title.startsWith(cleanId + ' '))
  if (clause) return clause
  clause = documents.find(doc => doc.title.startsWith(cleanId))
  if (clause) return clause
  return documents.find(doc => doc.title.includes(cleanId)) || null
}

function buildRAGContext(currentClause) {
  const clause = getClauseFromDocument(currentClause)
  if (!clause) return ''
  return '=== ISO 27001:2022 — ' + clause.title + ' ===\n' + clause.snippet + '\n=== FIN DOCUMENT ==='
}

// ── Route chat avec Groq + RAG ───────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { system, history, currentClause } = req.body
    const apiKey = process.env.GROQ_API_KEY
    console.log('🔑 Groq:', apiKey ? '✅' : '❌ Manquante')
    if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY manquante' })

    const ragContext    = currentClause ? buildRAGContext(currentClause) : ''
    const systemWithRAG = ragContext
      ? system + '\n\n' + ragContext + '\nBase tes réponses uniquement sur ce texte ISO 27001:2022.'
      : system

    const messages = [
      { role: 'system', content: systemWithRAG },
      ...history.map(h => ({
        role: h.role === 'model' ? 'assistant' : 'user',
        content: h.parts,
      }))
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 512,
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    if (data.error) return res.status(400).json({ error: data.error })
    const text = data.choices?.[0]?.message?.content
    if (!text) return res.status(500).json({ error: 'Réponse vide' })
    res.json({ text })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Route Admin : groupé par utilisateur ────────────────────
app.get('/api/admin/sessions', async (req, res) => {
  try {
    const mongoose = require('mongoose')
    const Session  = mongoose.models.Session
    if (!Session) return res.json([])

    const sessions = await Session.find()
      .sort({ updatedAt: -1 })
      .select('sessionId userId title score messages updatedAt createdAt')
      .lean()

    const User = mongoose.models.User
    const sessionsWithEmail = await Promise.all(sessions.map(async (s) => {
      let userEmail = s.userId || 'Anonyme'
      if (s.userId && User) {
        try {
          const user = await User.findById(s.userId).select('email nom name').lean()
          if (user) userEmail = user.email || user.nom || user.name || s.userId
        } catch (e) {}
      }
      return { ...s, userEmail }
    }))

    const grouped = {}
    for (const s of sessionsWithEmail) {
      const key = s.userEmail
      if (!grouped[key]) {
        grouped[key] = { userEmail: key, totalSessions: 0, totalMessages: 0, lastScore: null, lastDate: null }
      }
      grouped[key].totalSessions += 1
      grouped[key].totalMessages += (s.messages?.length || 0)
      if (s.score != null) grouped[key].lastScore = s.score
      if (!grouped[key].lastDate || new Date(s.updatedAt) > new Date(grouped[key].lastDate)) {
        grouped[key].lastDate = s.updatedAt
      }
    }

    res.json(Object.values(grouped).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate)))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Schéma MongoDB pour les campagnes ────────────────────────
const campagneSchema = new mongoose.Schema({
  nom:        { type: String, required: true },
  statut:     { type: String, default: 'planifiee' }, // 'planifiee' | 'ouverte' | 'fermee'
  dateDebut:  { type: Date,   required: true },
  dateFin:    { type: Date,   required: true },
  createdAt:  { type: Date,   default: Date.now },
  closedAt:   { type: Date,   default: null },
})
const Campagne = mongoose.models.Campagne || mongoose.model('Campagne', campagneSchema)

// ── GET campagne active ───────────────────────────────────────
app.get('/api/campagnes/active', async (req, res) => {
  try {
    const now = new Date()
    // Auto-ouvrir les campagnes dont la date début est passée
    await Campagne.updateMany(
      { statut: 'planifiee', dateDebut: { $lte: now } },
      { statut: 'ouverte' }
    )
    // Auto-fermer les campagnes dont la date fin est passée
    await Campagne.updateMany(
      { statut: 'ouverte', dateFin: { $lt: now } },
      { statut: 'fermee', closedAt: now }
    )
    const campagne = await Campagne.findOne({ statut: 'ouverte' }).sort({ dateDebut: -1 })
    res.json(campagne || null)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── GET toutes les campagnes ──────────────────────────────────
app.get('/api/campagnes', async (req, res) => {
  try {
    const now = new Date()
    await Campagne.updateMany({ statut: 'planifiee', dateDebut: { $lte: now } }, { statut: 'ouverte' })
    await Campagne.updateMany({ statut: 'ouverte', dateFin: { $lt: now } }, { statut: 'fermee', closedAt: now })
    const campagnes = await Campagne.find().sort({ createdAt: -1 }).lean()
    // Ajouter stats pour chaque campagne
    const result = await Promise.all(campagnes.map(async c => {
      const rapports = await Rapport.find({ campagneId: c._id }).lean()
      return {
        ...c,
        totalAudits:   rapports.length,
        scoreMoyen:    rapports.length > 0
          ? Math.round(rapports.reduce((a, r) => a + (r.globalScore || 0), 0) / rapports.length)
          : 0,
      }
    }))
    res.json(result)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── POST créer une campagne ───────────────────────────────────
app.post('/api/campagnes', async (req, res) => {
  try {
    const { nom, dateDebut, dateFin } = req.body
    if (!nom?.trim())   return res.status(400).json({ error: 'Nom requis' })
    if (!dateDebut)     return res.status(400).json({ error: 'Date début requise' })
    if (!dateFin)       return res.status(400).json({ error: 'Date fin requise' })

    // Parser les dates comme heure locale (pas UTC)
    const [dy, dm, dd] = dateDebut.split('-').map(Number)
    const [fy, fm, fd] = dateFin.split('-').map(Number)
    const debut  = new Date(dy, dm - 1, dd, 0,  0,  0)   // minuit local
    const fin    = new Date(fy, fm - 1, fd, 23, 59, 59)  // fin de journée local
    const now    = new Date()

    // Vérifier que la date fin est >= date début (même jour autorisé)
    const debutDay = new Date(dy, dm - 1, dd)
    const finDay   = new Date(fy, fm - 1, fd)
    if (finDay < debutDay) return res.status(400).json({ error: 'Date fin doit être après ou égale à la date début' })

    // Statut automatique selon dates locales
    const statut = debut <= now ? 'ouverte' : 'planifiee'

    // Fermer les campagnes ouvertes si la nouvelle commence maintenant
    if (statut === 'ouverte') {
      await Campagne.updateMany({ statut: 'ouverte' }, { statut: 'fermee', closedAt: now })
    }

    const campagne = await Campagne.create({ nom: nom.trim(), dateDebut: debut, dateFin: fin, statut })
    res.json(campagne)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── DELETE supprimer une campagne ────────────────────────────
app.delete('/api/campagnes/:id', async (req, res) => {
  try {
    await Campagne.findByIdAndDelete(req.params.id)
    res.json({ message: 'Campagne supprimée' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── PUT modifier une campagne ─────────────────────────────────
app.put('/api/campagnes/:id/edit', async (req, res) => {
  try {
    const { nom, dateDebut, dateFin } = req.body
    if (!nom?.trim())  return res.status(400).json({ error: 'Nom requis' })
    if (!dateDebut)    return res.status(400).json({ error: 'Date début requise' })
    if (!dateFin)      return res.status(400).json({ error: 'Date fin requise' })

    const [dy, dm, dd] = dateDebut.split('-').map(Number)
    const [fy, fm, fd] = dateFin.split('-').map(Number)
    const debutDay = new Date(dy, dm - 1, dd)
    const finDay   = new Date(fy, fm - 1, fd)
    if (finDay < debutDay) return res.status(400).json({ error: 'Date fin doit être après date début' })

    const now    = new Date()
    const debut  = new Date(dy, dm - 1, dd, 0,  0,  0)
    const fin    = new Date(fy, fm - 1, fd, 23, 59, 59)
    const statut = debut <= now && fin >= now ? 'ouverte' : debut > now ? 'planifiee' : 'fermee'

    const campagne = await Campagne.findByIdAndUpdate(
      req.params.id,
      { nom: nom.trim(), dateDebut: debut, dateFin: fin, statut },
      { returnDocument: 'after' }
    )
    res.json(campagne)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── PUT fermer une campagne ───────────────────────────────────
app.put('/api/campagnes/:id/fermer', async (req, res) => {
  try {
    const campagne = await Campagne.findByIdAndUpdate(
      req.params.id,
      { statut: 'fermee', closedAt: new Date() },
      { returnDocument: 'after' }
    )
    res.json(campagne)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── GET vérifier si user a déjà fait l'audit dans la campagne ─
app.get('/api/campagnes/check/:userEmail', async (req, res) => {
  try {
    const now = new Date()

    // ── Helper dates locales ───────────────────────────────
    function localMidnight(d) {
      const dt = new Date(d)
      return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 0, 0, 0)
    }
    function localEndOfDay(d) {
      const dt = new Date(d)
      return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), 23, 59, 59)
    }
    function formatReste(ms) {
      const j = Math.floor(ms / (1000*60*60*24))
      const h = Math.floor((ms % (1000*60*60*24)) / (1000*60*60))
      const m = Math.floor((ms % (1000*60*60)) / (1000*60))
      if (j > 0) return `${j} jour(s) ${h}h ${m}min`
      if (h > 0) return `${h}h ${m}min`
      return `${m} minute(s)`
    }

    // ── Auto-ouvrir les campagnes planifiées ──────────────
    const planifiees = await Campagne.find({ statut: 'planifiee' })
    for (const c of planifiees) {
      if (localMidnight(c.dateDebut) <= now) {
        await Campagne.updateOne({ _id: c._id }, { statut: 'ouverte' })
      }
    }
    // ── Auto-fermer les campagnes expirées ────────────────
    const ouvertes = await Campagne.find({ statut: 'ouverte' })
    for (const c of ouvertes) {
      if (localEndOfDay(c.dateFin) < now) {
        await Campagne.updateOne({ _id: c._id }, { statut: 'fermee', closedAt: now })
      }
    }

    // ── Chercher campagne ouverte ─────────────────────────
    const campagne = await Campagne.findOne({ statut: 'ouverte' })

    if (!campagne) {
      const prochaine = await Campagne.findOne({ statut: 'planifiee' }).sort({ dateDebut: 1 })
      if (prochaine) {
        const debutLocal = localMidnight(prochaine.dateDebut)
        const diff       = debutLocal - now
        const dateStr    = debutLocal.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
        return res.json({
          canAudit:  false,
          reason:    `La campagne "${prochaine.nom}" ouvrira le ${dateStr} — Il reste ${formatReste(diff)}`,
          dateDebut: prochaine.dateDebut
        })
      }
      return res.json({ canAudit: false, reason: 'Aucune campagne ouverte' })
    }

    // ── Vérifier dates de la campagne active ─────────────
    const debutLocal = localMidnight(campagne.dateDebut)
    const finLocal   = localEndOfDay(campagne.dateFin)

    if (now < debutLocal) {
      const diff    = debutLocal - now
      const dateStr = debutLocal.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
      return res.json({
        canAudit:  false,
        reason:    `La campagne "${campagne.nom}" ouvrira le ${dateStr} — Il reste ${formatReste(diff)}`,
        dateDebut: campagne.dateDebut
      })
    }

    if (now > finLocal) {
      return res.json({
        canAudit: false,
        reason:   `La campagne "${campagne.nom}" est terminée`
      })
    }

    const existing = await Rapport.findOne({
      campagneId: campagne._id,
      userEmail:  decodeURIComponent(req.params.userEmail)
    })
    if (existing) return res.json({ canAudit: false, reason: 'Vous avez déjà participé à cette campagne', campagne: campagne.nom })

    res.json({ canAudit: true, campagne: campagne.nom, campagneId: campagne._id })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ── GET participants d'une campagne ───────────────────────────
app.get('/api/campagnes/:id/participants', async (req, res) => {
  try {
    const campagneId = req.params.id

    // Tous les utilisateurs
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      nom: String, email: String, entreprise: String
    }))
    const users = await User.find({}, 'nom email entreprise').lean()

    // Rapports complétés pour cette campagne
    const rapports = await Rapport.find({ campagneId }).lean()

    // Sessions pour cette campagne
    const Session = mongoose.models.Session || mongoose.model('Session',
      new mongoose.Schema({ sessionId: String, userEmail: String, userId: String,
        messages: Array, campagneId: mongoose.Schema.Types.Mixed,
        score: Number, updatedAt: Date }))
    const sessions = await Session.find({
      $or: [
        { campagneId: campagneId },
        { campagneId: campagneId.toString() },
        { campagneId: new mongoose.Types.ObjectId(campagneId) }
      ]
    }).lean()

    // Calculer statut pour chaque utilisateur via userId
    const participants = users.map(user => {
      const email  = user.email
      const userId = user._id?.toString()

      // ── Complété : rapport sauvegardé ────────────────────
      const rapport = rapports.find(r =>
        r.userEmail === email ||
        r.userId    === userId
      )
      if (rapport) {
        return {
          email,
          nom:        user.nom || email.split('@')[0],
          entreprise: user.entreprise || '—',
          statut:     'complete',
          score:      rapport.globalScore || 0,
          nbReponses: Object.keys(rapport.answers || {}).length,
          totalQ:     106,
        }
      }

      // ── En cours : session avec réponses ─────────────────
      const session = sessions.find(s =>
        s.userId    === userId ||
        s.userEmail === email
      )
      if (session) {
        const nbReponses = (session.messages || [])
          .filter(m => m.role === 'user').length
        if (nbReponses > 0) {
          return {
            email,
            nom:        user.nom || email.split('@')[0],
            entreprise: user.entreprise || '—',
            statut:     'en_cours',
            score:      null,
            nbReponses,
            totalQ:     106,
          }
        }
      }

      // ── Pas encore ────────────────────────────────────────
      return {
        email,
        nom:        user.nom || email.split('@')[0],
        entreprise: user.entreprise || '—',
        statut:     'pas_encore',
        score:      null,
        nbReponses: 0,
        totalQ:     106,
      }
    })

    // Trier : complétés → en cours → pas encore
    participants.sort((a, b) => {
      const order = { complete: 0, en_cours: 1, pas_encore: 2 }
      return order[a.statut] - order[b.statut]
    })

    res.json(participants)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Schéma MongoDB pour les rapports ─────────────────────────
const rapportSchema = new mongoose.Schema({
  userId:      { type: String, default: null },
  userEmail:   { type: String, default: null },
  globalScore: { type: Number, default: 0 },
  domainScores:{ type: mongoose.Schema.Types.Mixed, default: {} },
  domainsData: { type: mongoose.Schema.Types.Mixed, default: [] },
  answers:     { type: mongoose.Schema.Types.Mixed, default: {} },
  campagneId:  { type: mongoose.Schema.Types.ObjectId, default: null },
  campagneNom: { type: String, default: null },
  statut:      { type: String, default: 'généré' },
  createdAt:   { type: Date,   default: Date.now },
})
const Rapport = mongoose.models.Rapport || mongoose.model('Rapport', rapportSchema)

// ── POST sauvegarder un rapport ───────────────────────────────
app.post('/api/rapports/save', async (req, res) => {
  try {
    const { userId, userEmail, globalScore, domainScores, domainsData, answers, campagneId, campagneNom } = req.body
    const rapport = await Rapport.create({
      userId, userEmail, globalScore,
      domainScores: domainScores || {},
      domainsData:  domainsData  || [],
      answers:      answers      || {},
      campagneId:   campagneId   || null,
      campagneNom:  campagneNom  || null,
      statut: globalScore >= 70 ? 'conforme' : globalScore >= 40 ? 'partiel' : 'non-conforme',
      createdAt: new Date()
    })
    res.json(rapport)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── DELETE vider les rapports (admin) ────────────────────────
app.delete('/api/rapports/clear', async (req, res) => {
  try {
    await Rapport.deleteMany({})
    res.json({ message: 'Rapports supprimés' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── GET statistiques détaillées par domaine ─────────────────
app.get('/api/stats/domaines', async (req, res) => {
  try {
    const rapports = await Rapport.find({}).lean()

    if (rapports.length === 0) {
      return res.json({ stats: [], totalRapports: 0 })
    }

    // Charger les domaines depuis MongoDB
    const domains = await Domain.find().sort({ order: 1 }).lean()

    // Calculer stats par domaine depuis les réponses réelles
    const stats = domains.map((domain, domIdx) => {
      let vraiTotal    = 0
      let fauxTotal    = 0
      let partielTotal = 0
      let auditsCount  = 0
      let totalScore   = 0
      const nbQuestions = domain.questions?.length || 1

      rapports.forEach(rapport => {
        const answers      = rapport.answers      || {}
        const domainScores = rapport.domainScores || {}
        const score        = domainScores[domIdx]

        // Vérifier si ce rapport a des réponses pour ce domaine
        let hasAnswer = false
        for (let qIdx = 0; qIdx < nbQuestions; qIdx++) {
          const key    = domIdx + '-' + qIdx
          const answer = answers[key]
          if (answer === true)           { vraiTotal++;    hasAnswer = true }
          else if (answer === false)     { fauxTotal++;    hasAnswer = true }
          else if (answer === 'partial') { partielTotal++; hasAnswer = true }
        }

        // Compter 1 audit par rapport (pas par domaine)
        if (hasAnswer) {
          auditsCount++
          totalScore += score || 0
        }
      })

      // Compter personnes uniques
      const uniqueUsers = new Set(
        rapports
          .filter(r => Object.keys(r.answers || {}).some(k => k.startsWith(domIdx + '-')))
          .map(r => r.userEmail || 'anonyme')
      )

      return {
        label:         domain.label,
        clause:        domain.clause,
        ordre:         domIdx + 1,
        vrai:          vraiTotal,
        faux:          fauxTotal,
        partiel:       partielTotal,
        total:         auditsCount,
        personnesUniques: uniqueUsers.size,
        scoreMoyen:    auditsCount > 0 ? Math.round(totalScore / auditsCount) : 0,
      }
    })

    res.json({ stats, totalRapports: rapports.length })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── GET liste des rapports (admin) ────────────────────────────
app.get('/api/rapports', async (req, res) => {
  try {
    const rapports = await Rapport.find().sort({ createdAt: -1 }).lean()
    res.json(rapports)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Configuration NodeMailer ─────────────────────────────────
const nodemailer = require('nodemailer')

// Debug email config
console.log('📧 MAIL_USER:', process.env.MAIL_USER || '❌ manquant')
console.log('📧 MAIL_PASS longueur:', process.env.MAIL_PASS ? process.env.MAIL_PASS.length + ' caractères' : '❌ manquant')
console.log('📧 AUDITEUR_EMAIL:', process.env.AUDITEUR_EMAIL || '❌ manquant')

const transporter = nodemailer.createTransport({
  host:   '74.125.133.108',  // IP IPv4 de smtp.gmail.com
  port:    587,
  secure:  false,
  auth: {
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
  },
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.gmail.com'
  },
  family: 4  // Force IPv4
})

// ── POST envoyer rapport par email ────────────────────────────
app.post('/api/rapports/send-email', async (req, res) => {
  try {
    const { userEmail, globalScore, domainScores, pdfBase64, domainsData } = req.body

    const adminEmail   = process.env.ADMIN_EMAIL   || process.env.MAIL_USER
    const auditeurEmail = process.env.AUDITEUR_EMAIL || process.env.ADMIN_EMAIL

    if (!adminEmail && !auditeurEmail) {
      return res.status(400).json({ error: 'Emails non configurés dans .env' })
    }

    // Statut conformité
    const statut = globalScore >= 70 ? '✅ Conforme'
                 : globalScore >= 40 ? '⚠️ Partiellement conforme'
                 : '❌ Non-conforme'

    // Corps de l'email
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #0b1f45, #1b6fd8); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ AuditWise</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 8px 0 0;">Rapport d'Audit ISO 27001:2022</p>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e0eaff; border-radius: 0 0 12px 12px;">
          <h2 style="color: #0b1f45;">Nouveau rapport d'audit généré</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f0f6ff;">
              <td style="padding: 12px; font-weight: bold; color: #0b1f45; border-radius: 8px;">👤 Utilisateur</td>
              <td style="padding: 12px; color: #1b6fd8;">${userEmail || 'Anonyme'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #0b1f45;">📊 Score global</td>
              <td style="padding: 12px; font-size: 20px; font-weight: bold; color: ${globalScore >= 70 ? '#22c55e' : globalScore >= 40 ? '#f59e0b' : '#ef4444'};">${globalScore}%</td>
            </tr>
            <tr style="background: #f0f6ff;">
              <td style="padding: 12px; font-weight: bold; color: #0b1f45;">🏷️ Statut</td>
              <td style="padding: 12px;">${statut}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #0b1f45;">📅 Date</td>
              <td style="padding: 12px; color: #6b8cba;">${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            </tr>
          </table>

          <h3 style="color: #0b1f45; border-bottom: 2px solid #e0eaff; padding-bottom: 10px;">📋 Scores par domaine</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${domainsData ? domainsData.map((d, i) => `
              <tr style="background: ${i % 2 === 0 ? '#f8faff' : 'white'};">
                <td style="padding: 10px; color: #0b1f45; font-size: 13px;">${d.label}</td>
                <td style="padding: 10px; text-align: right;">
                  <span style="font-weight: bold; color: ${(domainScores[i] || 0) >= 70 ? '#22c55e' : (domainScores[i] || 0) >= 40 ? '#f59e0b' : '#ef4444'};">
                    ${domainScores[i] || 0}%
                  </span>
                </td>
              </tr>
            `).join('') : ''}
          </table>

          <div style="margin-top: 24px; padding: 16px; background: #f0f6ff; border-radius: 8px; border-left: 4px solid #1b6fd8;">
            <p style="margin: 0; color: #0b1f45; font-size: 13px;">
              📎 Le rapport PDF complet est joint à cet email.
            </p>
          </div>

          <p style="color: #94a3b8; font-size: 11px; margin-top: 24px; text-align: center;">
            Généré automatiquement par AuditWise AI — Plateforme d'Audit ISO 27001:2022
          </p>
        </div>
      </div>
    `

    // Destinataire : seulement l'auditeur
    const recipients = []
    if (auditeurEmail) recipients.push(auditeurEmail)

    // Envoi email
    await transporter.sendMail({
      from:        `"AuditWise AI" <${process.env.MAIL_USER}>`,
      to:          recipients.join(', '),
      subject:     `📊 Rapport Audit ISO 27001 — ${userEmail || 'Anonyme'} — Score: ${globalScore}%`,
      html:        htmlBody,
      attachments: pdfBase64 ? [{
        filename:    `Rapport_AuditWise_${new Date().toISOString().slice(0,10)}.pdf`,
        content:     pdfBase64,
        encoding:    'base64',
        contentType: 'application/pdf',
      }] : [],
    })

    console.log('✅ Email envoyé à:', recipients.join(', '))
    res.json({ success: true, recipients })

  } catch (err) {
    console.error('❌ Erreur email:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// ── Route : générer réclamations via RAG ────────────────────
// Pour chaque réponse FAUX/PARTIEL, l'IA génère une réclamation
// basée sur le texte exact de la clause ISO 27001:2022
app.post('/api/reclamations', async (req, res) => {
  try {
    const { domains, answers } = req.body
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY manquante' })

    const reclamations = {} // { "domIdx-qIdx": "texte réclamation" }

    console.log('📥 Answers reçus:', JSON.stringify(answers).slice(0, 200))
    console.log('📥 Domains reçus:', domains?.length, 'domaines')

    for (const [key, answer] of Object.entries(answers)) {
      console.log('  Clé:', key, '| Réponse:', answer, '| Type:', typeof answer)
      // Traiter FAUX (false ou "false") et PARTIEL
      const isFaux    = answer === false || answer === 'false' || answer === 0
      const isPartiel = answer === 'partial'
      if (!isFaux && !isPartiel) continue

      const [domIdx, qIdx] = key.split('-').map(Number)
      const domain   = domains[domIdx]
      const question = domain?.questions?.[qIdx]
      const clause   = domain?.clause

      if (!domain || !question || !clause) continue

      // RAG : chercher le texte de la clause
      const clauseDoc = getClauseFromDocument(clause)
      if (!clauseDoc) continue

      const isPartial = answer === 'partial'
      const type      = isPartial ? 'partiellement conforme' : 'non conforme'

      // Prompt court pour limiter les tokens
      const prompt = `Question d'audit ISO 27001:2022 : "${question}"
Réponse : ${type}
Clause ${clause} : "${clauseDoc.snippet.slice(0, 300)}"

Génère UNE réclamation courte (2 lignes max) expliquant ce que l'organisation doit faire pour être conforme à cette clause. Commence par un verbe d'action.`

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
            temperature: 0.3,
          }),
        })

        const data = await response.json()
        const text = data.choices?.[0]?.message?.content?.trim()
        if (text) reclamations[key] = text

      } catch (e) {
        // Fallback si erreur
        reclamations[key] = 'Mettre en conformite avec la clause ' + clause + ' de la norme ISO 27001:2022.'
      }

      // Pause pour eviter rate limit
      await new Promise(r => setTimeout(r, 300))
    }

    res.json({ reclamations })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ── Test ─────────────────────────────────────────────────────
// ── Stats route (test) ───────────────────────────────────────
app.get('/api/stats/test', (req, res) => {
  res.json({ message: 'Stats route OK ✅' })
})

app.get('/api/test', (req, res) => {
  res.json({
    status:         'OK',
    message:        'API AuditWise — Groq + RAG ISO 27001:2022',
    documentsCount: documents.length,
    domainsCount:   DOMAINS_FROM_EXCEL.length,
    questionsCount: DOMAINS_FROM_EXCEL.reduce((a, d) => a + d.questions.length, 0),
  })
})

app.get('/', (req, res) => res.send('🚀 API AuditWise — Groq + RAG ISO 27001:2022'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log('✅ Serveur lancé sur le port ' + PORT))