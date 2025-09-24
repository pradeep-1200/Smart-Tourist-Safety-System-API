const express = require('express');
const router = express.Router();
const { loginTourist, registerTourist, getTouristProfile } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', loginTourist);

// POST /api/auth/register
router.post('/register', registerTourist);

// GET /api/auth/profile/:id
router.get('/profile/:id', getTouristProfile);

module.exports = router;
