require('dotenv').config();
const mongoose = require('mongoose');
const {
  PERFILES_ALUMNOS,
  ESTADOS_ANIMO,
  NOMBRES_ALUMNOS,
  TEMAS_GRATITUD,
  DISTRIBUCIONES_PERFILES,
  PLANTILLAS_GRATITUD,
  LUGARES,
  EMOCIONES
} = require('./data');

// Importar modelos
const User = require('../../models/User');
const Class = require('../../models/Class');
const Mood = require('../../models/Mood');
const GratitudeEntry = require('../../models/GratitudeEntry');

// Utilidades
const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const weightedRandom = (options) => {
  const weights = Object.values(options);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * total;
  
  for (const [option, weight] of Object.entries(options)) {
    random -= weight;
    if (random <= 0) return option;
  }
  return Object.keys(options)[0];
};

// Función para generar datos de un alumno
const generateStudentData = async (student, profile, startDate, endDate) => {
  const profileData = DISTRIBUCIONES_PERFILES[profile];
  const currentDate = new Date(startDate);
  const moodEntries = [];
  const gratitudeEntries = [];

  while (currentDate <= endDate) {
    // Generar 1-3 estados de ánimo por día
    const entriesForDay = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < entriesForDay; i++) {
      const mood = weightedRandom(profileData.estadosAnimo);
      const timestamp = getRandomDate(
        new Date(currentDate.setHours(8, 0, 0)),
        new Date(currentDate.setHours(16, 0, 0))
      );

      // Seleccionar una emoción relacionada con el estado de ánimo
      const possibleEmotions = EMOCIONES[mood] || ['Neutral'];
      const emotion = getRandomElement(possibleEmotions);

      moodEntries.push({
        userId: student._id,
        mood,
        emotion,
        place: getRandomElement(LUGARES),
        comment: getRandomElement(profileData.comentariosBase),
        createdAt: timestamp
      });
    }

    // Generar entrada de gratitud (según frecuencia del perfil)
    if (Math.random() < profileData.frecuenciaGratitud) {
      const tema = getRandomElement(TEMAS_GRATITUD);
      const plantilla = PLANTILLAS_GRATITUD[tema] 
        ? getRandomElement(PLANTILLAS_GRATITUD[tema])
        : `Agradecido por ${tema}`;

      gratitudeEntries.push({
        userId: student._id,
        text: plantilla,
        date: new Date(currentDate)
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Insertar entradas en la base de datos
  await Mood.insertMany(moodEntries);
  await GratitudeEntry.insertMany(gratitudeEntries);
};

// Función principal de seeding
async function seed() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Limpiar colecciones existentes
    await Promise.all([
      User.deleteMany({}),
      Class.deleteMany({}),
      Mood.deleteMany({}),
      GratitudeEntry.deleteMany({})
    ]);
    console.log('Colecciones limpiadas');

    // Crear profesor
    const teacher = await User.create({
      name: 'Profesor Ejemplo',
      email: 'profesor@ejemplo.com',
      password: '12345',
      role: 'teacher'
    });

    // Crear clase
    const clase = await Class.create({
      name: '6to Grado A',
      docenteId: teacher._id,
      code: 'GRADO6A-2024',
      year: new Date().getFullYear()
    });

    // Distribuir perfiles entre alumnos
    const perfiles = [
      ...Array(8).fill(PERFILES_ALUMNOS.ESTABLE),
      ...Array(6).fill(PERFILES_ALUMNOS.FLUCTUANTE),
      ...Array(4).fill(PERFILES_ALUMNOS.ATENCION_INMEDIATA),
      ...Array(2).fill(PERFILES_ALUMNOS.BAJO_ENGAGEMENT)
    ];

    // Crear alumnos y sus datos
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14); // 2 semanas atrás
    const endDate = new Date();

    for (let i = 0; i < NOMBRES_ALUMNOS.length; i++) {
      const student = await User.create({
        name: NOMBRES_ALUMNOS[i],
        email: `alumno${i + 1}@ejemplo.com`,
        password: '12345',
        role: 'student',
        classId: clase._id
      });

      const profile = perfiles[i] || PERFILES_ALUMNOS.ESTABLE;
      await generateStudentData(student, profile, startDate, endDate);
      console.log(`Datos generados para ${student.name}`);
    }

    console.log('Seeding completado exitosamente');
  } catch (error) {
    console.error('Error durante el seeding:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Ejecutar seeding
seed(); 