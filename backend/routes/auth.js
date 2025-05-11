const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

router.post('/signup', async (req, res) => {
  console.log('Recibida solicitud POST /api/auth/signup:', req.body);
  const { email, password } = req.body;
  try {
    console.log('Colección usada por el modelo User:', User.collection.collectionName);
    console.log('Iniciando User.findOne para email:', email);
    const userExists = await User.findOne({ email });
    console.log('Resultado de User.findOne:', userExists);
    if (userExists) {
      console.log('Usuario ya existe:', email);
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    const user = new User({ email, password });
    console.log('Guardando nuevo usuario:', email);
    await user.save();
    console.log('Usuario guardado:', email);
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    console.log('Token generado para:', email);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Error en signup:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

router.post('/signin', async (req, res) => {
  console.log('Recibida solicitud POST /api/auth/signin:', req.body);
  const { email, password } = req.body;
  try {
    console.log('Colección usada por el modelo User:', User.collection.collectionName);
    console.log('Iniciando User.findOne para email:', email);
    const user = await User.findOne({ email });
    console.log('Resultado de User.findOne:', user);
    if (!user || !(await user.matchPassword(password))) {
      console.log('Credenciales inválidas para:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    console.log('Token generado para:', email);
    res.json({ token });
  } catch (error) {
    console.error('Error en signin:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;