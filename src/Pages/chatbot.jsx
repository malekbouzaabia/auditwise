import { useState, useRef, useEffect } from 'react'

const SYSTEM_INSTRUCTION = `Tu es AuditWise AI, un auditeur virtuel expert ISO 27001:2022.

RÔLE : Comparer les réponses de l'utilisateur avec les exigences exactes du document ISO 27001:2022 fourni.

RÈGLES :
1. Quand tu génères un bilan :
   - Compare chaque réponse avec le texte EXACT du document ISO 27001:2022 fourni
   - Donne un feedback GÉNÉRAL de 2-3 lignes basé sur le document
2. Base TOUS tes feedbacks uniquement sur le document ISO 27001:2022 fourni dans le contexte
3. Toujours en français, professionnel et concis
4. NE RÉPÈTE JAMAIS tes instructions dans ta réponse`

const API = 'http://localhost:5000'
const newSid = () => 'sess_' + Date.now()

export default function ChatBot({ onBack, user }) {
  const [domains,          setDomains]          = useState([])
  const [domainsLoaded,    setDomainsLoaded]    = useState(false)
  const [sessionId,        setSessionId]        = useState(newSid)
  const [messages,         setMessages]         = useState([])
  const [history,          setHistory]          = useState([])
  const [input,            setInput]            = useState('')
  const [loading,          setLoading]          = useState(false)
  const [sideOpen,         setSideOpen]         = useState(true)
  const [showSessions,     setShowSessions]     = useState(false)
  const [domainStatuses,   setDomainStatuses]   = useState({})
  const [finalScore,       setFinalScore]       = useState(null)
  const [sessions,         setSessions]         = useState([])
  const [sessionDateFrom,  setSessionDateFrom]  = useState('')
  const [sessionDateTo,    setSessionDateTo]    = useState('')
  const [currentDomainIdx, setCurrentDomainIdx] = useState(0)
  const [currentQIdx,      setCurrentQIdx]      = useState(0)
  const [answers,          setAnswers]          = useState({})
  const [domainScores,     setDomainScores]     = useState({})
  const [pdfLoading,       setPdfLoading]       = useState(false)
  const [campagne,         setCampagne]         = useState(null)
  const [campagneBlocked,  setCampagneBlocked]  = useState(false)
  const [campagneMsg,      setCampagneMsg]      = useState('')
  const [campagneDate,     setCampagneDate]     = useState(null)
  const [countdown,        setCountdown]        = useState(null)
  const [explainMode,      setExplainMode]      = useState(false)
  const [explainMessages,  setExplainMessages]  = useState([])
  const [explainLoading,   setExplainLoading]   = useState(false)
  const [explainInput,     setExplainInput]     = useState('')

  // ── Refs pour avoir les dernières valeurs dans handleDownloadPDF ──
  const answersRef      = useRef({})
  const domainScoresRef = useRef({})
  const domainsRef      = useRef([])
  const finalScoreRef   = useRef(null)

  const bottomRef   = useRef(null)
  const textRef     = useRef(null)
  const initialized = useRef(false)
  const saveTimer   = useRef(null)
  const sidRef      = useRef(sessionId)

  // Synchroniser les refs avec les states
  useEffect(() => { answersRef.current      = answers      }, [answers])
  useEffect(() => { domainScoresRef.current = domainScores }, [domainScores])
  useEffect(() => { domainsRef.current      = domains      }, [domains])
  useEffect(() => { finalScoreRef.current   = finalScore   }, [finalScore])
  useEffect(() => { sidRef.current          = sessionId    }, [sessionId])

  // ── Charger domaines depuis Excel ─────────────────────────
  useEffect(() => {
    fetch(API + '/api/domains')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDomains(data)
          domainsRef.current = data
          console.log('✅ Domaines:', data.length, '| Questions:', data.reduce((a,d) => a+d.questions.length,0))
        } else {
          setDomains([])
          console.error('❌ Aucun domaine reçu')
        }
        setDomainsLoaded(true)
      })
      .catch(err => {
        console.error('❌ Erreur:', err.message)
        setDomains([])
        setDomainsLoaded(true)
      })
  }, [])

  useEffect(() => {
    if (!domainsLoaded) return
    loadSessions()
    if (initialized.current) return
    initialized.current = true
    // Vérifier campagne active
    checkCampagne()
  }, [domainsLoaded])

  async function checkCampagne() {
    try {
      const email = user?.email || user?.name || 'anonyme'
      const res   = await fetch(API + '/api/campagnes/check/' + encodeURIComponent(email))
      const data  = await res.json()

      if (!data.canAudit) {
        setCampagneBlocked(true)
        setCampagneMsg(data.reason)
        if (data.dateDebut) setCampagneDate(new Date(data.dateDebut))
        return
      }

      // Campagne ouverte → vérifier session existante
      const campId = data.campagneId
      setCampagne({ id: campId, nom: data.campagne })

      // Chercher session existante pour cette campagne
      try {
        const sessRes  = await fetch(API + '/api/sessions/campagne/' + campId, {
          headers: getAuthHeaders()
        })
        const sessData = await sessRes.json()

        if (sessData && sessData.sessionId) {
          // Session existante → restaurer
          console.log('✅ Session existante trouvée pour campagne', data.campagne)
          setSessionId(sessData.sessionId)
          sidRef.current = sessData.sessionId
          setMessages(sessData.messages || [])
          setHistory(sessData.history || [])

          // Restaurer état audit
          if (sessData.auditState) {
            const s = sessData.auditState
            if (s.currentDomainIdx !== undefined) setCurrentDomainIdx(s.currentDomainIdx)
            if (s.currentQIdx      !== undefined) setCurrentQIdx(s.currentQIdx)
            if (s.answers) { setAnswers(s.answers); answersRef.current = s.answers }
            if (s.domainScores) { setDomainScores(s.domainScores); domainScoresRef.current = s.domainScores }
            if (s.domainStatuses) setDomainStatuses(s.domainStatuses)
            if (s.finalScore != null) { setFinalScore(s.finalScore); finalScoreRef.current = s.finalScore }
          }

          // Afficher message de reprise
          setMessages(prev => [...prev, {
            role: 'bot',
            text: `✅ Bienvenue ! Votre audit **${data.campagne}** a été restauré.

Vous pouvez continuer depuis là où vous vous êtes arrêté.`,
            id: Date.now()
          }])
          initialized.current = true

        } else {
          // Pas de session → commencer nouveau audit
          initChat()
        }
      } catch (e) {
        // Pas de session trouvée → commencer nouveau
        initChat()
      }

    } catch (e) {
      setCampagneBlocked(true)
      setCampagneMsg('Aucune campagne ouverte')
    }
  }

  // ── Compte à rebours ─────────────────────────────────────────
  useEffect(() => {
    if (!campagneDate) return
    const interval = setInterval(() => {
      const now  = new Date()
      const diff = campagneDate - now
      if (diff <= 0) {
        clearInterval(interval)
        // Recharger la page quand la campagne ouvre
        window.location.reload()
        return
      }
      const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setCountdown({ days, hours, minutes, seconds })
    }, 1000)
    return () => clearInterval(interval)
  }, [campagneDate])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    if (messages.length === 0) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      saveSession(sidRef.current, messages, history, finalScoreRef.current)
    }, 1500)
  }, [messages])

  // ── Helpers ───────────────────────────────────────────────
  function getAuthHeaders() {
    const token = localStorage.getItem('token')
    const email = user?.email || user?.name || localStorage.getItem('userEmail') || ''
    if (email) localStorage.setItem('userEmail', email)
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      ...(email ? { 'X-User-Email': email } : {}),
    }
  }

  function getCurrentDomain()  { return domains[currentDomainIdx] }
  function getCurrentQuestion() { return domains[currentDomainIdx]?.questions[currentQIdx] }
  function getTotalQ(idx)       { return domains[idx]?.questions?.length || 0 }

  // ── Détecter si l'utilisateur ne comprend pas ────────────────
  function isConfused(txt) {
    const t = txt.trim().toLowerCase()
    const confusedList = [
      // Français
      'je comprends pas', 'je ne comprends pas', 'je comprend pas',
      'je ne comprend pas', 'cest quoi', "c'est quoi", 'kesako',
      'expliquer', 'expliquez', 'expliquer moi', 'expliquez moi',
      'je sais pas', 'je ne sais pas', 'incomprehensible',
      'pas clair', 'pas claire', 'unclear', 'quoi', '?',
      // Anglais
      "i don't understand", 'i dont understand', 'what is', 'what does',
      'explain', 'explain please', 'not clear',
      // Arabe / Tunisien
      'ما فهمتش', 'مافهمتش', 'ما فهمت', 'شنو يعني', 'شنو هذا',
      'ما نعرفش', 'علاش', 'فسرلي', 'فسر',
    ]
    return confusedList.some(c => t.includes(c)) || t === '?'
  }

  // ── Détecter si l'utilisateur a compris ───────────────────────
  function isUnderstood(txt) {
    const t = txt.trim().toLowerCase()
    const understoodList = [
      // Français
      'je comprends', 'je comprend', 'compris', 'ok', 'okay',
      'merci', 'clair', 'claire', "c'est clair", 'jai compris',
      "j'ai compris", 'bien compris', 'parfait', 'd accord', "d'accord",
      // Anglais
      'i understand', 'understood', 'got it', 'clear', 'thanks',
      'thank you', 'i get it', 'makes sense',
      // Arabe / Tunisien
      'فهمت', 'واضح', 'شكرا', 'برشا', 'ملاح', 'تمام',
    ]
    return understoodList.some(c => t.includes(c))
  }

  function parseAnswer(txt) {
    const t = txt.trim().toLowerCase().replace(/[.,!?;:']/g, '').trim()
    const fauxList = ['non','faux','f','n','négatif','no','false','nope','nah','not','negative',
      'لا','خطأ','خطا','غلط','لأ','لن','مش','مانيش','باه لا','nein','falsch','0']
    if (fauxList.some(s => t === s)) return false
    const vraiList = ['oui','vrai','o','v','affirmatif','correct','exact','yes','true','yeah',
      'yep','yup','ok','okay','right','affirmative','y','نعم','صحيح','صح','أيوه','ايوه','آه',
      'اه','بلى','إيه','واه','باهي','ملاح','si','sì','vero','ja','richtig','1']
    if (vraiList.some(s => t === s)) return true
    const partielList = ['partiel','partiellement','en partie','peut-être','parfois','pas tout à fait',
      'pas complètement','incomplet','à moitié','je sais pas','je ne sais pas','pas sûr','incertain',
      'partial','partially','maybe','sort of','kind of','not sure','not certain','sometimes',
      'ربما','نوعا ما','مش متأكد','مش عارف','ما نعرفش','شوية','بعض','نسبيا']
    if (partielList.some(p => t.includes(p))) return 'partial'
    return null
  }

  // ── callAI ────────────────────────────────────────────────
  async function callAI(hist, instruction, clause) {
    const histWithInstruction = instruction
      ? [...hist, { role: 'user', parts: instruction }]
      : hist
    const currentClause = clause || getCurrentDomain()?.clause || null
    const res = await fetch(API + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: SYSTEM_INSTRUCTION, history: histWithInstruction, currentClause }),
    })
    const data = await res.json()
    if (data.error) throw new Error(typeof data.error === 'object' ? JSON.stringify(data.error) : data.error)
    if (!data.text) throw new Error('Réponse vide')
    return data.text
  }

  // ── Sessions ──────────────────────────────────────────────
  async function saveSession(sid, msgs, hist, score) {
    try {
      await fetch(API + '/api/sessions/save', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          sessionId: sid,
          title: 'Audit ISO 27001 — ' + new Date().toLocaleDateString('fr-FR'),
          messages: msgs, history: hist, score, domains: [],
          campagneId: campagne?.id   || null,
          userEmail:  user?.email  || user?.name  || localStorage.getItem('userEmail') || null,
          auditState: {
            currentDomainIdx: currentDomainIdx,
            currentQIdx:      currentQIdx,
            answers:          answersRef.current,
            domainScores:     domainScoresRef.current,
            domainStatuses:   domainStatuses,
            finalScore:       finalScoreRef.current,
          },
        }),
      })
      loadSessions()
    } catch (e) {}
  }

  async function loadSessions() {
    try {
      const res  = await fetch(API + '/api/sessions', { headers: getAuthHeaders() })
      const data = await res.json()
      if (Array.isArray(data)) setSessions(data)
    } catch (e) {}
  }

  async function loadSession(sid) {
    try {
      const res  = await fetch(API + '/api/sessions/' + sid, { headers: getAuthHeaders() })
      const data = await res.json()
      if (data.messages) {
        setSessionId(sid); sidRef.current = sid
        setMessages(data.messages)
        setHistory(data.history || [])
        setFinalScore(data.score || null)
        finalScoreRef.current = data.score || null

        // ── Restaurer l'état de l'audit ──────────────────────
        if (data.auditState) {
          const s = data.auditState
          if (s.currentDomainIdx !== undefined) setCurrentDomainIdx(s.currentDomainIdx)
          if (s.currentQIdx      !== undefined) setCurrentQIdx(s.currentQIdx)
          if (s.answers) {
            setAnswers(s.answers)
            answersRef.current = s.answers
          }
          if (s.domainScores) {
            setDomainScores(s.domainScores)
            domainScoresRef.current = s.domainScores
          }
          if (s.domainStatuses) setDomainStatuses(s.domainStatuses)
          if (s.finalScore !== null && s.finalScore !== undefined) {
            setFinalScore(s.finalScore)
            finalScoreRef.current = s.finalScore
          }
          console.log('✅ Audit restauré — Domaine:', s.currentDomainIdx, '| Question:', s.currentQIdx)
        }
      }
    } catch (e) {}
  }

  async function deleteSession(sid, e) {
    e.stopPropagation()
    try {
      await fetch(API + '/api/sessions/' + sid, { method: 'DELETE', headers: getAuthHeaders() })
      loadSessions()
      if (sid === sidRef.current) startNewSession()
    } catch (e) {}
  }

  async function startNewSession() {
    // Toujours bloquer si campagne active
    if (campagne?.id) return
    if (messages.length > 0) await saveSession(sidRef.current, messages, history, finalScoreRef.current)
    const newId = newSid()
    setSessionId(newId); sidRef.current = newId
    setMessages([]); setHistory([])
    setFinalScore(null); finalScoreRef.current = null
    setCurrentDomainIdx(0); setCurrentQIdx(0)
    setAnswers({}); answersRef.current = {}
    setDomainScores({}); domainScoresRef.current = {}
    setDomainStatuses({})
    initialized.current = false
    setTimeout(() => { initialized.current = true; initChat() }, 100)
  }

  // ── Init chat ─────────────────────────────────────────────
  function initChat() {
    const doms = domainsRef.current
    if (doms.length === 0) {
      setMessages([{ role: 'bot', text: '❌ Questions non chargées.\n\nVérifie que :\n1. "ISO27001_Questionnaire_Complet.xlsx" est dans backend/\n2. "npm install xlsx" exécuté\n3. Serveur redémarré', id: Date.now() }])
      return
    }
    const firstDomain    = doms[0]
    const firstQ         = firstDomain.questions[0]
    const totalQ         = firstDomain.questions.length
    const totalDomains   = doms.length
    const totalQuestions = doms.reduce((a, d) => a + d.questions.length, 0)

    const welcomeText = `Bonjour ! Je suis **AuditWise AI**, votre auditeur virtuel ISO 27001:2022.

Je vais évaluer votre organisation sur **${totalDomains} domaines** avec **${totalQuestions} questions** au total.
Répondez par **Vrai**, **Faux** ou **Partiel** a chaque question.

---

📋 **Domaine 1/${totalDomains} — ${firstDomain.label}** (${totalQ} questions)

**Q1/${totalQ} :** ${firstQ}`

    setMessages([{ role: 'bot', text: welcomeText, id: Date.now() }])
    setHistory([
      { role: 'user',  parts: "Démarre l'audit ISO 27001:2022" },
      { role: 'model', parts: welcomeText },
    ])
  }

  // ── Send message ──────────────────────────────────────────
  async function sendMessage() {
    const txt = input.trim()
    if (!txt || loading || domains.length === 0) return
    if (campagneBlocked) return
    setInput('')
    if (textRef.current) textRef.current.style.height = 'auto'

    setMessages(prev => [...prev, { role: 'user', text: txt, id: Date.now() }])
    setLoading(true)

    const domain    = getCurrentDomain()
    const totalQ    = getTotalQ(currentDomainIdx)
    const currentDomainClause = domain?.clause || null

    // ── Vérifier confusion AVANT parseAnswer ─────────────────
    if (!explainMode && isConfused(txt)) {
      // Ouvrir la fenêtre popup d'explication
      setExplainMode(true)
      setExplainMessages([])
      setLoading(false)
      // Lancer l'explication automatiquement dans le popup
      openExplainPopup(getCurrentQuestion(), currentDomainClause)
      return
    }

    const answer    = parseAnswer(txt)
    const answerKey = currentDomainIdx + '-' + currentQIdx
    const newAnswers = { ...answersRef.current, [answerKey]: answer }
    setAnswers(newAnswers)
    answersRef.current = newAnswers

    const isLastQ      = currentQIdx === totalQ - 1
    const isLastDomain = currentDomainIdx === domains.length - 1

    // ── Réponse invalide ────────────────────────────────────
    if (answer === null) {
      const botText = `⚠️ Répondez par **Vrai**, **Faux** ou **Partiel** svp.\n\n**Q${currentQIdx + 1}/${totalQ} :** ${getCurrentQuestion()}`
      setMessages(prev => [...prev, { role: 'bot', text: botText, id: Date.now() + 1 }])
      setHistory(prev => [...prev, { role: 'user', parts: txt }, { role: 'model', parts: botText }])
      setLoading(false)
      return
    }

    // ── Question suivante → sans IA ─────────────────────────
    if (!isLastQ) {
      const nextQ   = domain.questions[currentQIdx + 1]
      const botText = `**Q${currentQIdx + 2}/${totalQ} :** ${nextQ}`
      setMessages(prev => [...prev, { role: 'bot', text: botText, id: Date.now() + 1 }])
      setHistory(prev => [...prev, { role: 'user', parts: txt }, { role: 'model', parts: botText }])
      setCurrentQIdx(q => q + 1)
      setLoading(false)
      return
    }

    // ── Dernière question → bilan via IA ────────────────────
    const domScore = calculateDomainScore(newAnswers, currentDomainIdx, totalQ)
    const statut   = domScore >= 70 ? '✅ Conforme' : domScore >= 40 ? '⚠️ Partiellement conforme' : '❌ Non-conforme'

    const newDomainScores = { ...domainScoresRef.current, [currentDomainIdx]: domScore }
    setDomainScores(newDomainScores)
    domainScoresRef.current = newDomainScores

    setDomainStatuses(prev => ({
      ...prev,
      [currentDomainIdx]: domScore >= 70 ? 'conforme' : domScore >= 40 ? 'partiel' : 'non-conforme'
    }))

    const reponsesStr = domain.questions.map((q, i) => {
      const a = newAnswers[currentDomainIdx + '-' + i]
      const r = a === true ? 'VRAI ✅' : a === false ? 'FAUX ❌' : a === 'partial' ? 'PARTIEL ⚠️' : '?'
      return `- ${r} : ${q}`
    }).join('\n')

    let instruction = ''

    if (!isLastDomain) {
      const nextDomain = domains[currentDomainIdx + 1]
      const nextQ      = nextDomain.questions[0]
      const nextTotalQ = nextDomain.questions.length

      instruction = `Bilan du domaine "${domain.label}" :
${reponsesStr}
Score : ${domScore}% — ${statut}

Donne un feedback GÉNÉRAL de 2-3 lignes basé sur le document ISO 27001:2022 fourni. Pas de détail par question.

Puis affiche :
---
📋 Domaine ${currentDomainIdx + 2}/${domains.length} — ${nextDomain.label} (${nextTotalQ} questions)
Q1/${nextTotalQ} : ${nextQ}`

    } else {
      const globalScore = Math.round(Object.values(newDomainScores).reduce((a, b) => a + b, 0) / domains.length)
      const scoresStr   = domains.map((d, i) => `- ${d.label} : ${newDomainScores[i] || 0}%`).join('\n')
      setFinalScore(globalScore)
      finalScoreRef.current = globalScore

      instruction = `Rapport final ISO 27001:2022 :
Score global : ${globalScore}%
Niveau : ${globalScore >= 70 ? 'Conforme ✅' : globalScore >= 40 ? 'Partiellement conforme ⚠️' : 'Non-conforme ❌'}
Scores :
${scoresStr}
Top 3 recommandations avec clauses ISO 27001:2022.
Conclusion professionnelle.`
    }

    const newHistory = [...history, { role: 'user', parts: txt }]
    try {
      const botText = await callAI(newHistory, instruction, currentDomainClause)
      setMessages(prev => [...prev, { role: 'bot', text: botText, id: Date.now() + 1 }])
      setHistory([...newHistory, { role: 'model', parts: botText }])
      if (!isLastDomain) {
        setCurrentDomainIdx(d => d + 1)
        setCurrentQIdx(0)
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Erreur : ' + e.message, id: Date.now() }])
    } finally { setLoading(false) }
  }

  function calculateDomainScore(ans, domainIdx, totalQ) {
    let count = 0
    for (let q = 0; q < totalQ; q++) {
      const a = ans[domainIdx + '-' + q]
      if (a === true) count++
      else if (a === 'partial') count += 0.5
    }
    return Math.round((count / totalQ) * 100)
  }

  // ── Download PDF ──────────────────────────────────────────
  async function handleDownloadPDF() {
    setPdfLoading(true)
    try {
      // Utiliser les REFS pour avoir les vraies valeurs finales
      const currentAnswers      = answersRef.current
      const currentDomainScores = domainScoresRef.current
      const currentDomains      = domainsRef.current
      const currentFinalScore   = finalScoreRef.current

      console.log('📊 Answers pour PDF:', Object.keys(currentAnswers).length, 'réponses')
      console.log('📊 Faux/Partiel:', Object.entries(currentAnswers).filter(([,v]) => v === false || v === 'partial').length)

      // Étape 1 : Réclamations RAG
      let reclamations = {}
      try {
        const recRes = await fetch(API + '/api/reclamations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domains: currentDomains, answers: currentAnswers }),
        })
        const recData  = await recRes.json()
        reclamations   = recData.reclamations || {}
        console.log('✅ Réclamations RAG:', Object.keys(reclamations).length)
      } catch (e) {
        console.warn('⚠️ Réclamations fallback:', e.message)
      }

      // Étape 2 : Générer PDF
      const allScores = {}
      currentDomains.forEach((d, i) => { allScores[i] = currentDomainScores[i] || 0 })

      const response = await fetch(API + '/api/pdf/rapport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domains:      currentDomains,
          answers:      currentAnswers,
          domainScores: allScores,
          globalScore:  currentFinalScore,
          userName:     user?.email || user?.name || '',
          reclamations,
        }),
      })

      if (!response.ok) throw new Error('Erreur génération PDF : ' + response.status)

      // Étape 3 : Télécharger
      const blob = await response.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'Rapport_AuditWise_' + new Date().toISOString().slice(0, 10) + '.pdf'
      a.click()
      URL.revokeObjectURL(url)

      // Étape 4 : Sauvegarder le rapport dans MongoDB
      try {
        await fetch(API + '/api/rapports/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail:    user?.email || user?.name || 'Anonyme',
            globalScore:  currentFinalScore,
            domainScores: allScores,
            answers:      currentAnswers,
            campagneId:   campagne?.id   || null,
            campagneNom:  campagne?.nom  || null,
            domainsData:  currentDomains.map((d, i) => ({
              label:  d.label,
              clause: d.clause,
              score:  allScores[i] || 0,
            })),
          }),
        })
        console.log('✅ Rapport sauvegardé dans MongoDB')
      } catch (e) {
        console.warn('⚠️ Rapport non sauvegardé:', e.message)
      }

      // Étape 5 : Envoyer le rapport par email à l'admin et l'auditeur
      try {
        // Convertir le blob PDF en base64
        const reader    = new FileReader()
        const pdfBase64 = await new Promise(resolve => {
          reader.onload  = () => resolve(reader.result.split(',')[1])
          reader.readAsDataURL(blob)
        })

        await fetch(API + '/api/rapports/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail:    user?.email || user?.name || 'Anonyme',
            globalScore:  currentFinalScore,
            domainScores: allScores,
            domainsData:  currentDomains,
            pdfBase64,
          }),
        })
        console.log('✅ Email envoye a l\'admin et l\'auditeur')
      } catch (e) {
        console.warn('⚠️ Email non envoyé:', e.message)
      }
    } catch (e) {
      alert('Erreur PDF : ' + e.message)
    } finally {
      setPdfLoading(false)
    }
  }

  // ── Ouvrir popup et lancer l'explication ─────────────────────
  async function openExplainPopup(question, clause) {
    setExplainLoading(true)
    try {
      const instruction = `L'utilisateur ne comprend pas cette question d'audit ISO 27001 :
"${question}"

RÈGLES STRICTES :
1. Explique UNIQUEMENT les termes techniques de cette question
2. Donne toujours un exemple concret et simple
3. Ne parle pas d'autre chose
4. Format OBLIGATOIRE :
   📖 **Explication :** [explication simple des termes en français]
   💡 **Exemple :** [exemple concret du monde réel]`

      const res  = await fetch(API + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'Tu es un assistant qui explique uniquement les termes techniques des questions d audit ISO 27001. Tu ne réponds à rien d autre.',
          history: [{ role: 'user', parts: instruction }],
          currentClause: clause,
        }),
      })
      const data = await res.json()
      setExplainMessages([{ role: 'bot', text: data.text || 'Erreur', id: Date.now() }])
    } catch (e) {
      setExplainMessages([{ role: 'bot', text: '❌ Erreur : ' + e.message, id: Date.now() }])
    } finally {
      setExplainLoading(false)
    }
  }

  // ── Envoyer message dans le popup ─────────────────────────────
  async function sendExplainMessage() {
    const txt = explainInput.trim()
    if (!txt || explainLoading) return
    setExplainInput('')

    // Utilisateur a compris → fermer popup
    if (isUnderstood(txt)) {
      setExplainMode(false)
      setExplainMessages([])
      const botText = `✅ Super ! Revenons à la question :

**Q${currentQIdx + 1}/${getTotalQ(currentDomainIdx)} :** ${getCurrentQuestion()}`
      setMessages(prev => [...prev, { role: 'bot', text: botText, id: Date.now() }])
      return
    }

    // Ajouter message utilisateur
    const userMsg = { role: 'user', text: txt, id: Date.now() }
    setExplainMessages(prev => [...prev, userMsg])
    setExplainLoading(true)

    try {
      const question = getCurrentQuestion()
      const instruction = `Question d'audit : "${question}"
Message utilisateur : "${txt}"

RÈGLES : Explique UNIQUEMENT les termes techniques de cette question. Si la question est hors contexte, réponds : "Je suis ici uniquement pour expliquer les termes de cette question."
Format : 📖 Explication + 💡 Exemple`

      const res  = await fetch(API + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: 'Tu es un assistant qui explique uniquement les termes techniques des questions d audit ISO 27001.',
          history: [...explainMessages.map(m => ({ role: m.role === 'bot' ? 'model' : 'user', parts: m.text })), { role: 'user', parts: instruction }],
          currentClause: domain?.clause || null,
        }),
      })
      const data = await res.json()
      setExplainMessages(prev => [...prev, { role: 'bot', text: data.text || 'Erreur', id: Date.now() + 1 }])
    } catch (e) {
      setExplainMessages(prev => [...prev, { role: 'bot', text: '❌ ' + e.message, id: Date.now() }])
    } finally {
      setExplainLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const domain     = getCurrentDomain()
  const totalQ     = domain?.questions?.length || 0
  const progress   = domains.length === 0 ? 0 : Math.round((Object.keys(domainStatuses).length / domains.length) * 100)
  const scoreColor = finalScore === null ? '#1b6fd8' : finalScore >= 70 ? '#22c55e' : finalScore >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '"DM Sans", sans-serif', background: '#f0f6ff', overflow: 'hidden' }}>

      {/* ════ SIDEBAR ════ */}
      <div style={{ width: sideOpen ? '272px' : '0px', minWidth: sideOpen ? '272px' : '0px', overflow: 'hidden', background: 'linear-gradient(170deg, #071530 0%, #0b1f45 40%, #0d2a60 100%)', display: 'flex', flexDirection: 'column', transition: 'width 0.35s cubic-bezier(.4,0,.2,1), min-width 0.35s', flexShrink: 0, boxShadow: '6px 0 30px rgba(7,21,48,0.4)' }}>
        <div style={{ width: '272px', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

          <div style={{ padding: '26px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '42px', height: '42px', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '21px', boxShadow: '0 6px 18px rgba(27,111,216,0.5)', flexShrink: 0 }}>🛡️</div>
              <div>
                <div style={{ fontFamily: '"Sora", sans-serif', fontWeight: '800', fontSize: '16px', color: 'white' }}>AuditWise AI</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)' }}>Auditeur ISO 27001:2022</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.055)', borderRadius: '12px', padding: '13px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Progression</span>
                <span style={{ fontFamily: '"Sora", sans-serif', fontSize: '14px', fontWeight: '800', color: '#3b9eff' }}>{progress}%</span>
              </div>
              <div style={{ height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden', marginBottom: '7px' }}>
                <div style={{ height: '100%', width: progress + '%', background: 'linear-gradient(90deg, #1b6fd8, #3b9eff)', borderRadius: '100px', transition: 'width 0.7s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)' }}>{Object.keys(domainStatuses).length}/{domains.length} domaines</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.28)' }}>
                  {finalScore === null ? 'D' + (currentDomainIdx+1) + '/' + domains.length + ' · Q' + (currentQIdx+1) + '/' + totalQ : 'Score: ' + finalScore + '%'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '10px', paddingLeft: '8px' }}>
              {domains.length} Domaines — {domains.reduce((a,d) => a+(d.questions?.length||0), 0)} Questions
            </div>
            {domainsLoaded && domains.length === 0 && (
              <div style={{ padding: '16px', background: 'rgba(239,68,68,0.1)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.3)' }}>
                <div style={{ fontSize: '11px', color: '#f87171', fontWeight: '600' }}>❌ Excel non chargé</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>Vérifie backend/ISO27001_Questionnaire_Complet.xlsx</div>
              </div>
            )}
            {domains.map((d, idx) => {
              const isActive = idx === currentDomainIdx && finalScore === null
              const status   = domainStatuses[idx]
              const si = status === 'conforme' ? '✅' : status === 'partiel' ? '⚠️' : status === 'non-conforme' ? '❌' : isActive ? '▶️' : (d.icon || '📋')
              const sc = status === 'conforme' ? '#4ade80' : status === 'partiel' ? '#fbbf24' : status === 'non-conforme' ? '#f87171' : isActive ? '#3b9eff' : 'rgba(255,255,255,0.36)'
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '9px', marginBottom: '2px', background: isActive ? 'rgba(59,158,255,0.12)' : status ? 'rgba(255,255,255,0.05)' : 'transparent', border: isActive ? '1px solid rgba(59,158,255,0.3)' : '1px solid transparent', transition: 'all 0.3s' }}>
                  <span style={{ fontSize: '14px', flexShrink: 0, width: '20px', textAlign: 'center' }}>{si}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: isActive || status ? '600' : '400', color: sc, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</div>
                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '1px' }}>{d.questions?.length} questions</div>
                  </div>
                  {status ? (
                    <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 7px', borderRadius: '100px', background: sc + '22', color: sc, border: '1px solid ' + sc + '44' }}>
                      {{ conforme: 'OK', partiel: '~OK', 'non-conforme': 'NOK' }[status]}
                    </span>
                  ) : isActive ? (
                    <span style={{ fontSize: '9px', fontWeight: '700', padding: '2px 7px', borderRadius: '100px', background: 'rgba(59,158,255,0.2)', color: '#3b9eff', border: '1px solid rgba(59,158,255,0.4)' }}>
                      Q{currentQIdx+1}/{totalQ}
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>

          {finalScore !== null && (
            <div style={{ margin: '8px 14px', background: scoreColor + '18', border: '1px solid ' + scoreColor + '40', borderRadius: '12px', padding: '14px', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: scoreColor, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '5px', opacity: 0.8 }}>Score Final</div>
              <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '36px', fontWeight: '800', color: scoreColor, lineHeight: 1 }}>
                {finalScore}<span style={{ fontSize: '15px', opacity: 0.6 }}>%</span>
              </div>
              <div style={{ fontSize: '11px', color: scoreColor, opacity: 0.7, marginTop: '4px', fontWeight: '600' }}>
                {finalScore >= 70 ? 'Conforme ✅' : finalScore >= 40 ? 'Partiellement ⚠️' : 'Non-conforme ❌'}
              </div>
              <button onClick={handleDownloadPDF} disabled={pdfLoading}
                style={{ width: '100%', marginTop: '12px', padding: '10px', background: pdfLoading ? 'rgba(27,111,216,0.5)' : 'linear-gradient(135deg, #1b6fd8, #1551a8)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '12px', fontWeight: '700', cursor: pdfLoading ? 'not-allowed' : 'pointer', fontFamily: '"DM Sans", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {pdfLoading ? '⏳ Génération...' : '📄 Télécharger Rapport PDF'}
              </button>
            </div>
          )}

          <div style={{ padding: '10px 14px 22px', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={onBack}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'rgba(255,255,255,0.44)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >← Retour accueil</button>
          </div>
        </div>
      </div>

      {/* ════ SESSIONS ════ */}
      {showSessions && (
        <div style={{ width: '250px', background: 'white', borderRight: '1px solid rgba(27,111,216,0.1)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(27,111,216,0.08)' }}>
            <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '13px', fontWeight: '800', color: '#0b1f45', marginBottom: '10px' }}>💬 Mes Sessions</div>

            {campagne && (
              <div style={{ padding: '8px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '10px', fontSize: '11px', color: '#16a34a', fontWeight: '600', textAlign: 'center' }}>
                🎯 {campagne.nom}<br/>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '400' }}>1 session par campagne</span>
              </div>
            )}
          </div>
          {/* Filtre date */}
          <div style={{ padding: '8px 14px', borderBottom: '1px solid rgba(27,111,216,0.08)' }}>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#6b8cba', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📅 Filtrer par date</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', width: '20px' }}>Du</span>
                <input type="date" value={sessionDateFrom} onChange={e => setSessionDateFrom(e.target.value)}
                  style={{ flex: 1, padding: '5px 8px', border: '1px solid rgba(27,111,216,0.2)', borderRadius: '7px', fontSize: '10px', fontFamily: '"DM Sans", sans-serif', color: '#0b1f45', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8', width: '20px' }}>Au</span>
                <input type="date" value={sessionDateTo} onChange={e => setSessionDateTo(e.target.value)}
                  style={{ flex: 1, padding: '5px 8px', border: '1px solid rgba(27,111,216,0.2)', borderRadius: '7px', fontSize: '10px', fontFamily: '"DM Sans", sans-serif', color: '#0b1f45', outline: 'none' }}
                />
              </div>
              {(sessionDateFrom || sessionDateTo) && (
                <button onClick={() => { setSessionDateFrom(''); setSessionDateTo('') }}
                  style={{ padding: '4px', background: '#fee2e2', border: 'none', borderRadius: '6px', fontSize: '10px', color: '#dc2626', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontWeight: '600' }}>
                  ✕ Réinitialiser
                </button>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {(() => {
              const filtered = sessions.filter(s => {
                // Montrer seulement les sessions de la campagne active
                if (campagne?.id && s.campagneId && s.campagneId !== campagne.id.toString()) return false
                const d = s.updatedAt ? new Date(s.updatedAt) : null
                if (!d) return true
                if (sessionDateFrom && d < new Date(sessionDateFrom)) return false
                if (sessionDateTo   && d > new Date(sessionDateTo + 'T23:59:59')) return false
                return true
              })
              return filtered.length === 0
                ? <div style={{ textAlign: 'center', padding: '20px 10px', color: '#b0c4de', fontSize: '11px' }}>
                    {sessions.length === 0 ? 'Aucune session' : 'Aucune session pour cette période'}
                  </div>
                : filtered.map(s => {
                  const isActive = s.sessionId === sessionId
                  return (
                    <div key={s.sessionId} onClick={() => loadSession(s.sessionId)}
                      style={{ padding: '10px 12px', borderRadius: '10px', marginBottom: '5px', cursor: 'pointer', background: isActive ? '#eff6ff' : 'transparent', border: isActive ? '1.5px solid rgba(27,111,216,0.25)' : '1.5px solid transparent' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: isActive ? '#1b6fd8' : '#0b1f45' }}>🛡️ {isActive ? 'Session active' : 'Audit ISO 27001'}</div>
                          <div style={{ fontSize: '10px', color: '#7c9cbf', marginTop: '3px' }}>{new Date(s.updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                          {s.score != null && (
                            <span style={{ fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '100px', background: s.score >= 70 ? '#dcfce7' : s.score >= 40 ? '#fef9c3' : '#fee2e2', color: s.score >= 70 ? '#16a34a' : s.score >= 40 ? '#ca8a04' : '#dc2626' }}>
                              {s.score}%
                            </span>
                          )}
                        </div>
                        <button onClick={e => deleteSession(s.sessionId, e)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#cbd5e1', padding: '2px 4px', borderRadius: '6px' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fee2e2' }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'none' }}
                        >🗑️</button>
                      </div>
                    </div>
                  )
                })
            })()}
          </div>
        </div>
      )}

      {/* ════ CHAT ════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        <div style={{ height: '64px', background: 'white', borderBottom: '1px solid rgba(27,111,216,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 26px', flexShrink: 0, boxShadow: '0 2px 16px rgba(11,31,69,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSideOpen(p => !p)} style={{ width: '34px', height: '34px', background: '#f0f6ff', border: '1px solid rgba(27,111,216,0.14)', borderRadius: '9px', cursor: 'pointer', fontSize: '12px', color: '#1b6fd8', fontWeight: '700' }}>
              {sideOpen ? '◀' : '▶'}
            </button>
            <div style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🤖</div>
            <div>
              <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '14px', fontWeight: '800', color: '#0b1f45' }}>Auditeur Virtuel ISO 27001:2022</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '7px', height: '7px', background: loading ? '#f59e0b' : '#22c55e', borderRadius: '50%' }} />
                <span style={{ fontSize: '11px', color: '#7c9cbf' }}>
                  {!domainsLoaded ? 'Chargement Excel...' : loading ? 'Analyse...' : domain ? domain.label + ' · Q' + (currentQIdx+1) + '/' + totalQ : 'Prêt'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowSessions(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', background: showSessions ? '#1b6fd8' : '#f0f6ff', border: '1px solid rgba(27,111,216,0.2)', borderRadius: '10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: showSessions ? 'white' : '#1b6fd8' }}>
              💬 Sessions {sessions.length > 0 && <span style={{ background: showSessions ? 'rgba(255,255,255,0.3)' : '#1b6fd8', color: 'white', borderRadius: '100px', padding: '1px 7px', fontSize: '10px' }}>{sessions.length}</span>}
            </button>

          </div>
        </div>

        {domain && finalScore === null && messages.length > 0 && (
          <div style={{ background: '#eff6ff', borderBottom: '1px solid rgba(27,111,216,0.12)', padding: '8px 36px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#1b6fd8' }}>
              {domain.icon || '📋'} {domain.label} · Q{currentQIdx+1}/{totalQ}
            </span>
            <span style={{ fontSize: '10px', background: '#3b9eff20', padding: '2px 8px', borderRadius: '20px', color: '#1b6fd8' }}>📄 Excel + RAG ISO</span>
            {explainMode ? (
            <span style={{ fontSize: '11px', background: '#fff8f0', color: '#d97706', padding: '2px 10px', borderRadius: '20px', fontWeight: '700', border: '1px solid #f59e0b' }}>
              💬 Mode explication — dites "compris" pour continuer
            </span>
          ) : (
            <span style={{ fontSize: '11px', color: '#0b1f45', opacity: 0.7 }}>→ <strong>Vrai</strong> · <strong>Faux</strong> · <strong>Partiel</strong></span>
          )}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '26px 36px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {campagneBlocked && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '40px' }}>

              {/* Icône */}
              <div style={{ fontSize: '64px' }}>
                {campagneMsg.includes('ouvrira') ? '📅' : campagneMsg.includes('terminée') ? '🏁' : campagneMsg.includes('déjà') ? '✅' : '🔒'}
              </div>

              {/* Titre */}
              <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '22px', fontWeight: '800', color: '#0b1f45', textAlign: 'center' }}>
                {campagneMsg.includes('ouvrira') ? 'Campagne pas encore ouverte'
                  : campagneMsg.includes('terminée') ? 'Campagne terminée'
                  : campagneMsg.includes('déjà') ? 'Audit déjà complété'
                  : 'Audit non disponible'}
              </div>

              {/* Message */}
              <div style={{ background: campagneMsg.includes('ouvrira') ? '#eff6ff' : '#fff8f0', border: `1px solid ${campagneMsg.includes('ouvrira') ? '#1b6fd8' : '#f59e0b'}`, borderRadius: '14px', padding: '16px 24px', textAlign: 'center', maxWidth: '440px' }}>
                <div style={{ fontSize: '14px', color: campagneMsg.includes('ouvrira') ? '#1b6fd8' : '#d97706', fontWeight: '600' }}>
                  {campagneMsg}
                </div>
              </div>

              {/* Compte à rebours */}
              {countdown && campagneMsg.includes('ouvrira') && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#6b8cba', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Ouverture dans
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                      { value: countdown.days,    label: 'Jours'   },
                      { value: countdown.hours,   label: 'Heures'  },
                      { value: countdown.minutes, label: 'Minutes' },
                      { value: countdown.seconds, label: 'Secondes'},
                    ].map(({ value, label }) => (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #0b1f45, #1b6fd8)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(27,111,216,0.3)' }}>
                          <span style={{ fontFamily: '"Sora", sans-serif', fontSize: '26px', fontWeight: '800', color: 'white' }}>
                            {String(value).padStart(2, '0')}
                          </span>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    🔄 La page se rafraîchira automatiquement à l'ouverture
                  </div>
                </div>
              )}
            </div>
          )}
          {!campagneBlocked && messages.length === 0 && !domainsLoaded && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', opacity: 0.5, marginTop: '80px' }}>
              <div style={{ fontSize: '44px' }}>📄</div>
              <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '14px', fontWeight: '700', color: '#0b1f45' }}>Chargement des questions depuis Excel...</div>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.28s ease' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '75%' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0, background: msg.role === 'bot' ? 'linear-gradient(135deg, #1b6fd8, #3b9eff)' : 'linear-gradient(135deg, #334155, #475569)', boxShadow: '0 3px 10px rgba(0,0,0,0.18)' }}>
                  {msg.role === 'bot' ? '🤖' : '👤'}
                </div>
                <div style={{ padding: '13px 17px', borderRadius: msg.role === 'bot' ? '4px 18px 18px 18px' : '18px 4px 18px 18px', background: msg.role === 'bot' ? 'white' : 'linear-gradient(135deg, #1b6fd8, #1551a8)', color: msg.role === 'bot' ? '#0b1f45' : 'white', boxShadow: msg.role === 'bot' ? '0 4px 20px rgba(11,31,69,0.09)' : '0 5px 20px rgba(27,111,216,0.38)', border: msg.role === 'bot' ? '1px solid rgba(27,111,216,0.09)' : 'none', fontSize: '13.5px', lineHeight: '1.72', whiteSpace: 'pre-wrap' }}>
                  <RichText text={msg.text || ''} />
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg, #1b6fd8, #3b9eff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}>🤖</div>
              <div style={{ background: 'white', borderRadius: '4px 18px 18px 18px', padding: '14px 18px', boxShadow: '0 4px 20px rgba(11,31,69,0.09)', border: '1px solid rgba(27,111,216,0.09)', display: 'flex', gap: '6px' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: '8px', height: '8px', background: '#1b6fd8', borderRadius: '50%', animation: 'bounce 1.3s ' + (i*0.18) + 's infinite ease-in-out' }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} style={{ height: 1 }} />
        </div>

        <div style={{ padding: '13px 36px 20px', background: 'white', borderTop: '1px solid rgba(27,111,216,0.08)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '11px', alignItems: 'flex-end', background: '#f5f9ff', borderRadius: '16px', padding: '11px 15px', border: '1.5px solid rgba(27,111,216,0.15)' }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = '#1b6fd8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(27,111,216,0.09)' }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(27,111,216,0.15)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            <textarea ref={textRef} value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px' }}
              onKeyDown={handleKey} disabled={loading}
              placeholder={campagneBlocked ? "Audit non disponible — aucune campagne ouverte" : "Tapez Vrai / Faux / Partiel (ou Yes/No, نعم/لا...)"}
              rows={1} style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '13.5px', color: '#0b1f45', fontFamily: '"DM Sans", sans-serif', resize: 'none', lineHeight: '1.55', minHeight: '24px', maxHeight: '120px', opacity: loading || campagneBlocked ? 0.5 : 1 }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{ width: '42px', height: '42px', flexShrink: 0, background: loading || !input.trim() ? 'rgba(27,111,216,0.15)' : 'linear-gradient(135deg, #1b6fd8, #1551a8)', border: 'none', borderRadius: '12px', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>➤</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '7px', padding: '0 3px' }}>
            <span style={{ fontSize: '11px', color: '#b0c4de' }}>
              📄 {domains.length} domaines · {domains.reduce((a,d) => a+(d.questions?.length||0), 0)} questions · RAG ISO 27001:2022
            </span>
            <span style={{ fontSize: '11px', color: '#b0c4de' }}>↵ Entrée pour envoyer</span>
          </div>
        </div>
      </div>

      {/* ════ SOUS-CHATBOT EXPLICATION ════ */}
      {explainMode && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'stretch', animation: 'slideUp 0.3s ease' }}>

          {/* Overlay semi-transparent */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(11,31,69,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => { setExplainMode(false); setExplainMessages([]) }} />

          {/* Fenêtre sous-chatbot */}
          <div style={{ position: 'relative', marginLeft: 'auto', width: '480px', height: '100vh', background: '#f0f6ff', display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 60px rgba(11,31,69,0.3)' }}>

            {/* ── TOPBAR ── */}
            <div style={{ height: '64px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0, boxShadow: '0 2px 16px rgba(217,119,6,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', background: 'rgba(255,255,255,0.2)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💡</div>
                <div>
                  <div style={{ fontFamily: '"Sora", sans-serif', fontSize: '14px', fontWeight: '800', color: 'white' }}>Assistant Explication</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%', opacity: 0.8 }} />
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>Termes ISO 27001:2022</span>
                  </div>
                </div>
              </div>
              <button onClick={() => { setExplainMode(false); setExplainMessages([]) }}
                style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            {/* ── BANDEAU QUESTION ── */}
            <div style={{ background: 'white', padding: '10px 20px', borderBottom: '1px solid rgba(245,158,11,0.15)', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>❓ Question en cours</div>
              <div style={{ fontSize: '12px', color: '#0b1f45', fontWeight: '600', fontStyle: 'italic' }}>"{getCurrentQuestion()}"</div>
            </div>

            {/* ── MESSAGES ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Message de bienvenue */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, boxShadow: '0 3px 10px rgba(217,119,6,0.3)' }}>💡</div>
                <div style={{ background: 'white', padding: '12px 16px', borderRadius: '4px 16px 16px 16px', boxShadow: '0 3px 12px rgba(11,31,69,0.08)', border: '1px solid rgba(245,158,11,0.15)', fontSize: '13px', color: '#0b1f45', lineHeight: '1.6', maxWidth: '340px' }}>
                  Bonjour ! Je suis ici pour vous expliquer les <strong>termes techniques</strong> de cette question. Posez-moi vos questions ! 😊
                </div>
              </div>

              {/* Loading */}
              {explainLoading && explainMessages.length === 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💡</div>
                  <div style={{ background: 'white', borderRadius: '4px 16px 16px 16px', padding: '14px 18px', boxShadow: '0 3px 12px rgba(11,31,69,0.08)', border: '1px solid rgba(245,158,11,0.1)', display: 'flex', gap: '6px' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%', animation: 'bounce 1.3s ' + (i*0.18) + 's infinite ease-in-out' }} />)}
                  </div>
                </div>
              )}

              {/* Messages */}
              {explainMessages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeUp 0.28s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '360px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0, background: msg.role === 'bot' ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'linear-gradient(135deg, #334155, #475569)', boxShadow: '0 3px 10px rgba(0,0,0,0.15)' }}>
                      {msg.role === 'bot' ? '💡' : '👤'}
                    </div>
                    <div style={{ padding: '12px 16px', borderRadius: msg.role === 'bot' ? '4px 16px 16px 16px' : '16px 4px 16px 16px', background: msg.role === 'bot' ? 'white' : 'linear-gradient(135deg, #d97706, #f59e0b)', color: msg.role === 'bot' ? '#0b1f45' : 'white', boxShadow: msg.role === 'bot' ? '0 3px 12px rgba(11,31,69,0.08)' : '0 3px 12px rgba(217,119,6,0.3)', border: msg.role === 'bot' ? '1px solid rgba(245,158,11,0.12)' : 'none', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                      <RichText text={msg.text || ''} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading during conversation */}
              {explainLoading && explainMessages.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: 'linear-gradient(135deg, #d97706, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💡</div>
                  <div style={{ background: 'white', borderRadius: '4px 16px 16px 16px', padding: '14px 18px', boxShadow: '0 3px 12px rgba(11,31,69,0.08)', display: 'flex', gap: '6px' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: '8px', height: '8px', background: '#f59e0b', borderRadius: '50%', animation: 'bounce 1.3s ' + (i*0.18) + 's infinite ease-in-out' }} />)}
                  </div>
                </div>
              )}
            </div>

            {/* ── BOUTON COMPRIS ── */}
            <div style={{ padding: '10px 16px', background: '#fffbeb', borderTop: '1px solid rgba(245,158,11,0.15)', flexShrink: 0 }}>
              <button onClick={() => {
                setExplainMode(false); setExplainMessages([])
                const botText = `✅ Super ! Revenons à la question :

**Q${currentQIdx + 1}/${getTotalQ(currentDomainIdx)} :** ${getCurrentQuestion()}`
                setMessages(prev => [...prev, { role: 'bot', text: botText, id: Date.now() }])
              }}
                style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}>
                ✅ J'ai compris — Retour à la question
              </button>
            </div>

            {/* ── INPUT ── */}
            <div style={{ padding: '12px 16px 18px', background: 'white', borderTop: '1px solid rgba(245,158,11,0.1)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', background: '#fffbeb', borderRadius: '14px', padding: '10px 14px', border: '1.5px solid rgba(245,158,11,0.2)' }}
                onFocusCapture={e => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.1)' }}
                onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.2)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <input value={explainInput} onChange={e => setExplainInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendExplainMessage()}
                  placeholder="Posez une question sur ce terme..."
                  disabled={explainLoading}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '13px', color: '#0b1f45', fontFamily: '"DM Sans", sans-serif', minHeight: '24px' }}
                />
                <button onClick={sendExplainMessage} disabled={explainLoading || !explainInput.trim()}
                  style={{ width: '38px', height: '38px', flexShrink: 0, background: explainLoading || !explainInput.trim() ? 'rgba(245,158,11,0.2)' : 'linear-gradient(135deg, #d97706, #f59e0b)', border: 'none', borderRadius: '10px', cursor: explainLoading || !explainInput.trim() ? 'not-allowed' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>➤</button>
              </div>
              <div style={{ fontSize: '10px', color: '#d97706', textAlign: 'center', marginTop: '6px', opacity: 0.7 }}>
                Dites "compris" ou cliquez le bouton vert pour revenir à l'audit
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:rgba(27,111,216,0.2);border-radius:100px}
      `}</style>
    </div>
  )
}

function RichText({ text }) {
  if (!text) return null
  return (
    <>
      {text.split('\n').map((line, li, arr) => (
        <span key={li}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((p, pi) =>
            p.startsWith('**') && p.endsWith('**')
              ? <strong key={pi} style={{ fontWeight: '800' }}>{p.slice(2,-2)}</strong>
              : <span key={pi}>{p}</span>
          )}
          {li < arr.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}