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
const AlertAnalysisService = require('./services/alertAnalysis.service');
const Alert = require('./models/Alert');


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

app.post('/api/auth/signin', async (req, res) => {
  try {
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
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

app.post('/api/moods', authenticateToken, async (req, res) => {
  console.log('Solicitud recibida en /api/moods (POST) para userId:', req.user.id, 'con datos:', req.body);
  try {
    const { mood, emotion, place, comment } = req.body;
    if (!mood || !emotion || !place) {
      return res.status(400).json({ message: 'Mood, emoción y lugar son requeridos' });
    }

    console.log('Creando nuevo mood con datos:', {
      userId: req.user.id,
      mood,
      emotion,
      place,
      comment: comment || '',
      createdAt: new Date()
    });

    // Validar que los valores estén en los enums permitidos
    const validMoods = ['Excelente', 'Muy bien', 'Bien', 'Más o menos', 'No tan bien'];
    const validEmotions = [
      'Feliz', 'Entusiasmado', 'Alegre', 'Contento', 'Satisfecho',
      'Optimista', 'Tranquilo', 'Neutral', 'Relajado', 'Confundido',
      'Inseguro', 'Cansado', 'Triste', 'Ansioso', 'Enojado'
    ];
    const validPlaces = [
      'Casa', 'Trabajo', 'Parque', 'Escuela', 'Gimnasio',
      'Calle', 'Café', 'Biblioteca', 'Tienda', 'Otro'
    ];

    if (!validMoods.includes(mood)) {
      return res.status(400).json({ message: 'Estado de ánimo no válido' });
    }
    if (!validEmotions.includes(emotion)) {
      return res.status(400).json({ message: 'Emoción no válida' });
    }
    if (!validPlaces.includes(place)) {
      return res.status(400).json({ message: 'Lugar no válido' });
    }

    const newMood = new Mood({
      userId: req.user.id,
      mood,
      emotion,
      place,
      comment: comment || '',
      createdAt: new Date()
    });

    console.log('Mood creado, intentando guardar...');
    const savedMood = await newMood.save();
    console.log('Mood guardado exitosamente:', savedMood);
    
    // Intentar analizar emociones, pero no fallar si no se puede
    let analysis = null;
    try {
      if (process.env.CHATGPT_API_KEY) {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'Eres un asistente emocional empático para adolescentes.' },
              { 
                role: 'user', 
                content: `El usuario se siente ${mood} y ${emotion} mientras está en ${place}. ¿Podrías darle un mensaje breve y empático?` 
              }
            ],
            max_tokens: 150,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        analysis = response.data.choices[0].message.content.trim();
      } else {
        console.log('No se encontró CHATGPT_API_KEY en las variables de entorno');
        analysis = '¡Gracias por compartir cómo te sientes! ¿Te gustaría conversar sobre ello?';
      }
    } catch (analyzeError) {
      console.error('Error al analizar emociones (no crítico):', analyzeError);
      analysis = '¡Gracias por compartir cómo te sientes! ¿Te gustaría conversar sobre ello?';
    }
    
    res.status(201).json({ 
      message: 'Mood guardado', 
      data: savedMood,
      analysis 
    });
  } catch (error) {
    console.error('Error detallado al guardar mood:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error al guardar mood', 
      error: error.message,
      stack: error.stack 
    });
  }
});

