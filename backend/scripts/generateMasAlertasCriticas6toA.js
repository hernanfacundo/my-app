require('dotenv').config();
const mongoose = require('mongoose');
const Mood = require('../models/Mood');
const User = require('../models/User');
const Class = require('../models/Class');

const generateMasAlertasCriticas6toA = async () => {
  try {
    console.log('🚨 GENERANDO MÚLTIPLES ALERTAS CRÍTICAS PARA 6TO GRADO A');
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

    // 2. Buscar estudiantes de esta clase
    const estudiantes = await User.find({ 
      classId: clase6toA._id,
      role: 'student'
    });
    
    console.log(`👥 Estudiantes encontrados: ${estudiantes.length}`);

    // 3. Definir múltiples alertas críticas variadas
    const alertasCriticas = [
      {
        mood: 'No tan bien',
        emotion: 'Triste',
        comment: 'Mi mamá está muy enferma y no sé si se va a curar, tengo mucho miedo',
        categoria: 'Crisis familiar - enfermedad'
      },
      {
        mood: 'No tan bien', 
        emotion: 'Ansioso',
        comment: 'No tengo dinero para el almuerzo y me da vergüenza pedirle a alguien',
        categoria: 'Problemas socioeconómicos'
      },
      {
        mood: 'Más o menos',
        emotion: 'Enojado',
        comment: 'El maestro siempre me regaña frente a todos y me hace sentir mal',
        categoria: 'Conflicto docente-estudiante'
      },
      {
        mood: 'No tan bien',
        emotion: 'Inseguro',
        comment: 'Todos mis amigos tienen mejores calificaciones que yo, siento que soy tonto',
        categoria: 'Autoestima académica baja'
      },
      {
        mood: 'No tan bien',
        emotion: 'Triste',
        comment: 'En el recreo siempre estoy solo porque nadie quiere jugar conmigo',
        categoria: 'Aislamiento social'
      },
      {
        mood: 'Más o menos',
        emotion: 'Cansado',
        comment: 'No puedo dormir porque mis papás pelean toda la noche',
        categoria: 'Violencia doméstica'
      },
      {
        mood: 'No tan bien',
        emotion: 'Ansioso',
        comment: 'Mañana tengo examen y no entiendo nada, voy a reprobar otra vez',
        categoria: 'Estrés académico severo'
      },
      {
        mood: 'No tan bien',
        emotion: 'Triste',
        comment: 'Mi papá se fue de la casa y no sé cuándo va a regresar',
        categoria: 'Abandono parental'
      },
      {
        mood: 'Más o menos',
        emotion: 'Enojado',
        comment: 'Los niños mayores me quitan mi dinero y me amenazaron',
        categoria: 'Bullying con extorsión'
      },
      {
        mood: 'No tan bien',
        emotion: 'Inseguro',
        comment: 'Creo que tengo un problema porque no puedo leer bien como los otros',
        categoria: 'Dificultades de aprendizaje'
      }
    ];

    // 4. Eliminar registros positivos anteriores de hoy para hacer más visibles las alertas
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    console.log('\n🧹 Limpiando registros positivos anteriores...');
    const deletedPositive = await Mood.deleteMany({
      userId: { $in: estudiantes.map(e => e._id) },
      mood: { $in: ['Excelente', 'Muy bien', 'Bien'] },
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });
    console.log(`   🗑️ Eliminados ${deletedPositive.deletedCount} registros positivos`);

    const moodsToCreate = [];
    
    console.log('\n🚨 Creando alertas críticas múltiples:');
    
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
      console.log(`      🚨 Categoría: ${alerta.categoria}`);
    }
    
    // 5. Guardar en base de datos
    await Mood.insertMany(moodsToCreate);
    console.log(`\n✅ ${moodsToCreate.length} alertas críticas adicionales creadas`);
    
    // 6. Verificar el resultado final
    console.log('\n📊 VERIFICACIÓN FINAL:');
    const totalCriticos = await Mood.countDocuments({
      userId: { $in: estudiantes.map(e => e._id) },
      mood: { $in: ['No tan bien', 'Más o menos'] },
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });
    
    const totalHoy = await Mood.countDocuments({
      userId: { $in: estudiantes.map(e => e._id) },
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });
    
    console.log(`   🔴 Total registros críticos hoy: ${totalCriticos}`);
    console.log(`   📊 Total registros hoy: ${totalHoy}`);
    console.log(`   ⚠️ Porcentaje crítico: ${Math.round((totalCriticos/totalHoy)*100)}%`);
    
    // 7. Instrucciones urgentes
    console.log('\n🚨 SITUACIÓN DE EMERGENCIA SIMULADA:');
    console.log('   ⛔ 6to Grado A necesita intervención INMEDIATA');
    console.log('   🔴 Múltiples estudiantes en crisis emocional');
    console.log('   📢 El directivo debe ver alertas rojas ahora');
    
    console.log('\n🎯 ACCIONES INMEDIATAS PARA EL DIRECTIVO:');
    console.log('   1. 👔 Revisa el "Análisis por Curso" AHORA');
    console.log('   2. 🚨 6to Grado A debe aparecer con clima crítico');
    console.log('   3. 📞 Contactar al Profesor Ejemplo urgentemente');
    console.log('   4. 🏥 Activar protocolo de crisis emocional escolar');
    console.log('   5. 👥 Convocar reunión de emergencia con padres');
    
    console.log('\n⚠️ TIPOS DE CRISIS DETECTADAS:');
    console.log('   • Crisis familiares (enfermedad, divorcio, abandono)');
    console.log('   • Problemas socioeconómicos');
    console.log('   • Bullying y extorsión');
    console.log('   • Dificultades de aprendizaje');
    console.log('   • Conflictos con docentes');
    console.log('   • Aislamiento social');
    console.log('   • Violencia doméstica');
    
  } catch (error) {
    console.error('❌ Error generando alertas críticas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  generateMasAlertasCriticas6toA()
    .then(() => {
      console.log('\n🚨 ¡SITUACIÓN CRÍTICA GENERADA! El directivo debe actuar AHORA');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { generateMasAlertasCriticas6toA }; 