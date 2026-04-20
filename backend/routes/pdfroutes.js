const express = require('express')
const router  = express.Router()
const PDFDocument = require('pdfkit')

router.post('/rapport', (req, res) => {
  try {
    const { domains, answers, domainScores, globalScore, userName, reclamations = {} } = req.body

    const doc = new PDFDocument({ margin: 40, size: 'A4', autoFirstPage: true, bufferPages: true })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=Rapport_AuditWise.pdf')
    doc.pipe(res)

    const BLUE   = '#1b6fd8'
    const DARK   = '#0b1f45'
    const GREEN  = '#22c55e'
    const RED    = '#ef4444'
    const ORANGE = '#f59e0b'
    const GRAY   = '#6b7e99'
    const W      = doc.page.width
    const H      = doc.page.height
    const M      = 40
    const FOOTER = 28
    const HEADER = 42

    function scoreColor(s) { return s >= 70 ? GREEN : s >= 40 ? ORANGE : RED }
    function scoreLabel(s) { return s >= 70 ? 'Conforme' : s >= 40 ? 'Partiellement conforme' : 'Non-conforme' }

    let Y = 0

    function drawHeader(title) {
      doc.rect(0, 0, W, HEADER).fill(BLUE)
      doc.fillColor('#fff').fontSize(10).font('Helvetica-Bold').text(title, M, 15)
      doc.fillColor('rgba(255,255,255,0.6)').fontSize(8).font('Helvetica').text('AuditWise AI', W - M - 60, 17)
      Y = HEADER + 10
    }

    function drawFooter() {
      // Dessiner footer sur la page courante SANS créer de nouvelle page
      const savedY = Y
      doc.rect(0, H - FOOTER, W, FOOTER).fill(DARK)
      doc.fillColor('#aac8f0').fontSize(8).font('Helvetica')
         .text('AuditWise AI — Rapport Confidentiel ISO 27001:2022', M, H - 18)
      Y = savedY
    }

    function newPage(title) {
      // Dessiner footer sur page actuelle puis créer nouvelle page
      drawFooter()
      doc.addPage()
      drawHeader(title || 'DETAIL DES DOMAINES (suite)')
    }

    function ensureSpace(needed) {
      if (Y + needed > H - FOOTER - 5) {
        newPage('DETAIL DES DOMAINES (suite)')
      }
    }

    // ════ PAGE 1 — COUVERTURE ════
    doc.rect(0, 0, W, H).fill(DARK)
    doc.rect(0, 0, W, 8).fill(BLUE)
    doc.circle(W/2, 125, 46).fillAndStroke(BLUE, '#fff')
    doc.fillColor('#fff').fontSize(18).font('Helvetica-Bold').text('Audit', 0, 108, { align: 'center' })
    doc.fontSize(12).text('Wise', 0, 133, { align: 'center' })
    doc.fillColor('#fff').fontSize(24).font('Helvetica-Bold').text("RAPPORT D'AUDIT", 0, 210, { align: 'center' })
    doc.fillColor('#7ab3f0').fontSize(15).font('Helvetica').text('ISO 27001:2022', 0, 242, { align: 'center' })
    const sc = scoreColor(globalScore)
    doc.roundedRect(W/2 - 70, 282, 140, 65, 8).fill(sc)
    doc.fillColor('#fff').fontSize(30).font('Helvetica-Bold').text(globalScore + '%', 0, 296, { align: 'center' })
    doc.fontSize(11).font('Helvetica').text(scoreLabel(globalScore), 0, 334, { align: 'center' })
    doc.fillColor('#aac8f0').fontSize(10).font('Helvetica')
    if (userName) doc.text('Organisation : ' + userName, 0, 395, { align: 'center' })
    doc.text('Date : ' + new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }), 0, 415, { align: 'center' })
    doc.text('Genere par AuditWise AI', 0, 433, { align: 'center' })
    // Footer page 1
    doc.rect(0, H - FOOTER, W, FOOTER).fill(BLUE)
    doc.fillColor('#fff').fontSize(9).font('Helvetica')
       .text('AuditWise AI — Rapport Confidentiel — ISO/IEC 27001:2022', 0, H - 18, { align: 'center' })

    // ════ PAGE 2 — SCORES PAR DOMAINE ════
    doc.addPage()
    drawHeader('SCORES PAR DOMAINE')

    doc.fillColor(DARK).fontSize(14).font('Helvetica-Bold')
       .text('Evaluation par domaine ISO 27001:2022', M, Y)
    Y += 22
    doc.rect(M, Y, W - 2*M, 1.5).fill(BLUE)
    Y += 8

    domains.forEach((domain, idx) => {
      const score = domainScores[idx] || 0
      const col   = scoreColor(score)
      if (idx % 2 === 0) doc.rect(M, Y - 3, W - 2*M, 27).fill('#f8faff')
      doc.circle(M + 10, Y + 9, 9).fill(BLUE)
      doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold')
         .text((idx+1).toString(), M+1, Y+5, { width: 18, align: 'center' })
      doc.fillColor(DARK).fontSize(10).font('Helvetica-Bold')
         .text(domain.label, M+24, Y+1, { width: 185 })
      doc.fillColor(GRAY).fontSize(8).font('Helvetica')
         .text('Clause ' + (domain.clause || '-'), M+24, Y+13)
      const barX = M + 218
      const barW = 125
      doc.rect(barX, Y+7, barW, 7).fill('#dce8f8')
      if (score > 0) doc.rect(barX, Y+7, barW * score / 100, 7).fill(col)
      doc.fillColor(col).fontSize(12).font('Helvetica-Bold')
         .text(score + '%', W-M-42, Y+4, { width: 40, align: 'right' })
      Y += 27
    })

    Y += 8
    doc.rect(M, Y, W - 2*M, 30).fill(scoreColor(globalScore))
    doc.fillColor('#fff').fontSize(12).font('Helvetica-Bold')
       .text('SCORE GLOBAL : ' + globalScore + '% — ' + scoreLabel(globalScore).toUpperCase(),
             0, Y + 9, { align: 'center' })
    Y += 30

    // Footer page 2
    drawFooter()

    // ════ PAGES DETAIL ════
    doc.addPage()
    drawHeader('DETAIL DES DOMAINES — Questions & Reponses')

    domains.forEach((domain, domIdx) => {
      const domScore = domainScores[domIdx] || 0
      const domCol   = scoreColor(domScore)

      // Titre domaine
      ensureSpace(50)
      doc.rect(M, Y, W - 2*M, 34).fill('#eef4ff')
      doc.rect(M, Y, 4, 34).fill(BLUE)
      doc.fillColor(DARK).fontSize(12).font('Helvetica-Bold')
         .text((domIdx+1) + '. ' + domain.label, M+10, Y+6, { width: W - 2*M - 100 })
      doc.fillColor(GRAY).fontSize(8).font('Helvetica')
         .text('Clause ' + (domain.clause || 'N/A'), M+10, Y+21)
      doc.roundedRect(W - M - 68, Y+8, 62, 20, 4).fill(domCol)
      doc.fillColor('#fff').fontSize(11).font('Helvetica-Bold')
         .text(domScore + '%', W-M-68, Y+13, { width: 62, align: 'center' })
      Y += 38

      // Questions
      domain.questions.forEach((question, qIdx) => {
        const answerKey  = domIdx + '-' + qIdx
        const answer     = answers[answerKey]
        const isOui      = answer === true
        const isNon      = answer === false
        const isPartial  = answer === 'partial'
        const qScore     = isOui ? 100 : isPartial ? 50 : 0
        const badge      = isOui ? 'VRAI' : isNon ? 'FAUX' : isPartial ? 'PARTIEL' : '?'
        const badgeCol   = isOui ? GREEN  : isNon ? RED    : isPartial ? ORANGE    : GRAY
        const bgColor    = isOui ? '#f0fff4' : isNon ? '#fff5f5' : isPartial ? '#fff8f0' : '#f8faff'
        const reclamText = reclamations[answerKey] || null

        // Hauteur exacte
        let boxH = 30
        if ((isNon || isPartial) && reclamText) {
          const th = doc.heightOfString(reclamText, { width: W - 2*M - 95, fontSize: 7 })
          boxH = 30 + th + 10
        }

        // Vérifier espace
        ensureSpace(boxH + 3)

        // Dessiner
        doc.rect(M, Y, W - 2*M, boxH).fill(bgColor)
        doc.rect(M, Y, 3, boxH).fill(badgeCol)
        doc.fillColor(GRAY).fontSize(8).font('Helvetica').text('Q' + (qIdx+1), M+5, Y+9)
        doc.fillColor(DARK).fontSize(9).font('Helvetica')
           .text(question, M+20, Y+9, { width: W - 2*M - 115 })
        doc.roundedRect(W-M-60, Y+6, 55, 14, 3).fill(badgeCol)
        doc.fillColor('#fff').fontSize(8).font('Helvetica-Bold')
           .text(badge, W-M-60, Y+9, { width: 55, align: 'center' })
        doc.fillColor(badgeCol).fontSize(8).font('Helvetica-Bold')
           .text(qScore + '%', W-M-60, Y+20, { width: 55, align: 'center' })

        if ((isNon || isPartial) && reclamText) {
          const label = isNon ? 'Action :' : 'A ameliorer :'
          const color = isNon ? '#dc2626' : '#d97706'
          doc.fillColor(color).fontSize(7).font('Helvetica-Bold').text(label, M+20, Y+22)
          doc.fillColor(color).fontSize(7).font('Helvetica')
             .text(reclamText, M+20, Y+30, { width: W - 2*M - 90 })
        }

        Y += boxH + 3
      })

      Y += 8
    })

    // Footer dernière page
    drawFooter()

    // Ajouter footers sur toutes les pages via bufferPages
    const pageCount = doc.bufferedPageRange().count
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i)
    }

    doc.end()

  } catch (err) {
    console.error('Erreur PDF:', err.message)
    if (!res.headersSent) res.status(500).json({ error: err.message })
  }
})

module.exports = router