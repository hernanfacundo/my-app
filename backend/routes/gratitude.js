const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const GratitudeEntry = require('../models/GratitudeEntry');
const BadgeService = require('../services/badgeService');


console.log('*** Rutas de gratitud cargadas - Versión de depuración ***');

// Middleware para verificar el token
const authenticateToken = (req, res, next) => {
  console.log('Middleware authenticateToken ejecutado');
  const authHeader = req.headers['authorization'];
  console.log('Encabezado Authorization:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    console.log('Token no proporcionado');
    return res.status(401).json({ message: 'Token requerido' });
  }

  console.log('Token extraído:', token);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Error al verificar el token:', err.message);
      return res.status(403).json({ message: 'Token inválido' });
    }
    console.log('Token verificado, usuario:', user);
    req.user = user;
    next();
  });
};

// POST: Guardar una entrada de gratitud
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Ruta POST /api/gratitude ejecutada');
    console.log('Cuerpo de la solicitud:', req.body);
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ message: 'El mensaje de gratitud no puede estar vacío' });
    }

    const userId = req.user?.id || req.user?.userId || req.user?._id;
    if (!userId) {
      console.log('req.user no contiene un ID válido:', req.user);
      return res.status(403).json({ message: 'No se pudo obtener el ID del usuario del token' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('Fecha generada:', today);

    const gratitudeText = message.trim();
    console.log('Texto de gratitud:', gratitudeText);

    const gratitudeEntry = new GratitudeEntry({
      userId: userId,
      text: gratitudeText,
      date: today,
    });

    console.log('Entrada a guardar:', gratitudeEntry.toObject());
    await gratitudeEntry.save();
    res.status(201).json({ message: 'Entrada guardada', data: gratitudeEntry });
    await BadgeService.checkAndUnlockBadges(req.user.id, 'gratitude');
  } catch (error) {
    console.error('Error al guardar la gratitud:', error);
    res.status(500).json({ message: 'Error al guardar la entrada de gratitud', error });
  }
});

// GET: Obtener las entradas de los últimos 7 días
router.get('/last-seven-days', authenticateToken, async (req, res) => {
  try {
    console.log('Ruta GET /api/gratitude/last-seven-days ejecutada');
    const userId = req.user?.id || req.user?.userId || req.user?._id;
    if (!userId) {
      console.log('req.user no contiene un ID válido:', req.user);
      return res.status(403).json({ message: 'No se pudo obtener el ID del usuario del token' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const entries = await GratitudeEntry.find({
      userId: userId,
      date: { $gte: sevenDaysAgo },
    })
      .sort({ date: -1 })
      .limit(7);

    res.status(200).json({ data: entries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el historial' });
  }
});

module.exports = router;