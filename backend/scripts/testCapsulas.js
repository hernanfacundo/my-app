const axios = require('axios');

const testCapsulasDocente = async () => {
  try {
    console.log('🧘‍♂️ PROBANDO FUNCIONALIDAD DE CÁPSULAS DE AUTOCUIDADO');
    console.log('=' .repeat(60));
    
    const baseURL = 'http://localhost:3000/api';
    
    // 1. Login como docente
    console.log('🔐 Autenticando como docente...');
    const loginResponse = await axios.post(`${baseURL}/auth/signin`, {
      email: 'profesor@ejemplo.com',
      password: '12345'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // 2. Obtener todas las cápsulas disponibles
    console.log('\n📖 Obteniendo cápsulas disponibles...');
    const capsulaResponse = await axios.get(`${baseURL}/teacher/capsulas`, { headers });
    
    const { capsulas, estadisticas, filtros } = capsulaResponse.data.data;
    
    console.log(`✅ ${capsulas.length} cápsulas obtenidas`);
    console.log(`   📊 Total disponibles: ${estadisticas.totalDisponibles}`);
    console.log(`   🔍 Vistas del docente: ${estadisticas.vistasDelDocente}`);
    console.log(`   💾 Guardadas: ${estadisticas.guardadas}`);
    
    // 3. Mostrar resumen de cápsulas
    console.log('\n📋 RESUMEN DE CÁPSULAS:');
    capsulas.forEach((capsula, index) => {
      const indicadores = [
        capsula.yaVista ? '👁️' : '',
        capsula.meGusta ? '👍' : '',
        capsula.guardada ? '💾' : '',
        capsula.completada ? '✅' : ''
      ].filter(Boolean).join(' ');
      
      console.log(`   ${index + 1}. ${capsula.titulo} (${capsula.duracion}min) ${indicadores}`);
      console.log(`      ${capsula.categoria} | ${capsula.nivelDificultad} | ${capsula.emocionesRelacionadas.join(', ')}`);
    });
    
    // 4. Probar filtros por categoría
    console.log('\n🎯 Probando filtros por categoría...');
    const categorias = ['mindfulness', 'autocuidado', 'respiracion'];
    
    for (const categoria of categorias) {
      const filtroResponse = await axios.get(`${baseURL}/teacher/capsulas?categoria=${categoria}`, { headers });
      const { capsulas: capsulasFiltradas } = filtroResponse.data.data;
      console.log(`   ${categoria}: ${capsulasFiltradas.length} cápsulas`);
    }
    
    // 5. Probar filtros por estado emocional
    console.log('\n😟 Probando filtros por estado emocional...');
    const emociones = ['estresado', 'agotado', 'ansioso'];
    
    for (const emocion of emociones) {
      const filtroResponse = await axios.get(`${baseURL}/teacher/capsulas?estadoEmocional=${emocion}`, { headers });
      const { capsulas: capsulasFiltradas } = filtroResponse.data.data;
      console.log(`   ${emocion}: ${capsulasFiltradas.length} cápsulas`);
    }
    
    if (capsulas.length > 0) {
      const primeraCapsula = capsulas[0];
      
      // 6. Obtener detalle de una cápsula específica
      console.log(`\n🔍 Obteniendo detalle de: "${primeraCapsula.titulo}"`);
      const detalleResponse = await axios.get(`${baseURL}/teacher/capsulas/${primeraCapsula._id}`, { headers });
      
      const detalle = detalleResponse.data.data;
      console.log(`✅ Detalle obtenido`);
      console.log(`   📝 Contenido: ${detalle.contenido.substring(0, 100)}...`);
      console.log(`   🔗 Relacionadas: ${detalle.relacionadas.length} cápsulas`);
      
      // 7. Probar interacciones con la cápsula
      console.log('\n💫 Probando interacciones...');
      
      // Dar "me gusta"
      await axios.post(`${baseURL}/teacher/capsulas/${primeraCapsula._id}/interaccion`, {
        tipoInteraccion: 'like',
        estadoEmocionalPrevio: 'estresado'
      }, { headers });
      console.log('👍 Like registrado');
      
      // Guardar cápsula
      await axios.post(`${baseURL}/teacher/capsulas/${primeraCapsula._id}/interaccion`, {
        tipoInteraccion: 'guardada'
      }, { headers });
      console.log('💾 Cápsula guardada');
      
      // Marcar como completada
      await axios.post(`${baseURL}/teacher/capsulas/${primeraCapsula._id}/interaccion`, {
        tipoInteraccion: 'completada',
        tiempoVisualizacion: 300, // 5 minutos
        valoracion: 5,
        comentario: 'Muy útil para manejar el estrés'
      }, { headers });
      console.log('✅ Cápsula completada');
      
      // 8. Verificar cápsulas guardadas
      console.log('\n💾 Obteniendo cápsulas guardadas...');
      const guardadasResponse = await axios.get(`${baseURL}/teacher/capsulas-guardadas`, { headers });
      
      const { capsulas: capsulaGuardadas, total } = guardadasResponse.data.data;
      console.log(`✅ ${total} cápsulas guardadas encontradas`);
      
      if (capsulaGuardadas.length > 0) {
        console.log(`   📌 "${capsulaGuardadas[0].titulo}" guardada el ${new Date(capsulaGuardadas[0].fechaGuardada).toLocaleDateString()}`);
      }
      
      // 9. Obtener estadísticas de uso
      console.log('\n📊 Obteniendo estadísticas de uso...');
      const statsResponse = await axios.get(`${baseURL}/teacher/capsulas-estadisticas`, { headers });
      
      const stats = statsResponse.data.data;
      console.log('✅ Estadísticas generadas:');
      console.log(`   👁️ Vistas: ${stats.interacciones.vistas}`);
      console.log(`   ✅ Completadas: ${stats.interacciones.completadas}`);
      console.log(`   👍 Likes: ${stats.interacciones.likes}`);
      console.log(`   💾 Guardadas: ${stats.interacciones.guardadas}`);
      console.log(`   ⏱️ Tiempo total: ${stats.actividad.tiempoTotalMinutos} minutos`);
      console.log(`   📈 Completadas últimos 30 días: ${stats.actividad.completadasUltimos30Dias}`);
      
      // 10. Probar eliminación de interacción
      console.log('\n🗑️ Probando eliminación de interacción...');
      await axios.delete(`${baseURL}/teacher/capsulas/${primeraCapsula._id}/interaccion/like`, { headers });
      console.log('👍 Like eliminado');
      
      // 11. Verificar cambios después de eliminar
      const detallePostEliminacion = await axios.get(`${baseURL}/teacher/capsulas/${primeraCapsula._id}`, { headers });
      console.log(`✅ Verificado - Like removido: ${!detallePostEliminacion.data.data.meGusta}`);
    }
    
    console.log('\n🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('=' .repeat(60));
    console.log('✅ Funcionalidad de cápsulas de autocuidado 100% operativa');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:');
    console.error('   🔴 Descripción:', error.message);
    console.error('   🔴 Status:', error.response?.status || 'Sin status');
    console.error('   🔴 Data:', error.response?.data || 'Sin data');
    console.error('   🔴 URL:', error.config?.url || 'Sin URL');
    
    if (error.response?.status === 401) {
      console.error('\n💡 SUGERENCIA: Verifica que el servidor esté corriendo y la autenticación sea correcta');
    } else if (error.response?.status === 404) {
      console.error('\n💡 SUGERENCIA: Verifica que las rutas de cápsulas estén registradas en el servidor');
    }
  }
};

testCapsulasDocente(); 