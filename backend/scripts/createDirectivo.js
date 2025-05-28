require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createDirectivo = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✅ Conectado a MongoDB');

    // Datos del directivo de prueba
    const directivoData = {
      email: 'directivo@test.com',
      password: 'directivo123',
      name: 'Director de Prueba',
      role: 'directivo'
    };

    // Verificar si ya existe
    const existingUser = await User.findOne({ email: directivoData.email });
    if (existingUser) {
      console.log('⚠️  El usuario directivo ya existe:', directivoData.email);
      console.log('   Rol actual:', existingUser.role);
      
      // Si existe pero no es directivo, actualizar el rol
      if (existingUser.role !== 'directivo') {
        existingUser.role = 'directivo';
        await existingUser.save();
        console.log('✅ Rol actualizado a directivo');
      }
    } else {
      // Crear nuevo usuario directivo
      const hashedPassword = await bcrypt.hash(directivoData.password, 10);
      
      const directivo = new User({
        email: directivoData.email,
        password: hashedPassword,
        name: directivoData.name,
        role: directivoData.role
      });

      await directivo.save();
      console.log('✅ Usuario directivo creado exitosamente');
    }

    console.log('\n📋 Credenciales de acceso:');
    console.log('   Email:', directivoData.email);
    console.log('   Password:', directivoData.password);
    console.log('   Rol: directivo');
    
    console.log('\n🚀 Puedes usar estas credenciales para probar el panel directivo');

  } catch (error) {
    console.error('❌ Error creando usuario directivo:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar el script
createDirectivo(); 