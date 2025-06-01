require('dotenv').config();
const mongoose = require('mongoose');
const LearningPath = require('../models/LearningPath');
const fs = require('fs');
const path = require('path');

// Configuración del servidor
const getServerBaseUrl = () => {
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || 'localhost';
  return `http://${host}:${port}`;
};

// Mapeo completo de todos los recursos disponibles
const allResourcesMapping = [
  {
    title: 'Domina tu estrés: ¡Que no te gane la ansiedad!',
    resources: [
      {
        type: 'video',
        filename: 'Depresion y ansiedad.mp4',
        title: '🧘‍♀️ Manejo de la Depresión y Ansiedad'
      },
      {
        type: 'video',
        filename: 'mindfulness-video1.mp4',
        title: '🌟 Técnicas de Mindfulness para el Estrés'
      },
      {
        type: 'audio',
        filename: 'mindfulness-audio1.mpeg',
        title: '🎵 Meditación Guiada Anti-Estrés'
      },
      {
        type: 'pdf',
        filename: 'mindfulness-doc1.pdf',
        title: '📄 Guía Completa de Mindfulness'
      }
    ]
  },
  {
    title: 'Cuando la tristeza pesa demasiado',
    resources: [
      {
        type: 'video',
        filename: 'Duelo amoroso.mp4',
        title: '💔 Superando el Duelo Amoroso'
      },
      {
        type: 'video',
        filename: 'Depresion y ansiedad.mp4',
        title: '💙 Entendiendo la Depresión y Tristeza'
      },
      {
        type: 'video',
        filename: 'que-son-las-emociones-video1.mp4',
        title: '🎥 ¿Qué son las Emociones?'
      },
      {
        type: 'pdf',
        filename: 'que-son-las-emociones-doc1.pdf',
        title: '📄 Guía: Entendiendo las Emociones'
      }
    ]
  },
  {
    title: 'Eres suficiente: descubre tu verdadero valor',
    resources: [
      {
        type: 'video',
        filename: 'mindfulness-video1.mp4',
        title: '✨ Mindfulness para la Autoestima'
      },
      {
        type: 'video',
        filename: 'que-son-las-emociones-video1.mp4',
        title: '🌟 Emociones y Autovaloración'
      },
      {
        type: 'pdf',
        filename: 'mindfulness-doc1.pdf',
        title: '📄 Ejercicios de Autoconocimiento'
      }
    ]
  },
  {
    title: 'La violencia no es normal: levanta tu voz',
    resources: [
      {
        type: 'video',
        filename: 'que-son-las-emociones-video1.mp4',
        title: '🚨 Reconociendo Emociones en Situaciones Difíciles'
      },
      {
        type: 'pdf',
        filename: 'que-son-las-emociones-doc1.pdf',
        title: '📄 Guía: Emociones y Situaciones de Riesgo'
      }
    ]
  },
  {
    title: 'Acepta tu cuerpo, cambia tu vida',
    resources: [
      {
        type: 'video',
        filename: 'mindfulness-video1.mp4',
        title: '💖 Mindfulness y Aceptación Corporal'
      },
      {
        type: 'pdf',
        filename: 'mindfulness-doc1.pdf',
        title: '📄 Ejercicios de Autoaceptación'
      }
    ]
  },
  {
    title: 'Recupera tus ganas de estudiar',
    resources: [
      {
        type: 'video',
        filename: 'que-son-las-emociones-video1.mp4',
        title: '🎯 Emociones y Motivación para Estudiar'
      },
      {
        type: 'video',
        filename: 'mindfulness-video1.mp4',
        title: '📚 Mindfulness para la Concentración'
      },
      {
        type: 'audio',
        filename: 'mindfulness-audio1.mpeg',
        title: '🎵 Música de Concentración'
      }
    ]
  },
  {
    title: 'Adiós al pánico por los exámenes',
    resources: [
      {
        type: 'video',
        filename: 'Depresion y ansiedad.mp4',
        title: '😰 Venciendo la Ansiedad ante Exámenes'
      },
      {
        type: 'video',
        filename: 'mindfulness-video1.mp4',
        title: '🧘 Técnicas de Relajación Pre-Examen'
      },
      {
        type: 'audio',
        filename: 'mindfulness-audio1.mpeg',
        title: '🎵 Meditación para Calmar Nervios'
      }
    ]
  },
  {
    title: 'Concéntrate más, sufre menos',
    resources: [
      {
        type: 'video',
        filename: 'mindfulness-video1.mp4',
        title: '🧠 Mindfulness para la Concentración'
      },
      {
        type: 'audio',
        filename: 'mindfulness-audio1.mpeg',
        title: '🎵 Ejercicio de Concentración Guiada'
      },
      {
        type: 'pdf',
        filename: 'mindfulness-doc1.pdf',
        title: '📄 Técnicas de Concentración'
      }
    ]
  },
  {
    title: '¿Te hacen bullying? No estás solo',
    resources: [
      {
        type: 'video',
        filename: 'que-son-las-emociones-video1.mp4',
        title: '🛑 Entendiendo las Emociones en el Bullying'
      },
      {
        type: 'video',
        filename: 'Depresion y ansiedad.mp4',
        title: '💪 Fortaleza Emocional ante el Acoso'
      },
      {
        type: 'pdf',
        filename: 'que-son-las-emociones-doc1.pdf',
        title: '📄 Guía: Emociones y Bullying'
      }
    ]
  },
  {
    title: '¿Problemas para aprender? Descubre cómo mejorar',
    resources: [
      {
        type: 'video',
        filename: 'que-son-las-emociones-video1.mp4',
        title: '🧠 Emociones y Aprendizaje'
      },
      {
        type: 'video',
        filename: 'mindfulness-video1.mp4',
        title: '🎯 Mindfulness para Mejorar el Aprendizaje'
      },
      {
        type: 'pdf',
        filename: 'mindfulness-doc1.pdf',
        title: '📄 Estrategias de Aprendizaje Consciente'
      }
    ]
  }
];

