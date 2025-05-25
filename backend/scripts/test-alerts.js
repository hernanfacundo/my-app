require('dotenv').config();
const mongoose = require('mongoose');
const Mood = require('../models/Mood');
const GratitudeEntry = require('../models/GratitudeEntry');
const User = require('../models/User');

async function simularComportamientoPreocupante() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Obtener un alumno aleatorio para la prueba
    const alumno = await User.findOne({ role: 'student' });
    console.log(`Simulando comportamiento para: ${alumno.name}`);

    // Caso 1: Patrón Emocional Negativo (Últimas 24 horas)
    const estadosNegativosHoy = [
      {
        userId: alumno._id,
        mood: 'Triste',
        emotion: 'Triste',
        place: 'Escuela',
        comment: 'No quiero venir más a la escuela',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 horas atrás
      },
      {
        userId: alumno._id,
        mood: 'Ansioso',
        emotion: 'Ansioso',
        place: 'Escuela',
        comment: 'Me siento muy presionado',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4 horas atrás
      },
      {
        userId: alumno._id,
        mood: 'Enojado',
        emotion: 'Enojado',
        place: 'Escuela',
        comment: 'Todo me sale mal',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 horas atrás
      }
    ];

    await Mood.insertMany(estadosNegativosHoy);
    console.log('Estados de ánimo negativos registrados');

    // Caso 2: Cambios Bruscos (Últimos 3 días)
    const cambiosBruscos = [
      {
        userId: alumno._id,
        mood: 'Feliz',
        emotion: 'Feliz',
        place: 'Escuela',
        comment: '¡Todo es maravilloso!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 día atrás
      },
      {
        userId: alumno._id,
        mood: 'Triste',
        emotion: 'Triste',
        place: 'Escuela',
        comment: 'Nada tiene sentido',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36) // 1.5 días atrás
      },
      {
        userId: alumno._id,
        mood: 'Excelente',
        emotion: 'Entusiasmado',
        place: 'Escuela',
        comment: '¡Me siento imparable!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 días atrás
      },
      {
        userId: alumno._id,
        mood: 'Ansioso',
        emotion: 'Ansioso',
        place: 'Escuela',
        comment: 'No puedo con esto',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60) // 2.5 días atrás
      }
    ];

    await Mood.insertMany(cambiosBruscos);
    console.log('Cambios bruscos de humor registrados');

    // Ausencia de gratitud
    // Eliminar entradas de gratitud recientes para simular falta de práctica
    await GratitudeEntry.deleteMany({
      userId: alumno._id,
      date: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 72) } // últimas 72 horas
    });
    console.log('Entradas de gratitud eliminadas');

    console.log(`
    Simulación completada para ${alumno.name}:
    - Email: ${alumno.email}
    - Contraseña: 12345

    Patrones simulados:
    1. Estados de ánimo negativos consecutivos en las últimas 24 horas
    2. Cambios bruscos de humor en los últimos 3 días
    3. Ausencia de práctica de gratitud

    Para probar:
    1. Inicia sesión como profesor (profesor@ejemplo.com / 12345)
    2. Revisa las alertas en el dashboard
    3. Deberías ver alertas de:
       - Patrón emocional negativo (ALTA prioridad)
       - Cambios bruscos de humor (MEDIA prioridad)
       - Falta de práctica de gratitud (BAJA prioridad)
    `);

  } catch (error) {
    console.error('Error durante la simulación:', error);
  } finally {
    await mongoose.connection.close();
  }
}

simularComportamientoPreocupante(); 