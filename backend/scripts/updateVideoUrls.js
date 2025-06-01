require('dotenv').config();
const mongoose = require('mongoose');
const LearningPath = require('../models/LearningPath');

// Configuración de URLs
//const OLD_BASE_URL = 'http://localhost:3000';

const NEW_BASE_URL = 'http://192.168.212.90:3000'; // IP de red actual
const OLD_BASE_URL = 'http://192.168.0.231:3000'; // IP de red actual

async function updateVideoUrls() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/new-app');
    console.log('Conectado a MongoDB');

    // Obtener todos los learning paths
    const learningPaths = await LearningPath.find({});
    console.log(`Encontrados ${learningPaths.length} learning paths`);

    let updatedCount = 0;

    for (const path of learningPaths) {
      let hasChanges = false;

      // Actualizar URLs en recursos
      if (path.resources && Array.isArray(path.resources)) {
        path.resources.forEach(resource => {
          if (resource.url && resource.url.includes(OLD_BASE_URL)) {
            console.log(`Actualizando URL: ${resource.url}`);
            resource.url = resource.url.replace(OLD_BASE_URL, NEW_BASE_URL);
            console.log(`Nueva URL: ${resource.url}`);
            hasChanges = true;
          }
        });
      }

      // Guardar si hay cambios
      if (hasChanges) {
        await path.save();
        updatedCount++;
        console.log(`✅ Actualizado: ${path.title}`);
      }
    }

    console.log(`\n🎉 Proceso completado:`);
    console.log(`- Learning paths procesados: ${learningPaths.length}`);
    console.log(`- Learning paths actualizados: ${updatedCount}`);
    console.log(`- URLs cambiadas de: ${OLD_BASE_URL}`);
    console.log(`- URLs cambiadas a: ${NEW_BASE_URL}`);

  } catch (error) {
    console.error('Error actualizando URLs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

// Ejecutar el script
updateVideoUrls(); 