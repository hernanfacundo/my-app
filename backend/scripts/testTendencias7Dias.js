require('dotenv').config();
const axios = require('axios');

const testTendencias7Dias = async () => {
  try {
    console.log('📈 Probando endpoint de tendencias de 7 días...');
    
    // Paso 1: Login para obtener token válido
    console.log('📝 Haciendo login con credenciales del directivo...');
    const loginResponse = await axios.post('http://192.168.0.231:3000/api/auth/signin', {
      email: 'directivo@ejemplo.com',
      password: '12345'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // Paso 2: Probar endpoint de tendencias
    console.log('📊 Probando endpoint de tendencias de 7 días...');
    const tendenciasResponse = await axios.get(
      'http://192.168.0.231:3000/api/directivo/tendencias-7-dias',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Tendencias obtenidas exitosamente:');
    console.log(JSON.stringify(tendenciasResponse.data, null, 2));
    
    // Paso 3: Analizar los datos
    const data = tendenciasResponse.data.data;
    if (data.suficientesRegistros) {
      console.log('\n📈 Análisis de tendencias:');
      console.log(`   Período: ${data.periodo.inicio} - ${data.periodo.fin}`);
      console.log(`   Total registros: ${data.totalRegistros}`);
      console.log(`   Tendencia general: ${data.tendencias.resumen.tendenciaGeneral}`);
      console.log(`   Puntuación promedio: ${data.tendencias.resumen.puntuacionPromedio}/5.0`);
      
      if (data.tendencias.resumen.mejorDia) {
        console.log(`   Mejor día: ${data.tendencias.resumen.mejorDia.diaSemana} (${data.tendencias.resumen.mejorDia.puntuacion})`);
      }
      
      if (data.tendencias.resumen.peorDia) {
        console.log(`   Peor día: ${data.tendencias.resumen.peorDia.diaSemana} (${data.tendencias.resumen.peorDia.puntuacion})`);
      }
      
      console.log('\n📅 Desglose por días:');
      data.tendencias.dias.forEach(dia => {
        console.log(`   ${dia.diaSemana}: ${dia.emoji} ${dia.clima} (${dia.puntuacion}) - ${dia.registros} registros`);
      });
    } else {
      console.log('\n🔒 Datos insuficientes para mostrar tendencias');
      console.log(`   Registros actuales: ${data.totalRegistros}`);
      console.log(`   Mínimo requerido: ${data.minimoRequerido}`);
    }
    
    console.log('\n🎉 ¡Endpoint de tendencias funciona correctamente!');
    
  } catch (error) {
    console.error('❌ Error probando tendencias:', error.message);
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
testTendencias7Dias(); 