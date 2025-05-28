require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const checkDirectivos = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✅ Conectado a MongoDB');

    // Buscar todos los usuarios directivos
    const directivos = await User.find({ role: 'directivo' });
    
    console.log(`\n📊 Total de usuarios directivos: ${directivos.length}`);
    
    if (directivos.length > 0) {
      console.log('\n📋 Usuarios directivos encontrados:');
      directivos.forEach((user, index) => {
        console.log(`   ${index + 1}. Email: ${user.email}`);
        console.log(`      Nombre: ${user.name}`);
        console.log(`      ID: ${user._id}`);
        console.log(`      Creado: ${user.createdAt}`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  No hay usuarios con rol directivo en la base de datos');
    }
    
    // Buscar específicamente directivo@ejemplo.com
    const specificUser = await User.findOne({ email: 'directivo@ejemplo.com' });
    if (specificUser) {
      console.log('✅ Usuario directivo@ejemplo.com encontrado');
    } else {
      console.log('❌ Usuario directivo@ejemplo.com NO encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error consultando base de datos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
checkDirectivos(); 