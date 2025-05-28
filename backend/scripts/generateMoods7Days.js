require('dotenv').config();
const mongoose = require('mongoose');
const Mood = require('../models/Mood');
const User = require('../models/User');

const generateMoods7Days = async () => {
  try {
    console.log('📅 Generando datos de moods para los últimos 7 días...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar usuarios estudiantes
    const students = await User.find({ role: 'student' }).limit(20);
    console.log(`👥 Encontrados ${students.length} estudiantes`);
    
    if (students.length === 0) {
      console.log('⚠️  No hay estudiantes en la base de datos');
      return;
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

    // Generar moods para los últimos 7 días
    const today = new Date();
    const moodsToCreate = [];
    
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - dayOffset);
      
      // Generar entre 2-8 moods por día (variabilidad realista)
      const numMoodsDay = 2 + Math.floor(Math.random() * 7); // 2-8
      
      console.log(`📊 Generando ${numMoodsDay} moods para ${targetDate.toISOString().split('T')[0]}...`);
      
      for (let i = 0; i < numMoodsDay; i++) {
        const randomStudent = students[Math.floor(Math.random() * students.length)];
        const randomHour = 8 + Math.floor(Math.random() * 12); // Entre 8 AM y 8 PM
        const randomMinute = Math.floor(Math.random() * 60);
        
        const moodTime = new Date(targetDate);
        moodTime.setHours(randomHour, randomMinute, 0, 0);
        
        // Crear variabilidad en los moods por día de la semana
        let moodWeights;
        const dayOfWeek = targetDate.getDay();
        
        if (dayOfWeek === 1) { // Lunes - más bajo
          moodWeights = [0.05, 0.15, 0.35, 0.35, 0.10]; // Más "Más o menos" y "Bien"
        } else if (dayOfWeek === 5) { // Viernes - más alto
          moodWeights = [0.25, 0.30, 0.25, 0.15, 0.05]; // Más "Excelente" y "Muy bien"
        } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Fin de semana - mixto
          moodWeights = [0.20, 0.25, 0.30, 0.20, 0.05];
        } else { // Días normales
          moodWeights = [0.15, 0.25, 0.35, 0.20, 0.05];
        }
        
        // Seleccionar mood basado en pesos
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        let selectedMoodIndex = 0;
        
        for (let j = 0; j < moodWeights.length; j++) {
          cumulativeWeight += moodWeights[j];
          if (randomValue <= cumulativeWeight) {
            selectedMoodIndex = j;
            break;
          }
        }
        
        const mood = new Mood({
          userId: randomStudent._id,
          mood: moods[selectedMoodIndex],
          emotion: emotions[Math.floor(Math.random() * emotions.length)],
          place: places[Math.floor(Math.random() * places.length)],
          comment: comments[Math.floor(Math.random() * comments.length)],
          createdAt: moodTime
        });
        
        moodsToCreate.push(mood);
      }
    }
    
    // Insertar todos los moods
    await Mood.insertMany(moodsToCreate);
    console.log(`✅ Creados ${moodsToCreate.length} moods distribuidos en 7 días`);
    
    // Mostrar resumen por día
    console.log('\n📈 Resumen por día:');
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - dayOffset);
      const fechaStr = targetDate.toISOString().split('T')[0];
      
      const moodsDelDia = moodsToCreate.filter(mood => {
        const fechaMood = mood.createdAt.toISOString().split('T')[0];
        return fechaMood === fechaStr;
      });
      
      const diaSemana = targetDate.toLocaleDateString('es-ES', { weekday: 'long' });
      console.log(`   ${diaSemana} (${fechaStr}): ${moodsDelDia.length} registros`);
    }
    
    console.log('\n🎯 ¡Datos de prueba para tendencias de 7 días listos!');
    
  } catch (error) {
    console.error('❌ Error generando datos de 7 días:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
generateMoods7Days(); 