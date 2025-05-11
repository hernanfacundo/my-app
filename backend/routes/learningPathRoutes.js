const express = require('express');
const router = express.Router();
const LearningPath = require('../models/LearningPath');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener todos los caminos de aprendizaje
router.get('/', authMiddleware, async (req, res) => {
  try {
    const paths = await LearningPath.find();
    res.json({ data: paths });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener caminos de aprendizaje' });
  }
});

module.exports = router;