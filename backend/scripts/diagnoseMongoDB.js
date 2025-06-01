require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns').promises;
const os = require('os');

async function diagnoseMongoDB() {
  console.log('🔍 DIAGNÓSTICO DE CONEXIÓN MONGODB');
  console.log('=' .repeat(50));
  
  // 1. Verificar variables de entorno
  console.log('\n📋 1. VERIFICANDO VARIABLES DE ENTORNO:');
  console.log('   MONGODB_URI existe:', !!process.env.MONGODB_URI);
  
  if (process.env.MONGODB_URI) {
    // Enmascarar la contraseña para mostrarla de forma segura
    const uri = process.env.MONGODB_URI.replace(
      /:([^:@]*@)/,
      ':*****@'
    );
    console.log('   URI (enmascarada):', uri);
  } else {
    console.log('   ❌ MONGODB_URI no está definida');
    console.log('\n💡 SOLUCIÓN: Crear archivo .env con:');
    console.log('   MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/basedatos?retryWrites=true&w=majority');
    return;
  }

  // 2. Verificar conectividad de red
  console.log('\n🌐 2. VERIFICANDO CONECTIVIDAD DE RED:');
  
  try {
    // Extraer hostname de la URI
    const uriPattern = /mongodb\+srv:\/\/[^@]+@([^\/]+)/;
    const match = process.env.MONGODB_URI.match(uriPattern);
    
    if (match && match[1]) {
      const hostname = match[1];
      console.log('   Hostname extraído:', hostname);
      
      // Test DNS resolution
      try {
        const addresses = await dns.resolve(hostname);
        console.log('   ✅ DNS resuelto correctamente:', addresses.slice(0, 2));
      } catch (dnsError) {
        console.log('   ❌ Error de DNS:', dnsError.code);
        console.log('\n💡 POSIBLES SOLUCIONES:');
        console.log('   - Verificar conexión a internet');
        console.log('   - Cambiar servidor DNS (8.8.8.8, 1.1.1.1)');
        console.log('   - Verificar firewall corporativo');
      }
      
      // Test SRV records específicamente
      try {
        const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${hostname}`);
        console.log('   ✅ Registros SRV encontrados:', srvRecords.length);
      } catch (srvError) {
        console.log('   ❌ Error SRV:', srvError.code);
        console.log('   Este es el error que estás experimentando');
      }
    }
  } catch (error) {
    console.log('   ❌ Error parsing URI:', error.message);
  }

  // 3. Información del sistema
  console.log('\n💻 3. INFORMACIÓN DEL SISTEMA:');
  console.log('   OS:', os.type(), os.release());
  console.log('   Node.js:', process.version);
  console.log('   Mongoose:', mongoose.version);
  
  // 4. Test de conexión con diferentes configuraciones
  console.log('\n🔧 4. PROBANDO CONEXIONES CON DIFERENTES CONFIGURACIONES:');
  
  const connectionOptions = [
    {
      name: 'Configuración actual',
      options: { useNewUrlParser: true, useUnifiedTopology: true }
    },
    {
      name: 'Con timeouts extendidos',
      options: { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000
      }
    },
    {
      name: 'Forzando IPv4',
      options: { 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        family: 4
      }
    }
  ];

  for (const config of connectionOptions) {
    console.log(`\n   Probando: ${config.name}`);
    try {
      const connection = await mongoose.createConnection(process.env.MONGODB_URI, config.options);
      console.log('   ✅ Conexión exitosa');
      await connection.close();
      console.log('   ✅ Desconexión limpia');
    } catch (error) {
      console.log('   ❌ Error:', error.code || error.message.substring(0, 100));
    }
  }

  // 5. Verificar configuración de MongoDB Atlas
  console.log('\n☁️ 5. VERIFICACIONES DE MONGODB ATLAS:');
  console.log('   💡 Verifica en tu panel de MongoDB Atlas:');
  console.log('   - IP del servidor está en la whitelist (0.0.0.0/0 para todas)');
  console.log('   - Usuario de base de datos tiene permisos correctos');
  console.log('   - Cluster está activo y funcionando');
  console.log('   - No hay mantenimiento programado');

  // 6. Soluciones alternativas
  console.log('\n🛠️ 6. SOLUCIONES RECOMENDADAS:');
  console.log('   1. Usar una URI de conexión directa (sin SRV)');
  console.log('   2. Configurar DNS alternativo en tu sistema');
  console.log('   3. Probar desde una red diferente');
  console.log('   4. Usar MongoDB local para desarrollo');
  console.log('   5. Verificar configuración de proxy/firewall');

  console.log('\n🔄 SOLUCIÓN INMEDIATA - URI DIRECTA:');
  console.log('   En lugar de usar mongodb+srv://, prueba con:');
  console.log('   mongodb://cluster01-shard-00-00.y4zvwwe.mongodb.net:27017,cluster01-shard-00-01.y4zvwwe.mongodb.net:27017,cluster01-shard-00-02.y4zvwwe.mongodb.net:27017/basedatos?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority');
}

// Función para configurar DNS alternativo
function configureDNS() {
  console.log('\n🌐 CONFIGURANDO DNS ALTERNATIVO:');
  require('dns').setDefaultResultOrder('ipv4first');
  require('dns').setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  console.log('   ✅ DNS configurado para usar Google DNS');
}

// Ejecutar diagnóstico
if (require.main === module) {
  configureDNS();
  diagnoseMongoDB()
    .then(() => {
      console.log('\n✅ Diagnóstico completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error en diagnóstico:', error);
      process.exit(1);
    });
}

module.exports = { diagnoseMongoDB, configureDNS }; 