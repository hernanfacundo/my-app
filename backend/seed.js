const mongoose = require('mongoose');
const LearningPath = require('./models/LearningPath');
require('dotenv').config();

if (!process.env.MONGODB_URI) {
  console.error('Error: MONGO_URI no está definido en el archivo .env');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Conectado a MongoDB');
    await LearningPath.deleteMany({});
    await LearningPath.insertMany([
      {
        title: 'Mindfulness Básico',
        description: 'Aprende técnicas de meditación para reducir el estrés.',
        resources: [
          { type: 'video', url: 'http://192.168.0.231:3000/learning-paths/mindfulness-video1.mp4', title: 'Introducción al Mindfulness' },
          { type: 'pdf', url: 'http://192.168.0.231:3000/learning-paths/mindfulness-doc1.pdf', title: 'Guía de Meditación' },
        ],
      },
      {
        title: 'Gestión Emocional',
        description: 'Herramientas para entender y manejar tus emociones.',
        resources: [
          { type: 'audio', url: 'http://192.168.0.231:3000/learning-paths/mindfulness-audio1.mp3', title: 'Meditación Guiada' },
        ],
      },
      {
        title: 'Productividad Personal',
        description: 'Estrategias para optimizar tu tiempo y energía.',
        resources: [
          { type: 'video', url: 'http://192.168.0.231:3000/learning-paths/productivity-video1.mp4', title: 'Planificación Efectiva' },
        ],
      },
    ]);
    console.log('Caminos de aprendizaje insertados');
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error('Error:', err);
    mongoose.connection.close();
  });