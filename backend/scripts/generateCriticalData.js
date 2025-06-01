require('dotenv').config();
const mongoose = require('mongoose');
const Mood = require('../models/Mood');
const User = require('../models/User');
const Class = require('../models/Class');

const generateCriticalData = async () => {
  try {
    console.log('🚨 GENERANDO DATOS CRÍTICOS PARA DIRECTIVOS Y DOCENTES');
    console.log('=' .repeat(60));
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // 1. Buscar todas las clases existentes
    const clases = await Class.find({}).populate('docenteId', 'name');
    console.log(`📚 Encontradas ${clases.length} clases`);
    
    if (clases.length === 0) {
      console.log('⚠️  No hay clases en el sistema. Creando datos de prueba...');
      
      // Crear profesor si no existe
      let profesor = await User.findOne({ role: 'teacher' });
      if (!profesor) {
        profesor = await User.create({
          name: 'Profesor Ejemplo',
          email: 'profesor@ejemplo.com',
          password: '$2b$10$hashedpassword',
          role: 'teacher'
        });
        console.log('✅ Profesor creado');
      }
      
      // Crear clases de ejemplo
      const clasesEjemplo = [
        { name: '6to Grado A', code: 'GRADO6A-2024' },
        { name: 'Matemáticas 3', code: 'MAT3-2024' },
        { name: 'Ciencias Naturales', code: 'CIEN-2024' }
      ];
      
      for (const claseData of clasesEjemplo) {
        const clase = await Class.create({
          ...claseData,
          docenteId: profesor._id
        });
        clases.push(clase);
      }
      console.log(`✅ Creadas ${clasesEjemplo.length} clases de ejemplo`);
    }

    // 2. Para cada clase, buscar o crear estudiantes
    let totalStudents = 0;
    const estudiantesPorClase = {};
    
    for (const clase of clases) {
      const estudiantes = await User.find({ 
        classId: clase._id,
        role: 'student'
      });
      
      if (estudiantes.length === 0) {
        console.log(`👥 Creando estudiantes para ${clase.name}...`);
        
        // Crear 8-12 estudiantes por clase
        const numeroEstudiantes = 8 + Math.floor(Math.random() * 5);
        const nuevosEstudiantes = [];
        
        for (let i = 0; i < numeroEstudiantes; i++) {
          const estudiante = await User.create({
            name: `Estudiante ${clase.code}-${i + 1}`,
            email: `estudiante${clase.code.toLowerCase()}-${i + 1}@ejemplo.com`,
            password: '$2b$10$hashedpassword',
            role: 'student',
            classId: clase._id
          });
          nuevosEstudiantes.push(estudiante);
        }
        
        estudiantesPorClase[clase._id] = nuevosEstudiantes;
        totalStudents += nuevosEstudiantes.length;
        console.log(`✅ Creados ${nuevosEstudiantes.length} estudiantes para ${clase.name}`);
      } else {
        estudiantesPorClase[clase._id] = estudiantes;
        totalStudents += estudiantes.length;
        console.log(`📋 ${clase.name}: ${estudiantes.length} estudiantes existentes`);
      }
    }
    
    console.log(`\n👥 Total de estudiantes en el sistema: ${totalStudents}`);

    // 3. Generar datos emocionales distribuidos por curso
    const criticalMoods = ['No tan bien', 'Más o menos'];
    const criticalEmotions = ['Triste', 'Ansioso', 'Enojado', 'Inseguro', 'Cansado'];
    const normalMoods = ['Excelente', 'Muy bien', 'Bien'];
    const normalEmotions = ['Feliz', 'Contento', 'Optimista', 'Tranquilo', 'Satisfecho'];
    const places = ['Casa', 'Escuela', 'Calle', 'Otro'];
    
    const criticalComments = [
      'Me siento mal',
      'No pude dormir bien',
      'Estoy preocupado por todo',
      'Me duele la cabeza',
      'No tengo ganas de nada',
      'Todo me sale mal',
      'Me siento solo',
      'Estoy muy estresado',
      'No entiendo nada en clase',
      'Mis papás están peleando mucho'
    ];
    
    const normalComments = [
      'Todo bien',
      'Buen día',
      'Me siento genial',
      'Día normal',
      'Contento con mi día'
    ];

    const moodsToCreate = [];
    const today = new Date();
    
    console.log('\n🚨 Generando datos por curso...');
    
    for (const clase of clases) {
      const estudiantes = estudiantesPorClase[clase._id];
      const nombreClase = clase.name;
      
      console.log(`\n📚 Procesando ${nombreClase} (${estudiantes.length} estudiantes):`);
      
      // Asegurar al menos 5 registros por curso (3 mínimo + 2 extra)
      const registrosPorCurso = Math.max(5, Math.floor(estudiantes.length * 0.4));
      const registrosCriticos = Math.floor(registrosPorCurso * 0.3); // 30% críticos
      const registrosNormales = registrosPorCurso - registrosCriticos;
      
      // Generar registros críticos para este curso
      for (let i = 0; i < registrosCriticos; i++) {
        const randomStudent = estudiantes[Math.floor(Math.random() * estudiantes.length)];
        const randomHour = 8 + Math.floor(Math.random() * 10);
        const randomMinute = Math.floor(Math.random() * 60);
        
        const moodTime = new Date(today);
        moodTime.setHours(randomHour, randomMinute, 0, 0);
        
        const mood = new Mood({
          userId: randomStudent._id,
          mood: criticalMoods[Math.floor(Math.random() * criticalMoods.length)],
          emotion: criticalEmotions[Math.floor(Math.random() * criticalEmotions.length)],
          place: places[Math.floor(Math.random() * places.length)],
          comment: criticalComments[Math.floor(Math.random() * criticalComments.length)],
          createdAt: moodTime
        });
        
        moodsToCreate.push(mood);
        console.log(`   🔴 ${randomStudent.name}: ${mood.mood} - ${mood.emotion}`);
      }
      
      // Generar registros normales para este curso
      for (let i = 0; i < registrosNormales; i++) {
        const randomStudent = estudiantes[Math.floor(Math.random() * estudiantes.length)];
        const randomHour = 7 + Math.floor(Math.random() * 12);
        const randomMinute = Math.floor(Math.random() * 60);
        
        const moodTime = new Date(today);
        moodTime.setHours(randomHour, randomMinute, 0, 0);
        
        const mood = new Mood({
          userId: randomStudent._id,
          mood: normalMoods[Math.floor(Math.random() * normalMoods.length)],
          emotion: normalEmotions[Math.floor(Math.random() * normalEmotions.length)],
          place: places[Math.floor(Math.random() * places.length)],
          comment: normalComments[Math.floor(Math.random() * normalComments.length)],
          createdAt: moodTime
        });
        
        moodsToCreate.push(mood);
      }
      
      console.log(`   ✅ ${nombreClase}: ${registrosCriticos} críticos + ${registrosNormales} normales = ${registrosPorCurso} total`);
    }
    
    // Insertar todos los moods
    await Mood.insertMany(moodsToCreate);
    console.log(`\n✅ Creados ${moodsToCreate.length} moods distribuidos por curso`);
    
    // Verificar resultados
    console.log('\n📊 VERIFICACIÓN POR CURSO:');
    for (const clase of clases) {
      const estudiantes = estudiantesPorClase[clase._id];
      const studentIds = estudiantes.map(e => e._id);
      
      const totalMoodsHoy = await Mood.countDocuments({
        userId: { $in: studentIds },
        createdAt: {
          $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        }
      });
      
      const criticalMoodsHoy = await Mood.countDocuments({
        userId: { $in: studentIds },
        mood: { $in: criticalMoods },
        createdAt: {
          $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        }
      });
      
      console.log(`   📚 ${clase.name}:`);
      console.log(`      👥 Estudiantes: ${estudiantes.length}`);
      console.log(`      📈 Registros hoy: ${totalMoodsHoy}`);
      console.log(`      🚨 Críticos: ${criticalMoodsHoy}`);
      console.log(`      ✅ Suficiente para análisis: ${totalMoodsHoy >= 3 ? 'SÍ' : 'NO'}`);
    }
    
    console.log('\n🎯 INSTRUCCIONES:');
    console.log('   1. 👔 El DIRECTIVO ahora puede ver análisis por curso');
    console.log('   2. 👨‍🏫 Los DOCENTES verán alertas específicas de sus clases');
    console.log('   3. 📱 Usa el nuevo endpoint: /api/directivo/clima-emocional-por-curso');
    console.log('   4. 🔄 Refresca las pantallas para ver los nuevos datos');
    
  } catch (error) {
    console.error('❌ Error generando datos críticos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateCriticalData()
    .then(() => {
      console.log('\n🎉 ¡Datos críticos distribuidos por curso generados exitosamente!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { generateCriticalData }; 