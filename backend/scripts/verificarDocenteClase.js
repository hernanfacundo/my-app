require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');

const verificarDocenteClase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('📚 VERIFICANDO USUARIOS DOCENTES Y CLASES:');
    console.log('=' .repeat(50));
    
    // Buscar todos los usuarios docentes
    const docentes = await User.find({ role: 'teacher' });
    console.log(`👨‍🏫 Docentes encontrados: ${docentes.length}`);
    
    for (const docente of docentes) {
      console.log(`   • ${docente.name} (${docente.email}) - ID: ${docente._id}`);
    }
    
    // Buscar la clase 6to Grado A
    const clase6toA = await Class.findOne({ name: /6to.*Grado.*A/i }).populate('docenteId', 'name email');
    if (clase6toA) {
      console.log(`\n📚 Clase encontrada: ${clase6toA.name}`);
      console.log(`   • Código: ${clase6toA.code}`);
      console.log(`   • Docente: ${clase6toA.docenteId.name} (${clase6toA.docenteId.email})`);
      console.log(`   • ID del docente: ${clase6toA.docenteId._id}`);
      
      // Verificar si el docente puede hacer login
      console.log(`\n🔐 Credenciales para acceder como docente:`);
      console.log(`   Email: ${clase6toA.docenteId.email}`);
      console.log(`   Contraseña sugerida: 12345 (si fue creado con el script)`);
      
      // Buscar estudiantes de la clase
      const estudiantes = await User.find({ 
        classId: clase6toA._id,
        role: 'student'
      });
      console.log(`\n👥 Estudiantes en ${clase6toA.name}: ${estudiantes.length}`);
      
    } else {
      console.log(`❌ No se encontró la clase 6to Grado A`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

verificarDocenteClase(); 