// Otros endpoints existentes (moods, gratitudes, etc.)
app.get('/api/moods', authenticateToken, async (req, res) => {
  console.log('Solicitud recibida en /api/moods para userId:', req.user.id);
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
    // Cambiar "date" por "createdAt" para que coincida con el campo guardado en POST /api/moods
    const moods = await Mood.find({ userId, createdAt: { $gte: sevenDaysAgo } }).sort({ createdAt: 1 });
    res.json({ data: moods });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener moods', error: error.message });
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
    const userId   = req.user.id;
    const date     = new Date();
    const newGratitude = new GratitudeEntry({ userId, text, date });
    await newGratitude.save();
    
    // ——— Memoria episódica: últimas 5 entradas ———
    const recent = await GratitudeEntry
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);
    const summary = recent
      .map(g => `El ${g.date.toLocaleDateString()}: " ${g.text} "`)
      .reverse()
      .join('\n');

    // ——— Prompt para OpenAI ———
    const systemPrompt = `
Eres un mentor de gratitud para adolescentes.
Tu tarea: después de cada entrada de gratitud,
• Felicita al usuario por su práctica.
• Refleja brevemente su historial (ver abajo).
• Formula 2 o 3 preguntas abiertas para profundizar su gratitud.

Historial reciente:
${summary}
Usuario acaba de decir: " ${text} "
`;

    // Llamada a OpenAI
    const openaiRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system',  content: systemPrompt.trim() },
          { role: 'user',    content: text }
        ],
        max_tokens: 150,
        temperature: 0.7
      },
      { headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json'
      }}
    );
    const questions = openaiRes.data.choices[0].message.content.trim();

    // ——— Devolvemos la entrada  las preguntas ———
    return res.status(201).json({
      message:  'Gratitud guardada',
      data:     newGratitude,
      reflect:  questions
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar gratitud', error: error.message });
  }
});

app.post('/api/analyze-emotions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log('Iniciando análisis de emociones para usuario:', userId);

    const moods = await Mood.find({ 
      userId, 
      createdAt: { $gte: sevenDaysAgo } 
    }).sort({ createdAt: 1 });

    console.log('Moods encontrados:', moods.length);

    if (!moods || moods.length === 0) {
      return res.status(200).json({ 
        analysis: "No hay suficientes datos para analizar tus emociones. ¿Te gustaría conversar sobre cómo te sientes ahora?" 
      });
    }

    const moodList = moods.map(m => m.mood).join(', ');
    const emotionList = moods.map(m => m.emotion).join(', ');
    const placeList = moods.map(m => m.place).join(', ');

    const prompt = `Eres un experto en comunicación con adolescentes, psicología y pedagogía. 
    Tu misión es:
    1. Reflejar lo que el usuario expresa.
    2. Formular siempre preguntas abiertas para invitarlo a profundizar:
          "¿Qué significa eso para ti?"
          "¿Cómo viviste esa experiencia?"
          "¿Qué crees que desencadenó esa emoción?"
    3. Mantener un tono cálido y curioso, ofreciendo confianza y seguridad.
    En los últimos días, el usuario se sintió ${moodList} con las siguientes emociones ${emotionList} 
    y en los siguientes lugares ${placeList}. Elabora un resumen breve (1-2 frases) sobre el estado 
    de ánimo en los últimos días con esa información para presentarle al usuario. El mensaje debe 
    ser amistoso, empático, en segunda persona y adaptado a un adolescente.`;

    console.log('Enviando solicitud a OpenAI con prompt:', prompt);

    if (!process.env.CHATGPT_API_KEY) {
      console.log('No se encontró CHATGPT_API_KEY en las variables de entorno');
      return res.json({ 
        analysis: "¡Gracias por compartir tus emociones! Me encantaría saber más sobre cómo te sientes. ¿Te gustaría conversar sobre ello?" 
      });
    }

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Eres un asistente emocional empático para adolescentes.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!openaiResponse.data || !openaiResponse.data.choices || !openaiResponse.data.choices[0] || !openaiResponse.data.choices[0].message) {
      throw new Error('Respuesta inválida de OpenAI');
    }

    let analysis = openaiResponse.data.choices[0].message.content.trim();
    if (!analysis.endsWith('?')) {
      analysis += ' ¿Te gustaría conversar sobre cómo te sientes?';
    }

    return res.json({ analysis });

  } catch (error) {
    console.error('Error completo en /api/analyze-emotions:', error);
    return res.status(200).json({ 
      analysis: "¡Gracias por compartir tus emociones! Me encantaría saber más sobre cómo te sientes. ¿Te gustaría conversar sobre ello?"
    });
  }
});

// Agregar después de los otros endpoints, antes de app.listen

