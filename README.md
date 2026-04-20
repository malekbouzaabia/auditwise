# 🛡️ AuditWise — Plateforme d'Audit ISO 27001:2022

Application web IA d'auto-évaluation ISO 27001:2022

## Stack Technique
- **Frontend** : React + Vite
- **Backend** : Node.js + Express
- **Base de données** : MongoDB Atlas
- **IA** : Groq API (llama-3.3-70b-versatile)
- **PDF** : PDFKit
- **Auth** : JWT + MFA par email

## Installation locale

```bash
# Backend
cd backend
npm install
cp ../.env.example .env
# Remplir .env avec vos credentials
node server.js

# Frontend
cd ..
npm install
npm run dev
```

## Déploiement Render

1. Créez un compte sur [render.com](https://render.com)
2. Connectez votre repo GitHub
3. Créez un **Web Service** pour le backend :
   - Root Dir: `backend`
   - Build: `npm install`
   - Start: `node server.js`
4. Créez un **Static Site** pour le frontend :
   - Build: `npm install && npx vite build`
   - Publish: `dist`
5. Configurez les variables d'environnement

## Variables d'environnement

Voir `.env.example`

## Auteur
Projet PFE — AuditWise AI