const express = require('express');
const router = express.Router();
const Emotion = require('../models/Emotion');
const Place = require('../models/Place');
const MoodEntry = require('../models/MoodEntry');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener todas las emociones
router.get('/emotions', authMiddleware, async (req, res) => {
  try {
    const emotions = await Emotion.find();
    res.json({ data: emotions });
  } catch (error) {
    console.error('Error al obtener emociones:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener todos los lugares
router.get('/places', authMiddleware, async (req, res) => {
  try {
    const places = await Place.find();
    res.json({ data: places });
  } catch (error) {
    console.error('Error al obtener lugares:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Crear un nuevo registro de estado de ánimo (movido de server.js)
router.post('/moods', authMiddleware, async (req, res) => {
  const { mood, emotion, place, comment } = req.body;
  const validMoods = ['Excelente', 'Muy bien', 'Bien', 'Más o menos', 'No tan bien'];

  if (!validMoods.includes(mood)) {
    return res.status(400).json({ message: 'Estado de ánimo inválido' });
  }

  try {
    const moodEntry = new MoodEntry({
      user: req.user.id,
      mood,
      emotion,
      place,
      comment,
    });
    await moodEntry.save();
    res.status(201).json({ message: 'Estado de ánimo guardado', data: moodEntry });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar el estado de ánimo', error });
  }
});

// Obtener historial de estados de ánimo (movido de server.js)
router.get('/moods', authMiddleware, async (req, res) => {
  try {
    const moods = await MoodEntry.find({ user: req.user.id }).sort({ date: -1 });
    res.json({ data: moods });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial', error });
  }
});

// Crear un nuevo registro de estado de ánimo (original de moodRoutes.js)
router.post('/entries', authMiddleware, async (req, res) => {
  const { mood, emotions, places, comment } = req.body;

  if (!mood || !['Feliz', 'Triste', 'Ansioso', 'Relajado', 'Enojado'].includes(mood)) {
    return res.status(400).json({ message: 'Estado de ánimo inválido' });
  }
  if (!emotions || emotions.length !== 3 || !places || places.length !== 2) {
    return res.status(400).json({ message: 'Debe seleccionar 3 emociones y 2 lugares' });
  }
  if (comment && comment.length > 150) {
    return res.status(400).json({ message: 'El comentario no puede exceder 150 caracteres' });
  }

  try {
    const moodEntry = new MoodEntry({
      userId: req.user.id,
      mood,
      emotions,
      places,
      comment: comment || '',
    });
    await moodEntry.save();
    res.status(201).json({ message: 'Registro guardado', data: moodEntry });
  } catch (error) {
    console.error('Error al guardar registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Obtener historial de los últimos 7 días (original de moodRoutes.js)
router.get('/entries', authMiddleware, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const entries = await MoodEntry.find({
      userId: req.user.id,
      date: { $gte: sevenDaysAgo },
    }).select('mood date');

    res.json({ data: entries });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;