app.post('/api/chatbot', authenticateToken, async (req, res) => {
const userMessage = req.body.message;

// 1) Memoria episódica: últimos 3 moods
const recentMoods = await Mood
  .find({ userId: req.user.id })
  .sort({ createdAt: -1 })
  .limit(3);
const moodSummary = recentMoods.map(m =>
  `El ${m.createdAt.toLocaleDateString()}: nivel ${m.mood}, emociones: ${m.emotion}.`
).join('\n');

// 2) Memoria de conversación previa
let history = [];
const lastConv = await ChatConversation
  .findOne({ userId: req.user.id })
  .sort({ createdAt: -1 });
if (lastConv) {
  history = lastConv.messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
}

// 3) Arma el prompt completo
const systemPrompt = `
Eres un asistente emocional para adolescentes.
Usuario: ${req.user.name} (${req.user.role}).
Historial reciente:
${moodSummary}
`;
const messages = [
  { role: 'system', content: systemPrompt.trim() },
  ...history,
  { role: 'user', content: userMessage }
];

// Reemplaza tu llamada original a OpenAI por esta:
   const openaiRes = await axios.post(
     'https://api.openai.com/v1/chat/completions',
     { model: 'gpt-3.5-turbo', messages, max_tokens: 200 },
     { headers: { Authorization: `Bearer ${process.env.CHATGPT_API_KEY}` } }
   );
const botText = openaiRes.data.choices[0].message.content.trim();

// 4) Guarda o actualiza la conversación
if (lastConv) {
  lastConv.messages.push(
    { content: userMessage, sender:'user',  timestamp:new Date() },
    { content: botText,      sender:'bot',   timestamp:new Date() }
  );
  await lastConv.save();
} else {
  await new ChatConversation({
    userId: req.user.id,
    messages: [
      { content:userMessage, sender:'user',  timestamp:new Date() },
      { content:botText,      sender:'bot',   timestamp:new Date() }
    ]
  }).save();
}

return res.json({ success:true, response: botText });
 });

app.post('/api/chat-conversations', authenticateToken, async (req, res) => {
  try {
    const { userId, messages } = req.body;
    
    // Validar que messages sea un array
    if (!Array.isArray(messages)) {
      return res.status(400).json({ 
        message: 'El campo messages debe ser un array' 
      });
    }

    // Validar la estructura de cada mensaje
    const validMessages = messages.every(msg => 
      msg.content && 
      typeof msg.content === 'string' &&
      msg.sender && 
      ['user', 'bot'].includes(msg.sender) &&
      msg.timestamp
    );

    if (!validMessages) {
      return res.status(400).json({ 
        message: 'Formato de mensajes inválido. Cada mensaje debe tener content (string), sender (user|bot) y timestamp' 
      });
    }

    const newConversation = new ChatConversation({ 
      userId: req.user.id, // Usar el ID del token en lugar del enviado
      messages 
    });
    
    await newConversation.save();
    res.status(201).json({ 
      message: 'Conversación guardada', 
      data: newConversation 
    });
  } catch (error) {
    console.error('Error al guardar conversación:', error);
    res.status(500).json({ 
      message: 'Error al guardar conversación', 
      error: error.message 
    });
  }
});

// Crear una nueva clase
app.post('/api/classes', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'El nombre es requerido' });

    // Generar código único (6 caracteres alfanuméricos)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newClass = new Class({
      name,
      code,
      docenteId: req.user.id
    });
    await newClass.save();
    return res.status(201).json(newClass);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al crear clase' });
  }
});

// Listar clases propias (docente)
app.get('/api/classes', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    const classes = await Class.find({ docenteId: req.user.id });
    return res.json(classes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener clases' });
  }
});

// Alumno ingresa código para unirse
app.post('/api/classes/:code/join', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Solo alumnos pueden unirse' });
    }
    const cls = await Class.findOne({ code: req.params.code });
    if (!cls) {
      return res.status(404).json({ message: 'Código de clase inválido' });
    }
    // Crear la pertenencia (o ignorar si ya existe)
    const membership = new Membership({
      classId: cls._id,
      alumnoId: req.user.id
    });
    await membership.save();
    return res.json({ message: 'Te uniste a la clase', class: cls });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Ya estás en esta clase' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Error al unirse a la clase' });
  }
});

// Listar clases a las que el alumno está inscrito
app.get('/api/classes/joined', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    const memberships = await Membership.find({ alumnoId: req.user.id })
      .populate('classId');
    const classes = memberships.map(m => m.classId);
    return res.json(classes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener tus clases' });
  }
});

