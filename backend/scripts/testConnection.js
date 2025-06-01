require('dotenv').config();
const axios = require('axios');
const { execSync } = require('child_process');
const os = require('os');

async function testConnection() {
  console.log('🔍 VERIFICACIÓN COMPLETA DE CONECTIVIDAD');
  console.log('=' .repeat(50));
  
  // 1. Obtener IP actual
  const interfaces = os.networkInterfaces();
  let currentIP = null;
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        currentIP = iface.address;
        break;
      }
    }
    if (currentIP) break;
  }
  
  console.log('\n📱 1. INFORMACIÓN DE RED:');
  console.log('   IP actual:', currentIP);
  console.log('   Fecha:', new Date().toLocaleString());
  
  // 2. Verificar que el servidor responda
  console.log('\n🖥️ 2. VERIFICANDO SERVIDOR BACKEND:');
  try {
    const serverUrl = `http://${currentIP}:3000`;
    const response = await axios.get(`${serverUrl}/api/auth/signin`, {
      timeout: 5000,
      validateStatus: () => true // Aceptar cualquier status code
    });
    
    console.log('   ✅ Servidor backend respondiendo');
    console.log('   📍 URL:', serverUrl);
    console.log('   🚀 Status:', response.status);
  } catch (error) {
    console.log('   ❌ Error conectando al servidor:');
    console.log('   ', error.code || error.message);
    return false;
  }
  
  // 3. Verificar endpoints principales
  console.log('\n🔗 3. VERIFICANDO ENDPOINTS PRINCIPALES:');
  
  const endpoints = [
    { name: 'Auth Signin', path: '/api/auth/signin', method: 'POST' },
    { name: 'Learning Paths', path: '/api/learning-paths', method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `http://${currentIP}:3000${endpoint.path}`;
      const response = await axios.request({
        method: endpoint.method,
        url,
        timeout: 3000,
        validateStatus: () => true,
        data: endpoint.method === 'POST' ? {} : undefined
      });
      
      console.log(`   ✅ ${endpoint.name}: OK (${response.status})`);
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: Error`);
    }
  }
  
  // 4. Verificar configuración del frontend
  console.log('\n📱 4. VERIFICANDO CONFIGURACIÓN FRONTEND:');
  try {
    const fs = require('fs');
    const configPath = '../frontend/src/config.js';
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    if (configContent.includes(currentIP)) {
      console.log('   ✅ Frontend configurado con IP correcta');
    } else {
      console.log('   ⚠️  Frontend puede tener IP incorrecta');
      console.log('   💡 Verificar: frontend/src/config.js');
    }
  } catch (error) {
    console.log('   ❌ No se pudo verificar configuración frontend');
  }
  
  // 5. Verificar MongoDB
  console.log('\n🍃 5. VERIFICANDO MONGODB:');
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('   ✅ MongoDB conectado');
    await mongoose.disconnect();
  } catch (error) {
    console.log('   ❌ Error MongoDB:', error.message.substring(0, 50));
  }
  
  // 6. Instrucciones finales
  console.log('\n📋 6. INSTRUCCIONES PARA EL CELULAR:');
  console.log(`   1. Asegúrate de estar en la misma red WiFi`);
  console.log(`   2. Abre Expo Go en tu celular`);
  console.log(`   3. Escanea el código QR de Expo`);
  console.log(`   4. La app debería conectarse a: http://${currentIP}:3000`);
  
  console.log('\n🛠️ 7. SI LA APP NO FUNCIONA:');
  console.log('   • Reinicia Expo: npx expo start --clear');
  console.log('   • Verifica que ambos dispositivos estén en la misma red');
  console.log('   • Verifica firewall/antivirus en la computadora');
  console.log('   • Prueba con otra red WiFi');
  
  console.log('\n✅ VERIFICACIÓN COMPLETADA');
  return true;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testConnection()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error en verificación:', error);
      process.exit(1);
    });
}

module.exports = { testConnection }; 