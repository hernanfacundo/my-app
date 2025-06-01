require('dotenv').config();
const mongoose = require('mongoose');
const Mood = require('../models/Mood');
const User = require('../models/User');
const Class = require('../models/Class');

const generateAlertasCriticas6toA = async () => {
  try {
    console.log('🚨 GENERANDO 3 ALERTAS CRÍTICAS PARA 6TO GRADO A');
    console.log('=' .repeat(60));
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // 1. Buscar la clase "6to Grado A"
    const clase6toA = await Class.findOne({ 
      name: { $regex: /6to.*Grado.*A/i }
    }).populate('docenteId', 'name');
    
    if (!clase6toA) {
      console.log('❌ No se encontró la clase "6to Grado A"');
      return;
    }
    
    console.log(`📚 Clase encontrada: ${clase6toA.name} (${clase6toA.code})`);
    console.log(`👨‍🏫 Docente: ${clase6toA.docenteId.name}`);

    // 2. Buscar estudiantes de esta clase
    const estudiantes = await User.find({ 
      classId: clase6toA._id,
      role: 'student'
    });
    
    if (estudiantes.length === 0) {
      console.log('❌ No se encontraron estudiantes en 6to Grado A');
      return;
    }
    
    console.log(`👥 Estudiantes encontrados: ${estudiantes.length}`);

    // 3. Generar exactamente 3 alertas críticas
    const alertasCriticas = [
      {
        mood: 'No tan bien',
        emotion: 'Triste',
        comment: 'No puedo concentrarme en clase, todo me parece muy difícil y siento que no sirvo para nada',
        descripcion: 'Estudiante reporta dificultades académicas severas y baja autoestima'
      },
      {
        mood: 'No tan bien', 
        emotion: 'Ansioso',
        comment: 'Mis papás se van a divorciar y no sé qué va a pasar conmigo, tengo mucho miedo',
        descripcion: 'Situación familiar crisis que afecta estabilidad emocional del estudiante'
      },
      {
        mood: 'Más o menos',
        emotion: 'Enojado',
        comment: 'Los otros niños me molestan todos los días y ya no quiero venir a la escuela',
        descripcion: 'Posible caso de bullying que requiere intervención inmediata'
      }
    ];

    const moodsToCreate = [];
    const today = new Date();
    
    console.log('\n🚨 Creando alertas críticas específicas:');
    
    for (let i = 0; i < alertasCriticas.length; i++) {
      const alerta = alertasCriticas[i];
      
      // Seleccionar un estudiante diferente para cada alerta
      const estudianteIndex = i % estudiantes.length;
      const estudiante = estudiantes[estudianteIndex];
      
      // Crear hora aleatoria de hoy (entre 8 AM y 4 PM - horario escolar)
      const randomHour = 8 + Math.floor(Math.random() * 8);
      const randomMinute = Math.floor(Math.random() * 60);
      
      const moodTime = new Date(today);
      moodTime.setHours(randomHour, randomMinute, 0, 0);
      
      const mood = new Mood({
        userId: estudiante._id,
        mood: alerta.mood,
        emotion: alerta.emotion,
        place: 'Escuela',
        comment: alerta.comment,
        createdAt: moodTime
      });
      
      moodsToCreate.push(mood);
      
      console.log(`\n   🔴 ALERTA ${i + 1}:`);
      console.log(`      👤 Estudiante: ${estudiante.name}`);
      console.log(`      😟 Estado: ${alerta.mood} - ${alerta.emotion}`);
      console.log(`      💬 Comentario: "${alerta.comment}"`);
      console.log(`      ⏰ Hora: ${moodTime.toLocaleTimeString()}`);
      console.log(`      🚨 Descripción: ${alerta.descripcion}`);
    }
    
    // 4. Guardar en base de datos
    await Mood.insertMany(moodsToCreate);
    console.log(`\n✅ ${moodsToCreate.length} alertas críticas creadas exitosamente`);
    
    // 5. Verificar el resultado
    console.log('\n📊 VERIFICACIÓN:');
    const verificacion = await Mood.countDocuments({
      userId: { $in: estudiantes.map(e => e._id) },
      mood: { $in: ['No tan bien', 'Más o menos'] },
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });
    
    console.log(`   🔴 Total registros críticos hoy en 6to Grado A: ${verificacion}`);
    
    // 6. Instrucciones para el directivo
    console.log('\n🎯 INSTRUCCIONES PARA EL DIRECTIVO:');
    console.log('   1. 👔 Inicia sesión como directivo (directivo@ejemplo.com / 12345)');
    console.log('   2. 🏫 Ve al "Análisis por Curso"');
    console.log('   3. 📊 Busca la tarjeta de "6to Grado A"');
    console.log('   4. 🚨 Verás el clima emocional crítico');
    console.log('   5. 👀 Las alertas aparecerán en las métricas de clima emocional');
    
    console.log('\n⚠️  TIPOS DE ALERTAS GENERADAS:');
    console.log('   🔴 Dificultades académicas y autoestima');
    console.log('   🔴 Crisis familiar (divorcio)');
    console.log('   🔴 Posible bullying escolar');
    
    console.log('\n📱 ACCIONES RECOMENDADAS:');
    console.log('   • Contactar inmediatamente al docente de la clase');
    console.log('   • Programar reuniones con padres de familia');
    console.log('   • Activar protocolo de apoyo psicopedagógico');
    console.log('   • Investigar situación de bullying');
    console.log('   • Seguimiento personalizado de cada caso');
    
  } catch (error) {
    console.error('❌ Error generando alertas críticas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateAlertasCriticas6toA()
    .then(() => {
      console.log('\n🎉 ¡3 Alertas críticas para 6to Grado A generadas exitosamente!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { generateAlertasCriticas6toA }; 