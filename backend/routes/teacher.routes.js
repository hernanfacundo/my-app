const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyTeacher } = require('../middleware/teacher.middleware');
const Mood = require('../models/Mood');
const User = require('../models/User');
const Class = require('../models/Class');
const Capsula = require('../models/Capsula');
const CapsulaInteraccion = require('../models/CapsulaInteraccion');

// Función auxiliar para calcular estadísticas de clima emocional
const calcularEstadisticasClima = (moods) => {
  if (moods.length === 0) return null;
  
  // Mapeo de moods a valores numéricos
  const moodValues = {
    'Excelente': 5,
    'Muy bien': 4, 
    'Bien': 3,
    'Más o menos': 2,
    'No tan bien': 1
  };
  
  // Calcular promedio
  const totalValue = moods.reduce((sum, mood) => {
    return sum + (moodValues[mood.mood] || 2.5);
  }, 0);
  
  const promedio = totalValue / moods.length;
  
  // Determinar clima general
  let clima = '';
  if (promedio >= 4.5) clima = 'Excelente';
  else if (promedio >= 3.5) clima = 'Muy positivo';
  else if (promedio >= 2.5) clima = 'Positivo';
  else if (promedio >= 1.5) clima = 'Regular';
  else clima = 'Necesita atención';
  
  // Contar por categorías
  const distribucion = {};
  moods.forEach(mood => {
    distribucion[mood.mood] = (distribucion[mood.mood] || 0) + 1;
  });
  
  // Emociones más frecuentes
  const emociones = {};
  moods.forEach(mood => {
    if (mood.emotion) {
      emociones[mood.emotion] = (emociones[mood.emotion] || 0) + 1;
    }
  });
  
  const emocionPredominante = Object.entries(emociones)
    .sort(([,a], [,b]) => b - a)[0];
  
  return {
    clima,
    promedio: Math.round(promedio * 10) / 10,
    totalRegistros: moods.length,
    distribucion,
    emocionPredominante: emocionPredominante ? {
      nombre: emocionPredominante[0],
      cantidad: emocionPredominante[1]
    } : null
  };
};

