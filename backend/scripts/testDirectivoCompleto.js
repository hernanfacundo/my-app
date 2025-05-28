require('dotenv').config();
const axios = require('axios');

const testDirectivoCompleto = async () => {
  try {
    console.log('🎯 Probando funcionalidad completa del directivo...');
    
    // Paso 1: Login para obtener token válido
    console.log('\n📝 1. Haciendo login con credenciales del directivo...');
    const loginResponse = await axios.post('http://192.168.0.231:3000/api/auth/signin', {
      email: 'directivo@ejemplo.com',
      password: '12345'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // Paso 2: Probar endpoint de test
    console.log('\n🧪 2. Probando endpoint de test...');
    const testResponse = await axios.get(
      'http://192.168.0.231:3000/api/directivo/test',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Test endpoint exitoso');
    console.log(`   Usuario: ${testResponse.data.user.name}`);
    console.log(`   Rol: ${testResponse.data.user.role}`);
    
    // Paso 3: Probar clima emocional diario
    console.log('\n📊 3. Probando clima emocional diario...');
    const climaResponse = await axios.get(
      'http://192.168.0.231:3000/api/directivo/clima-emocional-diario',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Clima emocional obtenido');
    const climaData = climaResponse.data.data;
    if (climaData.suficientesRegistros) {
      console.log(`   Estado: ${climaData.clima.climaGeneral} ${climaData.clima.emoji}`);
      console.log(`   Puntuación: ${climaData.clima.puntuacion}/5.0`);
      console.log(`   Registros: ${climaData.totalRegistros}`);
    } else {
      console.log(`   Datos insuficientes: ${climaData.totalRegistros}/${climaData.minimoRequerido}`);
    }
    
    // Paso 4: Probar tendencias de 7 días
    console.log('\n📈 4. Probando tendencias de 7 días...');
    const tendenciasResponse = await axios.get(
      'http://192.168.0.231:3000/api/directivo/tendencias-7-dias',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Tendencias obtenidas');
    const tendenciasData = tendenciasResponse.data.data;
    if (tendenciasData.suficientesRegistros) {
      console.log(`   Período: ${tendenciasData.periodo.inicio} - ${tendenciasData.periodo.fin}`);
      console.log(`   Tendencia general: ${tendenciasData.tendencias.resumen.tendenciaGeneral}`);
      console.log(`   Puntuación promedio: ${tendenciasData.tendencias.resumen.puntuacionPromedio}/5.0`);
      console.log(`   Total registros: ${tendenciasData.totalRegistros}`);
      
      if (tendenciasData.tendencias.resumen.mejorDia) {
        console.log(`   Mejor día: ${tendenciasData.tendencias.resumen.mejorDia.diaSemana} (${tendenciasData.tendencias.resumen.mejorDia.puntuacion})`);
      }
      
      console.log('\n   📅 Resumen por días:');
      tendenciasData.tendencias.dias.forEach(dia => {
        console.log(`     ${dia.diaSemana}: ${dia.emoji} ${dia.clima} (${dia.puntuacion}) - ${dia.registros} registros`);
      });
    } else {
      console.log(`   Datos insuficientes: ${tendenciasData.totalRegistros}/${tendenciasData.minimoRequerido}`);
    }
    
    console.log('\n🎉 ¡Todos los endpoints del directivo funcionan correctamente!');
    console.log('\n📱 El frontend debería mostrar:');
    console.log('   ✓ Clima emocional de hoy con indicador visual');
    console.log('   ✓ Tendencias de 7 días con gráfico de barras');
    console.log('   ✓ Estadísticas destacadas (mejor día, total registros)');
    console.log('   ✓ Botones de actualización manual');
    console.log('   ✓ Estados de carga y manejo de errores');
    
  } catch (error) {
    console.error('❌ Error en la prueba completa:', error.message);
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
testDirectivoCompleto(); 