require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const updateDirectivoPassword = async () => {
  try {
    console.log('🚀 Iniciando actualización de contraseña...');
    
    // Conectar a MongoDB
    console.log('📡 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar el usuario directivo
    console.log('🔍 Buscando usuario directivo@ejemplo.com...');
    const directivo = await User.findOne({ email: 'directivo@ejemplo.com' });
    
    if (!directivo) {
      console.log('❌ No se encontró el usuario directivo@ejemplo.com');
      console.log('🔍 Buscando usuarios directivos existentes...');
      
      const directivos = await User.find({ role: 'directivo' });
      if (directivos.length > 0) {
        console.log('📋 Usuarios directivos encontrados:');
        directivos.forEach(user => {
          console.log(`   - ${user.email} (${user.name})`);
        });
      } else {
        console.log('⚠️  No hay usuarios con rol directivo en la base de datos');
      }
      return;
    }

    console.log(`✅ Usuario encontrado: ${directivo.name} (${directivo.email})`);

    // Hashear la nueva contraseña
    console.log('🔒 Hasheando nueva contraseña...');
    const newPassword = '12345';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('✅ Contraseña hasheada');
    
    // Actualizar la contraseña
    console.log('💾 Actualizando contraseña en la base de datos...');
    directivo.password = hashedPassword;
    await directivo.save();
    
    console.log('✅ Contraseña actualizada exitosamente');
    console.log('\n📋 Credenciales actualizadas:');
    console.log('   Email: directivo@ejemplo.com');
    console.log('   Password: 12345');
    console.log('   Rol: directivo');
    console.log('\n🎉 ¡Listo! Puedes usar estas credenciales para iniciar sesión');
    
  } catch (error) {
    console.error('❌ Error actualizando contraseña:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    console.log('🔌 Desconectando de MongoDB...');
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
console.log('🎯 Script de actualización de contraseña iniciado');
updateDirectivoPassword(); 