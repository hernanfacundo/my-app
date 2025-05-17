require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const Mood = require('./models/Mood');
const ChatConversation = require('./models/ChatConversation');
const User = require('./models/User');
const LearningPath = require('./models/LearningPath');
const GratitudeEntry = require('./models/GratitudeEntry');

const app = express();
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

app.post('/api/auth/signin', async (req, res) => {
  try {
    console.log('Datos recibidos en /api/auth/signin:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      console.log('Faltan email o contraseña');
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    console.log('Usuario encontrado:', user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Contraseña incorrecta para:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('Token generado:', token);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error en /api/auth/signin:', error);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    console.log('Datos recibidos en /api/auth/signup:', req.body);
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, contraseña y nombre son requeridos' });
    }

    const validRoles = ['student', 'teacher', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'student';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Contraseña hasheada:', hashedPassword);

    const user = new User({ email, password: hashedPassword, name, role: userRole });
    const savedUser = await user.save(); // Usa una variable para el usuario guardado
    console.log('Usuario guardado:', savedUser);

    if (savedUser.password !== hashedPassword) {
      console.error('Error: el hash guardado no coincide con el hasheado:', savedUser.password);
    }

    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email, role: savedUser.role, name: savedUser.name },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({ token });
  } catch (error) {
    console.error('Error en /api/auth/signup:', error);
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
});

// Otros endpoints existentes (moods, gratitudes, etc.)
app.get('/api/moods', authenticateToken, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(moods);
  } catch (error) {
    console.error('Error al obtener historial de moods:', error);
    res.status(500).json({ message: 'Error al obtener historial de moods', error: error.message });
  }
});

app.get('/api/moods/last-seven-days', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const moods = await Mood.find({ userId, date: { $gte: sevenDaysAgo } }).sort('date');
    res.json({ data: moods });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener moods', error });
  }
});

app.get('/api/learning-paths', authenticateToken, async (req, res) => {
  try {
    const learningPaths = await LearningPath.find();
    res.json({ data: learningPaths });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener learning paths', error: error.message });
  }
});

app.get('/api/gratitude/last-seven-days', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const gratitudes = await GratitudeEntry.find({ userId, date: { $gte: sevenDaysAgo } }).sort('date');
    res.json({ data: gratitudes });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener gratitudes', error: error.message });
  }
});

app.post('/api/gratitude', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;
    const date = new Date();
    const newGratitude = new GratitudeEntry({ userId, text, date });
    await newGratitude.save();
    res.status(201).json({ message: 'Gratitud guardada', data: newGratitude });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar gratitud', error: error.message });
  }
});

app.post('/api/analyze-emotions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const moods = await Mood.find({ userId, date: { $gte: sevenDaysAgo } }).sort('date');

    const moodList = moods.map(m => m.mood).join(', ');
    const emotionList = moods.map(m => m.emotion).join(', ');
    const placeList = moods.map(m => m.place).join(', ');

    const prompt = `Eres un experto en comunicación con adolescentes, psicología y pedagogía. En los últimos días, el usuario se sintió ${moodList} con las siguientes emociones ${emotionList} y en los siguientes lugares ${placeList}. Elabora un resumen breve (1-2 frases) sobre el estado de ánimo en los últimos días con esa información para presentarle al usuario. El mensaje debe ser amistoso, empático, en segunda persona (el usuario recibirá el mensaje directamente) y adaptado a un adolescente. Usa un tono cercano y motivador, evitando juicios o asumir emociones positivas/negativas de forma predeterminada. Termina el mensaje con 'Deseas conversar sobre lo que te está pasando?' si encaja con el contexto.`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 50,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let analysis = response.data.choices[0].message.content.trim();
    if (!analysis.endsWith('Deseas conversar sobre lo que te está pasando?')) {
      analysis += ' Deseas conversar sobre lo que te está pasando?';
    }

    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ message: 'Error al analizar emociones', error: error.response?.data || error.message });
  }
});

app.post('/api/chatbot', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Eres un chatbot empático que ayuda con el bienestar emocional en español.' },
          { role: 'user', content: message },
        ],
        max_tokens: 150,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const botResponse = response.data.choices[0].message.content.trim();
    res.json({ response: botResponse });
  } catch (error) {
    res.status(500).json({ message: 'Error al conectar con el chatbot', error: error.response?.data || error.message });
  }
});

app.post('/api/chat-conversations', authenticateToken, async (req, res) => {
  try {
    const { userId, messages } = req.body;
    const newConversation = new ChatConversation({ userId, messages });
    await newConversation.save();
    res.status(201).json({ message: 'Conversación guardada', data: newConversation });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar conversación', error });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));