// Obtener análisis de una clase específica
app.get('/api/classes/:classId/analysis', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const classId = req.params.classId;
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // 1. Obtener todos los alumnos de la clase
    const memberships = await Membership.find({ classId })
      .populate('alumnoId');
    const studentIds = memberships.map(m => m.alumnoId._id);

    // 2. Obtener datos de los últimos 2 días
    const moods = await Mood.find({
      userId: { $in: studentIds },
      createdAt: { $gte: twoDaysAgo }
    }).sort({ createdAt: -1 });

    const gratitudes = await GratitudeEntry.find({
      userId: { $in: studentIds },
      date: { $gte: twoDaysAgo }
    }).sort({ date: -1 });

    // 3. Análisis de estados de ánimo
    const moodAnalysis = {
      total: moods.length,
      byMood: {},
      byEmotion: {},
      byPlace: {}
    };

    moods.forEach(mood => {
      moodAnalysis.byMood[mood.mood] = (moodAnalysis.byMood[mood.mood] || 0) + 1;
      moodAnalysis.byEmotion[mood.emotion] = (moodAnalysis.byEmotion[mood.emotion] || 0) + 1;
      moodAnalysis.byPlace[mood.place] = (moodAnalysis.byPlace[mood.place] || 0) + 1;
    });

    // 4. Análisis de gratitud
    const gratitudeAnalysis = {
      total: gratitudes.length,
      studentsWithGratitude: new Set(gratitudes.map(g => g.userId.toString())).size
    };

    // 5. Obtener alertas activas
    const activeAlerts = await Alert.find({
      classId,
      status: { $in: ['NEW', 'REVIEWED'] },
      createdAt: { $gte: twoDaysAgo }
    }).populate('studentId', 'name');

    // 6. Ejecutar análisis de alertas en background
    setImmediate(async () => {
      try {
        await AlertAnalysisService.analyzeClass(classId);
      } catch (error) {
        console.error('Error en análisis asíncrono:', error);
      }
    });

    // 7. Generar insights con OpenAI incluyendo alertas
    const analysisPrompt = `
Eres un experto en psicología educativa y bienestar estudiantil. Analiza los siguientes datos de una clase en los últimos 2 días:

Estados de ánimo registrados: ${moods.length}
Distribución de estados: ${JSON.stringify(moodAnalysis.byMood)}
Emociones predominantes: ${JSON.stringify(moodAnalysis.byEmotion)}
Lugares frecuentes: ${JSON.stringify(moodAnalysis.byPlace)}
Entradas de gratitud: ${gratitudeAnalysis.total}
Estudiantes que practican gratitud: ${gratitudeAnalysis.studentsWithGratitude} de ${studentIds.length}
Alertas activas: ${activeAlerts.length}

Alertas destacadas:
${activeAlerts.map(alert => `- ${alert.severity} - ${alert.description} (${alert.studentId.name})`).join('\n')}

Por favor, proporciona:
1. Un resumen breve del estado emocional general de la clase
2. Aspectos positivos a destacar
3. Áreas que requieren atención inmediata
4. 2-3 recomendaciones específicas para el docente
5. Sugerencias de actividades para mejorar el bienestar del grupo

Mantén un tono profesional pero empático, y enfócate en acciones prácticas.`;

    let insights = "No hay suficientes datos para generar un análisis detallado.";
    
    if (moods.length > 0 || gratitudes.length > 0) {
      try {
        const openaiResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'Eres un experto en psicología educativa y bienestar estudiantil.' },
              { role: 'user', content: analysisPrompt }
            ],
            max_tokens: 500,
            temperature: 0.7
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.CHATGPT_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        insights = openaiResponse.data.choices[0].message.content.trim();
      } catch (error) {
        console.error('Error al generar insights:', error);
      }
    }

    res.json({
      classSize: studentIds.length,
      moodAnalysis,
      gratitudeAnalysis,
      alerts: activeAlerts,
      insights
    });

  } catch (error) {
    console.error('Error al analizar la clase:', error);
    res.status(500).json({ 
      message: 'Error al analizar la clase', 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));