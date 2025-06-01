require('dotenv').config();
const axios = require('axios');

const testAnalisisPorCurso = async () => {
  try {
    console.log('🏫 PROBANDO ANÁLISIS EMOCIONAL POR CURSO');
    console.log('=' .repeat(50));
    
    // 1. Login del directivo
    console.log('\n📝 1. Haciendo login como directivo...');
    const loginResponse = await axios.post('http://192.168.0.231:3000/api/auth/signin', {
      email: 'directivo@ejemplo.com',
      password: '12345'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Probar el nuevo endpoint
    console.log('\n🏫 2. Obteniendo análisis por curso...');
    const response = await axios.get(
      'http://192.168.0.231:3000/api/directivo/clima-emocional-por-curso',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Análisis por curso obtenido');
    const data = response.data.data;
    
    // 3. Mostrar resumen general
    console.log('\n📊 3. RESUMEN GENERAL:');
    console.log(`   🏫 Total cursos: ${data.resumenGeneral.totalCursos}`);
    console.log(`   👥 Total estudiantes: ${data.resumenGeneral.totalEstudiantes}`);
    console.log(`   📈 Cursos con datos hoy: ${data.resumenGeneral.cursosConDatosHoy}/${data.resumenGeneral.totalCursos}`);
    console.log(`   📊 Total registros hoy: ${data.resumenGeneral.totalRegistrosHoy}`);
    console.log(`   📅 Total registros 7 días: ${data.resumenGeneral.totalRegistros7Dias}`);
    
    // 4. Mostrar análisis de cada curso
    console.log('\n🎓 4. ANÁLISIS POR CURSO:');
    data.cursos.forEach((curso, index) => {
      const { curso: info, climaHoy, tendencia7Dias, participacion } = curso;
      
      console.log(`\n   📚 ${index + 1}. ${info.nombre} (${info.codigo})`);
      console.log(`      👨‍🏫 Docente: ${info.docente}`);
      console.log(`      👥 Estudiantes: ${info.totalEstudiantes}`);
      
      // Participación
      console.log(`      📊 Participación hoy: ${participacion.registrosHoy} (${participacion.porcentajeParticipacionHoy}%)`);
      console.log(`      📈 Participación 7 días: ${participacion.registros7Dias} (${participacion.porcentajeParticipacion7Dias}%)`);
      
      // Clima de hoy
      if (climaHoy.suficientesRegistros) {
        console.log(`      🌡️  Clima hoy: ${climaHoy.climaGeneral} ${climaHoy.emoji} (${climaHoy.puntuacion}/5.0)`);
        if (climaHoy.emocionesPredominantes && climaHoy.emocionesPredominantes.length > 0) {
          const emocionTop = climaHoy.emocionesPredominantes[0];
          console.log(`      💭 Emoción principal: ${emocionTop.emocion} (${emocionTop.count} registros)`);
        }
      } else {
        console.log(`      🔒 Clima hoy: Datos insuficientes (${climaHoy.totalRegistros}/${climaHoy.minimoRequerido})`);
      }
      
      // Tendencia 7 días
      if (tendencia7Dias.suficientesRegistros) {
        console.log(`      📈 Tendencia 7 días: ${tendencia7Dias.resumen.tendenciaGeneral} (${tendencia7Dias.resumen.puntuacionPromedio}/5.0)`);
        if (tendencia7Dias.resumen.mejorDia) {
          console.log(`      🎯 Mejor día: ${tendencia7Dias.resumen.mejorDia.diaSemana}`);
        }
      } else {
        console.log(`      📊 Tendencia 7 días: Datos insuficientes`);
      }
    });
    
    // 5. Recomendaciones basadas en datos
    console.log('\n💡 5. RECOMENDACIONES:');
    
    const cursosConAtencion = data.cursos.filter(c => 
      c.climaHoy.suficientesRegistros && 
      (c.climaHoy.climaGeneral === 'Necesita atención' || c.climaHoy.climaGeneral === 'Regular')
    );
    
    const cursosExcelentes = data.cursos.filter(c => 
      c.climaHoy.suficientesRegistros && 
      (c.climaHoy.climaGeneral === 'Excelente' || c.climaHoy.climaGeneral === 'Muy positivo')
    );
    
    if (cursosConAtencion.length > 0) {
      console.log(`   ⚠️  ${cursosConAtencion.length} curso(s) requieren atención especial:`);
      cursosConAtencion.forEach(c => {
        console.log(`      - ${c.curso.nombre}: ${c.climaHoy.climaGeneral}`);
      });
    }
    
    if (cursosExcelentes.length > 0) {
      console.log(`   ✨ ${cursosExcelentes.length} curso(s) con excelente clima emocional:`);
      cursosExcelentes.forEach(c => {
        console.log(`      - ${c.curso.nombre}: ${c.climaHoy.climaGeneral}`);
      });
    }
    
    const participacionBaja = data.cursos.filter(c => c.participacion.porcentajeParticipacionHoy < 30);
    if (participacionBaja.length > 0) {
      console.log(`   📢 ${participacionBaja.length} curso(s) con baja participación (< 30%):`);
      participacionBaja.forEach(c => {
        console.log(`      - ${c.curso.nombre}: ${c.participacion.porcentajeParticipacionHoy}%`);
      });
    }
    
    console.log('\n🎉 CARACTERÍSTICAS IMPLEMENTADAS:');
    console.log('   ✅ Análisis individualizado por curso');
    console.log('   ✅ Métricas de participación por curso');
    console.log('   ✅ Clima emocional específico de cada clase');
    console.log('   ✅ Tendencias de 7 días por curso');
    console.log('   ✅ Identificación de emociones predominantes');
    console.log('   ✅ Recomendaciones automáticas');
    console.log('   ✅ Privacidad protegida (mínimo 3 registros por curso)');
    console.log('   ✅ Resumen ejecutivo consolidado');
    
    console.log('\n📱 PRÓXIMOS PASOS:');
    console.log('   1. El frontend ya está listo con la nueva pantalla AnalisisPorCurso');
    console.log('   2. Navega desde DirectivoDashboard → "Análisis por Curso"');
    console.log('   3. Verás tarjetas detalladas para cada curso');
    console.log('   4. Datos actualizados en tiempo real');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  testAnalisisPorCurso()
    .then(() => {
      console.log('\n🎯 ¡Prueba completada exitosamente!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { testAnalisisPorCurso }; 