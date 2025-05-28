require('dotenv').config();
const mongoose = require('mongoose');
const Mood = require('../models/Mood');
const User = require('../models/User');

const generateTestMoods = async () => {
  try {
    console.log('🚀 Generando datos de prueba para clima emocional...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar usuarios estudiantes para asignar moods
    const students = await User.find({ role: 'student' }).limit(20);
    console.log(`👥 Encontrados ${students.length} estudiantes`);
    
    if (students.length === 0) {
      console.log('⚠️  No hay estudiantes en la base de datos. Creando algunos...');
      
      // Crear estudiantes de prueba
      const testStudents = [];
      for (let i = 1; i <= 20; i++) {
        const student = new User({
          email: `estudiante${i}@test.com`,
          password: '$2b$10$hashedpassword', // Password hasheado dummy
          name: `Estudiante ${i}`,
          role: 'student'
        });
        testStudents.push(student);
      }
      
      await User.insertMany(testStudents);
      console.log('✅ Creados 20 estudiantes de prueba');
      
      // Actualizar la lista de estudiantes
      const newStudents = await User.find({ role: 'student' }).limit(20);
      students.push(...newStudents);
    }

    // Arrays de datos para generar moods variados
    const moods = ['Excelente', 'Muy bien', 'Bien', 'Más o menos', 'No tan bien'];
    const emotions = [
      'Feliz', 'Entusiasmado', 'Alegre', 'Contento', 'Satisfecho',
      'Optimista', 'Tranquilo', 'Neutral', 'Relajado', 'Confundido',
      'Inseguro', 'Cansado', 'Triste', 'Ansioso', 'Enojado'
    ];
    const places = [
      'Casa', 'Trabajo', 'Parque', 'Escuela', 'Gimnasio',
      'Calle', 'Café', 'Biblioteca', 'Tienda', 'Otro'
    ];
    const comments = [
      'Me siento bien hoy',
      'Fue un día interesante',
      'Estoy un poco cansado',
      'Todo va genial',
      'Necesito descansar',
      'Me gusta este lugar',
      'Día productivo',
      'Un poco estresado',
      'Muy contento',
      'Día normal'
    ];

    // Generar moods para hoy (suficientes para superar el mínimo de 15)
    const today = new Date();
    const moodsToCreate = [];
    
    // Generar entre 20-30 moods para hoy
    const numMoodsHoy = 20 + Math.floor(Math.random() * 11); // 20-30
    console.log(`📊 Generando ${numMoodsHoy} moods para hoy...`);
    
    for (let i = 0; i < numMoodsHoy; i++) {
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      const randomHour = Math.floor(Math.random() * 24);
      const randomMinute = Math.floor(Math.random() * 60);
      
      const moodTime = new Date(today);
      moodTime.setHours(randomHour, randomMinute, 0, 0);
      
      const mood = new Mood({
        userId: randomStudent._id,
        mood: moods[Math.floor(Math.random() * moods.length)],
        emotion: emotions[Math.floor(Math.random() * emotions.length)],
        place: places[Math.floor(Math.random() * places.length)],
        comment: comments[Math.floor(Math.random() * comments.length)],
        createdAt: moodTime
      });
      
      moodsToCreate.push(mood);
    }
    
    // Insertar todos los moods
    await Mood.insertMany(moodsToCreate);
    console.log(`✅ Creados ${moodsToCreate.length} moods de prueba para hoy`);
    
    // Mostrar resumen
    const totalMoodsHoy = await Mood.countDocuments({
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });
    
    console.log('\n📈 Resumen:');
    console.log(`   Total moods hoy: ${totalMoodsHoy}`);
    console.log(`   Mínimo requerido: 15`);
    console.log(`   Estado: ${totalMoodsHoy >= 15 ? '✅ Suficientes datos' : '❌ Insuficientes datos'}`);
    console.log('\n🎯 ¡Datos de prueba listos para probar el clima emocional!');
    
  } catch (error) {
    console.error('❌ Error generando datos de prueba:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
generateTestMoods(); 