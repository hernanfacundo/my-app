require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const testClimaEmocional = async () => {
  try {
    console.log('🧪 Probando endpoint de clima emocional diario...');
    
    // Crear un token JWT válido para el directivo
    const directivoPayload = {
      id: '6834fcce6f942baf766b7fe4', // ID del directivo que creamos
      email: 'directivo@ejemplo.com',
      role: 'directivo',
      name: 'Director de Prueba'
    };
    
    const token = jwt.sign(directivoPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('🔑 Token JWT generado para prueba');
    
    // Hacer petición al endpoint
    const response = await axios.get(
      'http://localhost:3000/api/directivo/clima-emocional-diario',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Respuesta exitosa del servidor:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Analizar la respuesta
    const data = response.data.data;
    if (data.suficientesRegistros) {
      console.log('\n📊 Análisis del clima emocional:');
      console.log(`   Estado general: ${data.clima.emoji} ${data.clima.climaGeneral}`);
      console.log(`   Puntuación: ${data.clima.puntuacion}/5.0`);
      console.log(`   Total registros: ${data.totalRegistros}`);
      console.log(`   Fecha: ${data.fecha}`);
      
      if (data.clima.emocionesPredominantes.length > 0) {
        console.log('\n🎭 Emociones predominantes:');
        data.clima.emocionesPredominantes.forEach((emocion, index) => {
          console.log(`   ${index + 1}. ${emocion.emocion} (${emocion.count} registros)`);
        });
      }
      
      if (data.clima.lugaresComunes.length > 0) {
        console.log('\n📍 Lugares más comunes:');
        data.clima.lugaresComunes.forEach((lugar, index) => {
          console.log(`   ${index + 1}. ${lugar.lugar} (${lugar.count} registros)`);
        });
      }
    } else {
      console.log('\n🔒 Datos insuficientes para mostrar clima emocional');
      console.log(`   Registros actuales: ${data.totalRegistros}`);
      console.log(`   Mínimo requerido: ${data.minimoRequerido}`);
      console.log(`   Mensaje: ${data.mensaje}`);
    }
    
  } catch (error) {
    console.error('❌ Error probando clima emocional:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
};

// Ejecutar el test
testClimaEmocional(); 