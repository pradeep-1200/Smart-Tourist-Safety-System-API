const express = require('express');
const router = express.Router();
const { createPanicAlert, getTouristAlerts } = require('../controllers/alertController');

// POST /api/alerts/panic
router.post('/panic', createPanicAlert);

// GET /api/alerts/:tourist_id
router.get('/:tourist_id', getTouristAlerts);

module.exports = router;