// Función para verificar si un archivo existe
const fileExists = (filename) => {
  const filePath = path.join(__dirname, '../public/learning-paths', filename);
  return fs.existsSync(filePath);
};

async function addAllLocalVideos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Conectado a MongoDB');

    const serverBaseUrl = getServerBaseUrl();
    console.log(`🌐 URL base del servidor: ${serverBaseUrl}`);

    let updatedCount = 0;
    let addedResourcesCount = 0;
    let skippedResourcesCount = 0;

    for (const pathData of allResourcesMapping) {
      console.log(`\n📚 Procesando: "${pathData.title}"`);
      
      // Buscar el learning path
      const learningPath = await LearningPath.findOne({ title: pathData.title });
      
      if (!learningPath) {
        console.log(`⚠️  Learning path no encontrado: "${pathData.title}"`);
        continue;
      }

      // Procesar cada recurso
      for (const resource of pathData.resources) {
        // Verificar si el archivo existe
        if (!fileExists(resource.filename)) {
          console.log(`❌ Archivo no encontrado: ${resource.filename}`);
          skippedResourcesCount++;
          continue;
        }

        // Crear la URL completa
        const resourceUrl = `${serverBaseUrl}/public/learning-paths/${resource.filename}`;
        
        // Verificar si el recurso ya existe
        const resourceExists = learningPath.resources.some(
          existingResource => existingResource.url === resourceUrl
        );

        if (!resourceExists) {
          // Agregar el recurso
          learningPath.resources.push({
            type: resource.type,
            url: resourceUrl,
            title: resource.title
          });
          
          console.log(`✅ Agregado: ${resource.title} (${resource.type})`);
          addedResourcesCount++;
        } else {
          console.log(`⚠️  Ya existe: ${resource.title}`);
          skippedResourcesCount++;
        }
      }

      // Guardar los cambios
      await learningPath.save();
      updatedCount++;
    }

    console.log(`\n🎉 Proceso completado!`);
    console.log(`📊 Learning paths actualizados: ${updatedCount}`);
    console.log(`📁 Recursos agregados: ${addedResourcesCount}`);
    console.log(`⏭️  Recursos omitidos: ${skippedResourcesCount}`);

    // Mostrar estadísticas finales
    const allPaths = await LearningPath.find();
    const totalResources = allPaths.reduce((total, path) => total + path.resources.length, 0);
    const totalVideos = allPaths.reduce((total, path) => {
      return total + path.resources.filter(r => r.type === 'video').length;
    }, 0);
    const totalAudios = allPaths.reduce((total, path) => {
      return total + path.resources.filter(r => r.type === 'audio').length;
    }, 0);
    const totalPdfs = allPaths.reduce((total, path) => {
      return total + path.resources.filter(r => r.type === 'pdf').length;
    }, 0);

    console.log(`\n📈 Estadísticas finales:`);
    console.log(`🎥 Videos: ${totalVideos}`);
    console.log(`🎵 Audios: ${totalAudios}`);
    console.log(`📄 PDFs: ${totalPdfs}`);
    console.log(`📁 Total recursos: ${totalResources}`);

    // Mostrar algunos learning paths con sus recursos
    console.log(`\n📋 Muestra de learning paths con recursos:`);
    for (let i = 0; i < Math.min(3, allPaths.length); i++) {
      const path = allPaths[i];
      console.log(`\n"${path.title}"`);
      console.log(`   📁 ${path.resources.length} recursos:`);
      path.resources.forEach(resource => {
        console.log(`   ${resource.type === 'video' ? '🎥' : resource.type === 'audio' ? '🎵' : '📄'} ${resource.title}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar el script
addAllLocalVideos(); 