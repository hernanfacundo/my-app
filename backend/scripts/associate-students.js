require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Class = require('../models/Class');
const Membership = require('../models/Membership');

async function associateStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Obtener la clase existente
    const clase = await Class.findOne({ code: 'GRADO6A-2024' });
    if (!clase) {
      throw new Error('No se encontró la clase con código GRADO6A-2024');
    }

    // Obtener todos los alumnos
    const alumnos = await User.find({ role: 'student' });
    console.log(`Encontrados ${alumnos.length} alumnos`);

    // Crear membresías y actualizar alumnos
    const memberships = [];
    for (const alumno of alumnos) {
      // Crear membresía
      memberships.push({
        classId: clase._id,
        alumnoId: alumno._id
      });

      // Actualizar el classId del alumno
      await User.findByIdAndUpdate(alumno._id, { classId: clase._id });
      console.log(`Alumno ${alumno.name} asociado a la clase ${clase.name}`);
    }

    // Insertar todas las membresías
    await Membership.insertMany(memberships);

    console.log(`
    Asociación completada:
    - Clase: ${clase.name} (${clase.code})
    - Alumnos asociados: ${alumnos.length}
    `);

  } catch (error) {
    console.error('Error durante la asociación:', error);
  } finally {
    await mongoose.connection.close();
  }
}

associateStudents(); 