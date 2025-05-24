require('dotenv').config();
//require('dns').setDefaultResultOrder('ipv4first'); // <— nuevo
console.log('JWT_SECRET:', process.env.JWT_SECRET);
const express = require('express');
const cors = require('cors'); // <-- Agrega esta línea
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const Mood = require('./models/Mood');
const ChatConversation = require('./models/ChatConversation');
const User = require('./models/User');
const LearningPath = require('./models/LearningPath');
const GratitudeEntry = require('./models/GratitudeEntry');
const Class      = require('./models/Class');
const Membership = require('./models/Membership');


const app = express();
app.use(cors()); // <-- Aplica CORS a todas las rutas
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};