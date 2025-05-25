const express = require('express');
const router = express.Router();
const PersonalAlertController = require('../controllers/personalAlert.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Ruta protegida que requiere autenticación
router.get('/analysis', authMiddleware, PersonalAlertController.getPersonalAnalysis);

module.exports = router; 