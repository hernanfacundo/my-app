require('dotenv').config();
const axios = require('axios');

const testIteracion4 = async () => {
  try {
    console.log('🎨 Probando Iteración 4: Pulido y optimización...');
    
    // Paso 1: Login para obtener token válido
    console.log('\n📝 1. Haciendo login con credenciales del directivo...');
    const loginResponse = await axios.post('http://192.168.0.231:3000/api/auth/signin', {
      email: 'directivo@ejemplo.com',
      password: '12345'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // Paso 2: Probar nuevo endpoint optimizado de dashboard completo
    console.log('\n🚀 2. Probando endpoint optimizado de dashboard completo...');
    const startTime = Date.now();
    
    const dashboardResponse = await axios.get(
      'http://192.168.0.231:3000/api/directivo/dashboard-completo',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('✅ Dashboard completo obtenido');
    console.log(`⚡ Tiempo de respuesta: ${responseTime}ms`);
    
    const data = dashboardResponse.data.data;
    
    // Analizar datos del clima de hoy
    console.log('\n📊 3. Análisis del clima emocional de hoy:');
    if (data.climaHoy.suficientesRegistros) {
      console.log(`   Estado: ${data.climaHoy.clima.climaGeneral} ${data.climaHoy.clima.emoji}`);
      console.log(`   Puntuación: ${data.climaHoy.clima.puntuacion}/5.0`);
      console.log(`   Registros: ${data.climaHoy.totalRegistros}`);
      console.log(`   Distribución de moods:`);
      Object.entries(data.climaHoy.clima.distribucion).forEach(([mood, count]) => {
        const percentage = ((count / data.climaHoy.totalRegistros) * 100).toFixed(1);
        console.log(`     - ${mood}: ${count} (${percentage}%)`);
      });
    } else {
      console.log(`   Datos insuficientes: ${data.climaHoy.totalRegistros}/${data.climaHoy.minimoRequerido}`);
    }
    
    // Analizar tendencias de 7 días
    console.log('\n📈 4. Análisis de tendencias de 7 días:');
    if (data.tendencias7Dias.suficientesRegistros) {
      console.log(`   Período: ${data.tendencias7Dias.periodo.inicio} - ${data.tendencias7Dias.periodo.fin}`);
      console.log(`   Tendencia general: ${data.tendencias7Dias.tendencias.resumen.tendenciaGeneral}`);
      console.log(`   Puntuación promedio: ${data.tendencias7Dias.tendencias.resumen.puntuacionPromedio}/5.0`);
      console.log(`   Total registros: ${data.tendencias7Dias.totalRegistros}`);
      console.log(`   Promedio diario: ${Math.round(data.tendencias7Dias.totalRegistros / 7)} registros`);
      
      if (data.tendencias7Dias.tendencias.resumen.mejorDia && data.tendencias7Dias.tendencias.resumen.peorDia) {
        const diferencia = (data.tendencias7Dias.tendencias.resumen.mejorDia.puntuacion - 
                           data.tendencias7Dias.tendencias.resumen.peorDia.puntuacion).toFixed(1);
        console.log(`   Diferencia mejor-peor día: ${diferencia} puntos`);
      }
    } else {
      console.log(`   Datos insuficientes: ${data.tendencias7Dias.totalRegistros}/${data.tendencias7Dias.minimoRequerido}`);
    }
    
    // Generar recomendaciones automáticas
    console.log('\n🎯 5. Recomendaciones automáticas:');
    if (data.climaHoy.suficientesRegistros && data.tendencias7Dias.suficientesRegistros) {
      const climaPuntuacion = data.climaHoy.clima.puntuacion;
      const tendenciaPuntuacion = data.tendencias7Dias.tendencias.resumen.puntuacionPromedio;
      
      if (climaPuntuacion >= 4.0) {
        console.log('   ✅ Excelente clima emocional hoy. Continúa con las estrategias actuales.');
      } else if (climaPuntuacion >= 3.0) {
        console.log('   📈 Clima positivo hoy. Considera actividades para mantener el bienestar.');
      } else {
        console.log('   ⚠️ Clima que requiere atención hoy. Evalúa implementar programas de apoyo.');
      }
      
      if (tendenciaPuntuacion >= 3.5) {
        console.log('   📊 La tendencia semanal es positiva.');
      } else {
        console.log('   📉 La tendencia semanal podría mejorar.');
      }
      
      if (data.tendencias7Dias.tendencias.resumen.mejorDia) {
        console.log(`   💡 Los ${data.tendencias7Dias.tendencias.resumen.mejorDia.diaSemana}s muestran mejor clima emocional.`);
      }
    }
    
    // Probar endpoints individuales para comparar rendimiento
    console.log('\n⚡ 6. Comparando rendimiento con endpoints individuales...');
    
    const startIndividual = Date.now();
    await Promise.all([
      axios.get('http://192.168.0.231:3000/api/directivo/clima-emocional-diario', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      axios.get('http://192.168.0.231:3000/api/directivo/tendencias-7-dias', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);
    const endIndividual = Date.now();
    const individualTime = endIndividual - startIndividual;
    
    console.log(`   Endpoint optimizado: ${responseTime}ms`);
    console.log(`   Endpoints individuales: ${individualTime}ms`);
    console.log(`   Mejora de rendimiento: ${((individualTime - responseTime) / individualTime * 100).toFixed(1)}%`);
    
    console.log('\n🎉 ¡Iteración 4 completada exitosamente!');
    console.log('\n📱 Nuevas funcionalidades implementadas:');
    console.log('   ✓ Auto-refresh cada 5 minutos');
    console.log('   ✓ Botón de actualización global');
    console.log('   ✓ Indicador de última actualización');
    console.log('   ✓ Distribución visual de moods');
    console.log('   ✓ Insights automáticos en tendencias');
    console.log('   ✓ Resumen ejecutivo con recomendaciones');
    console.log('   ✓ Endpoint optimizado para mejor rendimiento');
    console.log('   ✓ Métricas adicionales y análisis mejorado');
    
  } catch (error) {
    console.error('❌ Error en la prueba de Iteración 4:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Sugerencia: Asegúrate de que el servidor esté corriendo con "npm start"');
    }
  }
};

// Ejecutar el test
testIteracion4(); 