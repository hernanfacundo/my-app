require('dotenv').config();
const mongoose = require('mongoose');
const LearningPath = require('../../models/LearningPath');

const learningPaths = [
  {
    title: 'Domina tu estrés: ¡Que no te gane la ansiedad!',
    description: 'Aprende técnicas para controlar esos nervios que a veces te superan.',
    resources: []
  },
  {
    title: 'Cuando la tristeza pesa demasiado',
    description: 'Identifica cuándo necesitas ayuda y cómo salir adelante.',
    resources: []
  },
  {
    title: 'Eres suficiente: descubre tu verdadero valor',
    description: 'Ejercicios y afirmaciones para fortalecer tu autoestima.',
    resources: []
  },
  {
    title: 'La violencia no es normal: levanta tu voz',
    description: 'Encuentra formas seguras de actuar si vives violencia en casa.',
    resources: []
  },
  {
    title: 'Acepta tu cuerpo, cambia tu vida',
    description: 'Aprende a quererte y cuida tu cuerpo con hábitos saludables.',
    resources: []
  },
  {
    title: 'Recupera tus ganas de estudiar',
    description: 'Estrategias divertidas para motivarte y reencontrar tu propósito.',
    resources: []
  },
  {
    title: 'Adiós al pánico por los exámenes',
    description: 'Técnicas rápidas para vencer la ansiedad antes de cualquier prueba.',
    resources: []
  },
  {
    title: 'Concéntrate más, sufre menos',
    description: 'Consejos prácticos para mejorar tu atención y aprovechar el tiempo.',
    resources: []
  },
  {
    title: '¿Te hacen bullying? No estás solo',
    description: 'Aprende a enfrentarlo y frenarlo con seguridad.',
    resources: []
  },
  {
    title: '¿Problemas para aprender? Descubre cómo mejorar',
    description: 'Identifica posibles dificultades y encuentra soluciones efectivas.',
    resources: []
  }
];

async function seedLearningPaths() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Eliminar rutas de aprendizaje existentes
    await LearningPath.deleteMany({});
    console.log('Rutas de aprendizaje anteriores eliminadas');

    // Insertar nuevas rutas
    const result = await LearningPath.insertMany(learningPaths);
    console.log(`${result.length} rutas de aprendizaje insertadas correctamente`);

    await mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('Error durante el seeding:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedLearningPaths(); 