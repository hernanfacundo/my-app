require('dotenv').config();
const mongoose = require('mongoose');
const LearningPath = require('../models/LearningPath');

// Configuración del servidor
const getServerBaseUrl = () => {
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || 'localhost';
  return `http://${host}:${port}`;
};

// Videos específicos que quieres agregar
const specificVideos = [
  {
    pathTitle: 'Domina tu estrés: ¡Que no te gane la ansiedad!',
    video: {
      type: 'video',
      filename: 'Depresion y ansiedad.mp4',
      title: '🧘‍♀️ Video: Técnicas de Mindfulness'
    }
  },
  {
    pathTitle: 'Cuando la tristeza pesa demasiado',
    video: {
      type: 'video',
      filename: 'Duelo amoroso.mp4',
      title: '🎥 Video: Duelo de amor'
    }
  }
  // Agrega más videos específicos aquí...
];

async function addSpecificLocalVideos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Conectado a MongoDB');

    const serverBaseUrl = getServerBaseUrl();
    console.log(`🌐 URL base: ${serverBaseUrl}`);

    for (const item of specificVideos) {
      console.log(`\n📚 Procesando: "${item.pathTitle}"`);
      
      const learningPath = await LearningPath.findOne({ title: item.pathTitle });
      
      if (!learningPath) {
        console.log(`❌ Learning path no encontrado`);
        continue;
      }

      const videoUrl = `${serverBaseUrl}/public/learning-paths/${item.video.filename}`;
      
      // Verificar si ya existe
      const videoExists = learningPath.resources.some(
        resource => resource.url === videoUrl
      );
      
      if (!videoExists) {
        learningPath.resources.push({
          type: item.video.type,
          url: videoUrl,
          title: item.video.title
        });
        
        await learningPath.save();
        console.log(`✅ Video agregado: "${item.video.title}"`);
      } else {
        console.log(`⚠️  Video ya existe`);
      }
    }

    console.log('\n🎉 Videos específicos agregados exitosamente!');
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addSpecificLocalVideos(); 