// Endpoint para obtener análisis de alertas críticas de las clases del docente
router.get('/alertas-criticas', verifyTeacher, async (req, res) => {
  try {
    console.log('👨‍🏫 [Teacher] Analizando alertas críticas de mis clases...');
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    const startOfPeriod = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());
    
    // 1. Obtener las clases del docente
    const clasesDocente = await Class.find({ docenteId: req.user.id });
    console.log(`📚 [Teacher] Encontradas ${clasesDocente.length} clases asignadas`);
    
    if (clasesDocente.length === 0) {
      return res.json({
        success: true,
        data: {
          resumen: {
            totalClases: 0,
            totalEstudiantes: 0,
            alertasCriticas: 0,
            porcentajeAlertasCriticas: 0
          },
          clases: [],
          mensaje: 'No tienes clases asignadas'
        }
      });
    }
    
    const analisisPorClase = [];
    let totalEstudiantes = 0;
    let totalAlertasCriticas = 0;
    
    for (const clase of clasesDocente) {
      // 2. Obtener estudiantes de cada clase
      const estudiantes = await User.find({ 
        classId: clase._id,
        role: 'student'
      });
      
      totalEstudiantes += estudiantes.length;
      const studentIds = estudiantes.map(e => e._id);
      
      if (studentIds.length === 0) {
        console.log(`⚠️  [Teacher] Clase ${clase.name} sin estudiantes`);
        analisisPorClase.push({
          clase: {
            id: clase._id,
            nombre: clase.name,
            codigo: clase.code,
            totalEstudiantes: 0
          },
          alertas: {
            hoy: [],
            periodo7Dias: [],
            totalCriticas: 0,
            porcentajeCritico: 0
          },
          clima: null,
          recomendaciones: ['No hay estudiantes en esta clase']
        });
        continue;
      }
      
      // 3. Obtener moods del día de hoy
      const moodsHoy = await Mood.find({
        userId: { $in: studentIds },
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      }).populate('userId', 'name');
      
      // 4. Obtener moods de los últimos 7 días
      const moodsPeriodo = await Mood.find({
        userId: { $in: studentIds },
        createdAt: { $gte: startOfPeriod, $lt: endOfDay }
      }).populate('userId', 'name');
      
      // 5. Identificar alertas críticas
      const moodsCriticosHoy = moodsHoy.filter(mood => 
        ['No tan bien', 'Más o menos'].includes(mood.mood)
      );
      
      const moodsCriticosPeriodo = moodsPeriodo.filter(mood => 
        ['No tan bien', 'Más o menos'].includes(mood.mood)
      );
      
      // 6. Agregar alertas críticas al conteo total
      totalAlertasCriticas += moodsCriticosHoy.length;
      
      // 7. Calcular estadísticas de clima
      const climaAnalisis = calcularEstadisticasClima(moodsHoy);
      
      // 8. Generar recomendaciones específicas
      const recomendaciones = [];
      const porcentajeCritico = moodsHoy.length > 0 ? 
        Math.round((moodsCriticosHoy.length / moodsHoy.length) * 100) : 0;
      
      if (porcentajeCritico > 50) {
        recomendaciones.push('🚨 URGENTE: Más del 50% de registros son críticos');
        recomendaciones.push('📞 Contactar al directivo inmediatamente');
        recomendaciones.push('👥 Convocar reunión de emergencia con padres');
      } else if (porcentajeCritico > 30) {
        recomendaciones.push('⚠️ Situación preocupante: Revisar estrategias de apoyo');
        recomendaciones.push('🗣️ Conversar individualmente con estudiantes afectados');
      } else if (porcentajeCritico > 10) {
        recomendaciones.push('👁️ Monitorear de cerca a estudiantes específicos');
        recomendaciones.push('🤝 Implementar actividades de bienestar grupal');
      } else {
        recomendaciones.push('✅ Clase en buen estado emocional');
        recomendaciones.push('🎯 Continuar con estrategias actuales');
      }
      
      // 9. Identificar estudiantes con múltiples alertas
      const estudiantesConAlertasMultiples = {};
      moodsCriticosPeriodo.forEach(mood => {
        const studentId = mood.userId._id.toString();
        if (!estudiantesConAlertasMultiples[studentId]) {
          estudiantesConAlertasMultiples[studentId] = {
            nombre: mood.userId.name,
            alertas: []
          };
        }
        estudiantesConAlertasMultiples[studentId].alertas.push({
          fecha: mood.createdAt,
          mood: mood.mood,
          emocion: mood.emotion,
          comentario: mood.comment
        });
      });
      
      // Filtrar estudiantes con 2 o más alertas en 7 días
      const estudiantesRiesgo = Object.values(estudiantesConAlertasMultiples)
        .filter(estudiante => estudiante.alertas.length >= 2);
      
      analisisPorClase.push({
        clase: {
          id: clase._id,
          nombre: clase.name,
          codigo: clase.code,
          totalEstudiantes: estudiantes.length
        },
        alertas: {
          hoy: moodsCriticosHoy.map(mood => ({
            estudianteId: mood.userId._id,
            estudiante: mood.userId.name,
            mood: mood.mood,
            emocion: mood.emotion,
            comentario: mood.comment,
            hora: mood.createdAt,
            severidad: mood.mood === 'No tan bien' ? 'ALTA' : 'MEDIA'
          })),
          periodo7Dias: moodsCriticosPeriodo.length,
          totalCriticas: moodsCriticosHoy.length,
          porcentajeCritico,
          estudiantesEnRiesgo: estudiantesRiesgo
        },
        clima: climaAnalisis,
        participacion: {
          registrosHoy: moodsHoy.length,
          registros7Dias: moodsPeriodo.length,
          porcentajeParticipacionHoy: estudiantes.length > 0 ? 
            Math.round((new Set(moodsHoy.map(m => m.userId._id.toString())).size / estudiantes.length) * 100) : 0
        },
        recomendaciones
      });
      
      console.log(`📊 [Teacher] ${clase.name}: ${moodsCriticosHoy.length} alertas críticas hoy`);
    }
    
    // 10. Generar resumen general
    const resumen = {
      totalClases: clasesDocente.length,
      totalEstudiantes,
      alertasCriticas: totalAlertasCriticas,
      porcentajeAlertasCriticas: totalEstudiantes > 0 ? 
        Math.round((totalAlertasCriticas / totalEstudiantes) * 100) : 0,
      fecha: today.toISOString().split('T')[0]
    };
    
    console.log(`✅ [Teacher] Análisis completado: ${totalAlertasCriticas} alertas críticas encontradas`);
    
    res.json({
      success: true,
      data: {
        resumen,
        clases: analisisPorClase,
        docente: {
          id: req.user.id,
          nombre: req.user.name,
          email: req.user.email
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error en análisis de alertas para docente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al analizar alertas críticas'
    });
  }
});

// Endpoint de prueba para verificar acceso del docente
router.get('/test', verifyTeacher, async (req, res) => {
  try {
    res.json({
      success: true,
      message: '¡Acceso de docente verificado correctamente!',
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en endpoint de prueba docente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ==========================================
// 🧘‍♂️ RUTAS DE CÁPSULAS DE AUTOCUIDADO
// ==========================================

// Obtener cápsulas disponibles con recomendaciones personalizadas
router.get('/capsulas', verifyTeacher, async (req, res) => {
  try {
    console.log('🧘‍♂️ [Teacher] Obteniendo cápsulas de autocuidado...');
    
    const { categoria, estadoEmocional, limite = 20 } = req.query;
    const docenteId = req.user.id;
    
    // 1. Filtros base
    const filtros = { visibilidad: true };
    
    if (categoria) {
      filtros.categoria = categoria;
    }
    
    // 2. Si se especifica estado emocional, filtrar por emociones relacionadas
    if (estadoEmocional) {
      filtros.emocionesRelacionadas = { $in: [estadoEmocional] };
    }
    
    // 3. Obtener cápsulas
    const capsulas = await Capsula.find(filtros)
      .sort({ fechaPublicacion: -1 })
      .limit(parseInt(limite));
    
    // 4. Obtener interacciones del docente para cada cápsula
    const capsulaIds = capsulas.map(c => c._id);
    const interacciones = await CapsulaInteraccion.find({
      docenteId,
      capsulaId: { $in: capsulaIds }
    });
    
    // 5. Crear mapa de interacciones por cápsula
    const interaccionesPorCapsula = {};
    interacciones.forEach(int => {
      const capsulaId = int.capsulaId.toString();
      if (!interaccionesPorCapsula[capsulaId]) {
        interaccionesPorCapsula[capsulaId] = {};
      }
      interaccionesPorCapsula[capsulaId][int.tipoInteraccion] = true;
    });
    
    // 6. Enriquecer cápsulas con información de interacciones
    const capsulasProcesadas = capsulas.map(capsula => {
      const capsulaId = capsula._id.toString();
      const interaccionesDelDocente = interaccionesPorCapsula[capsulaId] || {};
      
      return {
        ...capsula.toObject(),
        yaVista: !!interaccionesDelDocente.vista,
        meGusta: !!interaccionesDelDocente.like,
        noMeGusta: !!interaccionesDelDocente.dislike,
        guardada: !!interaccionesDelDocente.guardada,
        completada: !!interaccionesDelDocente.completada
      };
    });
    
    // 7. Sistema básico de recomendaciones
    let recomendaciones = [];
    if (!categoria && !estadoEmocional) {
      // Obtener últimas interacciones para recomendaciones
      const ultimasInteracciones = await CapsulaInteraccion.find({
        docenteId,
        tipoInteraccion: { $in: ['like', 'completada'] }
      })
      .populate('capsulaId', 'categoria emocionesRelacionadas')
      .sort({ fechaInteraccion: -1 })
      .limit(5);
      
      // Recomendar cápsulas similares a las que le gustaron
      if (ultimasInteracciones.length > 0) {
        const categoriasPreferidas = [...new Set(
          ultimasInteracciones.map(int => int.capsulaId.categoria)
        )];
        
        recomendaciones = await Capsula.find({
          visibilidad: true,
          categoria: { $in: categoriasPreferidas },
          _id: { $nin: capsulaIds } // Excluir las ya obtenidas
        })
        .sort({ totalLikes: -1 })
        .limit(5);
      }
    }
    
    console.log(`✅ [Teacher] ${capsulas.length} cápsulas obtenidas, ${recomendaciones.length} recomendaciones`);
    
    res.json({
      success: true,
      data: {
        capsulas: capsulasProcesadas,
        recomendaciones: recomendaciones,
        filtros: {
          categoria,
          estadoEmocional,
          aplicados: Object.keys(filtros).length > 1
        },
        estadisticas: {
          totalDisponibles: await Capsula.countDocuments({ visibilidad: true }),
          vistasDelDocente: interacciones.filter(i => i.tipoInteraccion === 'vista').length,
          guardadas: interacciones.filter(i => i.tipoInteraccion === 'guardada').length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo cápsulas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cápsulas de autocuidado'
    });
  }
});

// Obtener detalle específico de una cápsula
router.get('/capsulas/:capsulaId', verifyTeacher, async (req, res) => {
  try {
    const { capsulaId } = req.params;
    const docenteId = req.user.id;
    
    console.log(`🔍 [Teacher] Obteniendo detalle de cápsula ${capsulaId}...`);
    
    // 1. Buscar la cápsula
    const capsula = await Capsula.findOne({
      _id: capsulaId,
      visibilidad: true
    });
    
    if (!capsula) {
      return res.status(404).json({
        success: false,
        message: 'Cápsula no encontrada'
      });
    }
    
    // 2. Registrar visualización
    try {
      await CapsulaInteraccion.findOneAndUpdate(
        { docenteId, capsulaId, tipoInteraccion: 'vista' },
        { 
          docenteId, 
          capsulaId, 
          tipoInteraccion: 'vista',
          fechaInteraccion: new Date()
        },
        { upsert: true }
      );
      
      // Incrementar contador de visualizaciones
      await Capsula.findByIdAndUpdate(capsulaId, {
        $inc: { totalVisualizaciones: 1 }
      });
      
    } catch (interactionError) {
      console.log('Interacción ya registrada o error menor:', interactionError.message);
    }
    
    // 3. Obtener interacciones existentes del docente
    const interacciones = await CapsulaInteraccion.find({
      docenteId,
      capsulaId
    });
    
    const interaccionesMap = {};
    interacciones.forEach(int => {
      interaccionesMap[int.tipoInteraccion] = true;
    });
    
    // 4. Obtener cápsulas relacionadas
    const relacionadas = await Capsula.find({
      visibilidad: true,
      _id: { $ne: capsulaId },
      $or: [
        { categoria: capsula.categoria },
        { emocionesRelacionadas: { $in: capsula.emocionesRelacionadas } }
      ]
    })
    .sort({ totalLikes: -1 })
    .limit(3);
    
    const resultado = {
      ...capsula.toObject(),
      yaVista: true, // Siempre true porque se acaba de registrar
      meGusta: !!interaccionesMap.like,
      noMeGusta: !!interaccionesMap.dislike,
      guardada: !!interaccionesMap.guardada,
      completada: !!interaccionesMap.completada,
      relacionadas
    };
    
    console.log(`✅ [Teacher] Detalle de cápsula obtenido`);
    
    res.json({
      success: true,
      data: resultado
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo detalle de cápsula:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de la cápsula'
    });
  }
});

// Registrar interacción con una cápsula (like, dislike, guardar, completar)
router.post('/capsulas/:capsulaId/interaccion', verifyTeacher, async (req, res) => {
  try {
    const { capsulaId } = req.params;
    const { tipoInteraccion, tiempoVisualizacion, estadoEmocionalPrevio, comentario, valoracion } = req.body;
    const docenteId = req.user.id;
    
    console.log(`💫 [Teacher] Registrando interacción ${tipoInteraccion} en cápsula ${capsulaId}`);
    
    // 1. Validar tipo de interacción
    const tiposValidos = ['like', 'dislike', 'guardada', 'completada'];
    if (!tiposValidos.includes(tipoInteraccion)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de interacción no válido'
      });
    }
    
    // 2. Verificar que la cápsula existe
    const capsula = await Capsula.findOne({
      _id: capsulaId,
      visibilidad: true
    });
    
    if (!capsula) {
      return res.status(404).json({
        success: false,
        message: 'Cápsula no encontrada'
      });
    }
    
    // 3. Para like/dislike, eliminar la interacción opuesta si existe
    if (tipoInteraccion === 'like' || tipoInteraccion === 'dislike') {
      const tipoOpuesto = tipoInteraccion === 'like' ? 'dislike' : 'like';
      await CapsulaInteraccion.deleteOne({
        docenteId,
        capsulaId,
        tipoInteraccion: tipoOpuesto
      });
    }
    
    // 4. Registrar o actualizar la interacción
    const interaccion = await CapsulaInteraccion.findOneAndUpdate(
      { docenteId, capsulaId, tipoInteraccion },
      {
        docenteId,
        capsulaId,
        tipoInteraccion,
        fechaInteraccion: new Date(),
        ...(tiempoVisualizacion && { tiempoVisualizacion }),
        ...(estadoEmocionalPrevio && { estadoEmocionalPrevio }),
        ...(comentario && { comentario }),
        ...(valoracion && { valoracion }),
        ...(tipoInteraccion === 'completada' && { completado: true })
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );
    
    // 5. Actualizar contadores en la cápsula
    const updateCapsula = {};
    switch (tipoInteraccion) {
      case 'like':
        updateCapsula.$inc = { totalLikes: 1 };
        break;
      case 'dislike':
        updateCapsula.$inc = { totalDislikes: 1 };
        break;
      case 'guardada':
        updateCapsula.$inc = { totalGuardadas: 1 };
        break;
    }
    
    if (Object.keys(updateCapsula).length > 0) {
      await Capsula.findByIdAndUpdate(capsulaId, updateCapsula);
    }
    
    console.log(`✅ [Teacher] Interacción ${tipoInteraccion} registrada exitosamente`);
    
    res.json({
      success: true,
      data: {
        interaccion,
        mensaje: `${tipoInteraccion} registrado exitosamente`
      }
    });
    
  } catch (error) {
    console.error('❌ Error registrando interacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar interacción'
    });
  }
});

// Eliminar interacción (des-guardar, quitar like, etc.)
router.delete('/capsulas/:capsulaId/interaccion/:tipoInteraccion', verifyTeacher, async (req, res) => {
  try {
    const { capsulaId, tipoInteraccion } = req.params;
    const docenteId = req.user.id;
    
    console.log(`🗑️ [Teacher] Eliminando interacción ${tipoInteraccion} de cápsula ${capsulaId}`);
    
    // 1. Eliminar la interacción
    const resultado = await CapsulaInteraccion.deleteOne({
      docenteId,
      capsulaId,
      tipoInteraccion
    });
    
    if (resultado.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Interacción no encontrada'
      });
    }
    
    // 2. Actualizar contadores en la cápsula
    const updateCapsula = {};
    switch (tipoInteraccion) {
      case 'like':
        updateCapsula.$inc = { totalLikes: -1 };
        break;
      case 'dislike':
        updateCapsula.$inc = { totalDislikes: -1 };
        break;
      case 'guardada':
        updateCapsula.$inc = { totalGuardadas: -1 };
        break;
    }
    
    if (Object.keys(updateCapsula).length > 0) {
      await Capsula.findByIdAndUpdate(capsulaId, updateCapsula);
    }
    
    console.log(`✅ [Teacher] Interacción eliminada exitosamente`);
    
    res.json({
      success: true,
      message: 'Interacción eliminada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error eliminando interacción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar interacción'
    });
  }
});

// Obtener cápsulas guardadas del docente
router.get('/capsulas-guardadas', verifyTeacher, async (req, res) => {
  try {
    const docenteId = req.user.id;
    
    console.log('💾 [Teacher] Obteniendo cápsulas guardadas...');
    
    // 1. Obtener interacciones de tipo 'guardada'
    const capsulaGuardadas = await CapsulaInteraccion.find({
      docenteId,
      tipoInteraccion: 'guardada'
    })
    .populate('capsulaId')
    .sort({ fechaInteraccion: -1 });
    
    // 2. Filtrar solo las cápsulas válidas y visibles
    const capsulasValidas = capsulaGuardadas
      .filter(interaccion => 
        interaccion.capsulaId && 
        interaccion.capsulaId.visibilidad
      )
      .map(interaccion => ({
        ...interaccion.capsulaId.toObject(),
        fechaGuardada: interaccion.fechaInteraccion,
        guardada: true,
        yaVista: true
      }));
    
    console.log(`✅ [Teacher] ${capsulasValidas.length} cápsulas guardadas obtenidas`);
    
    res.json({
      success: true,
      data: {
        capsulas: capsulasValidas,
        total: capsulasValidas.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo cápsulas guardadas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener cápsulas guardadas'
    });
  }
});

// Obtener estadísticas de uso de cápsulas del docente
router.get('/capsulas-estadisticas', verifyTeacher, async (req, res) => {
  try {
    const docenteId = req.user.id;
    
    console.log('📊 [Teacher] Generando estadísticas de uso de cápsulas...');
    
    // 1. Contar interacciones por tipo
    const interacciones = await CapsulaInteraccion.aggregate([
      { $match: { docenteId: new mongoose.Types.ObjectId(docenteId) } },
      { $group: { 
          _id: '$tipoInteraccion',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const stats = {};
    interacciones.forEach(int => {
      stats[int._id] = int.count;
    });
    
    // 2. Cápsulas completadas en los últimos 30 días
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const completadasRecientes = await CapsulaInteraccion.countDocuments({
      docenteId,
      tipoInteraccion: 'completada',
      fechaInteraccion: { $gte: hace30Dias }
    });
    
    // 3. Categorías más consumidas
    const categoriasMasConsumidas = await CapsulaInteraccion.aggregate([
      { $match: { 
          docenteId: new mongoose.Types.ObjectId(docenteId),
          tipoInteraccion: { $in: ['vista', 'completada'] }
        }
      },
      { $lookup: {
          from: 'capsulas',
          localField: 'capsulaId',
          foreignField: '_id',
          as: 'capsula'
        }
      },
      { $unwind: '$capsula' },
      { $group: {
          _id: '$capsula.categoria',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // 4. Tiempo total estimado de uso (aproximado)
    const tiempoTotal = await CapsulaInteraccion.aggregate([
      { $match: { 
          docenteId: new mongoose.Types.ObjectId(docenteId),
          tipoInteraccion: 'completada'
        }
      },
      { $lookup: {
          from: 'capsulas',
          localField: 'capsulaId',
          foreignField: '_id',
          as: 'capsula'
        }
      },
      { $unwind: '$capsula' },
      { $group: {
          _id: null,
          tiempoTotal: { $sum: '$capsula.duracion' }
        }
      }
    ]);
    
    const estadisticas = {
      interacciones: {
        vistas: stats.vista || 0,
        completadas: stats.completada || 0,
        likes: stats.like || 0,
        guardadas: stats.guardada || 0
      },
      actividad: {
        completadasUltimos30Dias: completadasRecientes,
        tiempoTotalMinutos: tiempoTotal[0]?.tiempoTotal || 0
      },
      preferencias: {
        categoriasFavoritas: categoriasMasConsumidas
      }
    };
    
    console.log('✅ [Teacher] Estadísticas generadas exitosamente');
    
    res.json({
      success: true,
      data: estadisticas
    });
    
  } catch (error) {
    console.error('❌ Error generando estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar estadísticas'
    });
  }
});

module.exports = router; 