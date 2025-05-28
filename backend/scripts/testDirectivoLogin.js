require('dotenv').config();
const axios = require('axios');

const testDirectivoLogin = async () => {
  try {
    console.log('🔐 Probando login completo del directivo...');
    
    // Paso 1: Login para obtener token válido
    console.log('📝 Haciendo login con credenciales del directivo...');
    const loginResponse = await axios.post('http://192.168.0.231:3000/api/auth/signin', {
      email: 'directivo@ejemplo.com',
      password: '12345'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // Paso 2: Probar endpoint de clima emocional con token real
    console.log('📊 Probando endpoint de clima emocional...');
    const climaResponse = await axios.get(
      'http://192.168.0.231:3000/api/directivo/clima-emocional-diario',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Clima emocional obtenido exitosamente:');
    console.log(JSON.stringify(climaResponse.data, null, 2));
    
    // Paso 3: Probar endpoint de test
    console.log('\n🧪 Probando endpoint de test...');
    const testResponse = await axios.get(
      'http://192.168.0.231:3000/api/directivo/test',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Test endpoint exitoso:');
    console.log(JSON.stringify(testResponse.data, null, 2));
    
    console.log('\n🎉 ¡Todos los endpoints funcionan correctamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
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
testDirectivoLogin(); 