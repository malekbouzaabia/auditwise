require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const registerRoutes = require('./routes/registerRoutes')
const authRoutes = require('./routes/authRoutes')
const app = express()

// Connexion MongoDB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', registerRoutes)
app.use('/api/auth', authRoutes)
app.get('/', (req, res) => {
  res.send('🚀 API IFSentry active')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`)
})