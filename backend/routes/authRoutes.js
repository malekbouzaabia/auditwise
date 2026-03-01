const express = require('express')
const router = express.Router()

const { register, login, getUsers } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)

// récupérer tous les utilisateurs
router.get('/users', getUsers)

module.exports = router