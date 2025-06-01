const axios = require('axios');

const testAlertasDocente = async () => {
  try {
    console.log('🧪 PROBANDO ALERTAS PARA DOCENTE');
    
    const baseURL = 'http://localhost:3000/api';
    
    // 1. Login como docente
    console.log('🔐 Intentando login...');
    const loginResponse = await axios.post(`${baseURL}/auth/signin`, {
      email: 'profesor@ejemplo.com',
      password: '12345'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Probar endpoint de test primero
    console.log('🔍 Probando endpoint de test...');
    const testResponse = await axios.get(`${baseURL}/teacher/test`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Test exitoso:', testResponse.data.message);
    
    // 3. Obtener alertas críticas
    console.log('🚨 Obteniendo alertas críticas...');
    const alertasResponse = await axios.get(`${baseURL}/teacher/alertas-criticas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = alertasResponse.data.data;
    
    console.log('📊 RESUMEN:');
    console.log(`   Clases: ${data.resumen.totalClases}`);
    console.log(`   Estudiantes: ${data.resumen.totalEstudiantes}`);
    console.log(`   Alertas críticas: ${data.resumen.alertasCriticas}`);
    console.log(`   Porcentaje crítico: ${data.resumen.porcentajeAlertasCriticas}%`);
    
    data.clases.forEach((clase, index) => {
      console.log(`\n${index + 1}. ${clase.clase.nombre}:`);
      console.log(`   Alertas: ${clase.alertas.totalCriticas}`);
      console.log(`   Clima: ${clase.clima?.clima || 'Sin datos'}`);
      if (clase.alertas.hoy.length > 0) {
        clase.alertas.hoy.forEach(alerta => {
          console.log(`   🚨 ${alerta.estudiante}: ${alerta.mood} - ${alerta.emocion}`);
        });
      }
    });
    
    console.log('\n✅ ¡Prueba completada!');
    
  } catch (error) {
    console.error('❌ Error detallado:');
    console.error('   - Código:', error.code || 'Sin código');
    console.error('   - Mensaje:', error.message || 'Sin mensaje');
    console.error('   - Status:', error.response?.status || 'Sin status');
    console.error('   - Data:', error.response?.data || 'Sin data');
    console.error('   - URL:', error.config?.url || 'Sin URL');
  }
};

testAlertasDocente(); 