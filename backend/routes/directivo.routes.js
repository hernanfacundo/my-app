const express = require('express');
const router = express.Router();
const { verifyDirectivo } = require('../middleware/directivo.middleware');
const Mood = require('../models/Mood');

// Endpoint de prueba para verificar que el rol directivo funciona
router.get('/test', verifyDirectivo, async (req, res) => {
  try {
    res.json({
      success: true,
      message: '¡Acceso de directivo verificado correctamente!',
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en endpoint de prueba directivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Endpoint para obtener información básica del directivo
router.get('/profile', verifyDirectivo, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil de directivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del perfil'
    });
  }
});

// Endpoint optimizado para dashboard completo
router.get('/dashboard-completo', verifyDirectivo, async (req, res) => {
  try {
    console.log('📊 [Directivo] Obteniendo dashboard completo...');
    
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    
    // Obtener datos de hoy
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Obtener datos de 7 días
    const startOfPeriod = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());
    const endOfPeriod = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    // Ejecutar consultas en paralelo para mejor rendimiento
    const [moodsHoy, moodsPeriodo] = await Promise.all([
      Mood.find({
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      }),
      Mood.find({
        createdAt: { $gte: startOfPeriod, $lt: endOfPeriod }
      }).sort({ createdAt: 1 })
    ]);
    
    console.log(`📈 [Directivo] Registros hoy: ${moodsHoy.length}, Período 7 días: ${moodsPeriodo.length}`);
    
    const MINIMO_REGISTROS = 15;
    
    // Preparar respuesta
    const response = {
      success: true,
      data: {
        climaHoy: {
          suficientesRegistros: moodsHoy.length >= MINIMO_REGISTROS,
          totalRegistros: moodsHoy.length,
          minimoRequerido: MINIMO_REGISTROS,
          fecha: today.toISOString().split('T')[0],
          clima: moodsHoy.length >= MINIMO_REGISTROS ? calcularEstadisticasClima(moodsHoy) : null
        },
        tendencias7Dias: {
          suficientesRegistros: moodsPeriodo.length >= MINIMO_REGISTROS,
          totalRegistros: moodsPeriodo.length,
          minimoRequerido: MINIMO_REGISTROS,
          periodo: {
            inicio: sevenDaysAgo.toISOString().split('T')[0],
            fin: today.toISOString().split('T')[0]
          },
          tendencias: moodsPeriodo.length >= MINIMO_REGISTROS ? calcularTendencias7Dias(moodsPeriodo, sevenDaysAgo, today) : null
        },
        ultimaActualizacion: new Date().toISOString()
      }
    };
    
    console.log('✅ [Directivo] Dashboard completo generado');
    res.json(response);
    
  } catch (error) {
    console.error('❌ [Directivo] Error generando dashboard completo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el dashboard completo'
    });
  }
});

// Endpoint para obtener tendencias de 7 días
router.get('/tendencias-7-dias', verifyDirectivo, async (req, res) => {
  try {
    console.log('📈 [Directivo] Calculando tendencias de 7 días...');
    
    // Obtener los últimos 7 días
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // Incluye hoy, así son 7 días
    
    console.log(`📅 [Directivo] Rango: ${sevenDaysAgo.toISOString().split('T')[0]} - ${today.toISOString().split('T')[0]}`);
    
    // Obtener todos los registros de los últimos 7 días
    const startOfPeriod = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());
    const endOfPeriod = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const moodsPeriodo = await Mood.find({
      createdAt: {
        $gte: startOfPeriod,
        $lt: endOfPeriod
      }
    }).sort({ createdAt: 1 });
    
    console.log(`📊 [Directivo] Total registros en 7 días: ${moodsPeriodo.length}`);
    
    // Verificar privacidad (mínimo 15 registros en total)
    const MINIMO_REGISTROS = 15;
    if (moodsPeriodo.length < MINIMO_REGISTROS) {
      console.log(`🔒 [Directivo] Insuficientes registros para mostrar tendencias (${moodsPeriodo.length}/${MINIMO_REGISTROS})`);
      return res.json({
        success: true,
        data: {
          suficientesRegistros: false,
          totalRegistros: moodsPeriodo.length,
          minimoRequerido: MINIMO_REGISTROS,
          mensaje: `Se necesitan al menos ${MINIMO_REGISTROS} registros en los últimos 7 días para proteger la privacidad.`,
          periodo: {
            inicio: sevenDaysAgo.toISOString().split('T')[0],
            fin: today.toISOString().split('T')[0]
          }
        }
      });
    }
    
    // Calcular tendencias día por día
    const tendencias = calcularTendencias7Dias(moodsPeriodo, sevenDaysAgo, today);
    
    console.log(`✅ [Directivo] Tendencias calculadas para ${tendencias.dias.length} días`);
    
    res.json({
      success: true,
      data: {
        suficientesRegistros: true,
        totalRegistros: moodsPeriodo.length,
        periodo: {
          inicio: sevenDaysAgo.toISOString().split('T')[0],
          fin: today.toISOString().split('T')[0]
        },
        tendencias,
        ultimaActualizacion: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [Directivo] Error calculando tendencias:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular las tendencias de 7 días'
    });
  }
});

// Endpoint para obtener el clima emocional diario
router.get('/clima-emocional-diario', verifyDirectivo, async (req, res) => {
  try {
    console.log('📊 [Directivo] Calculando clima emocional diario...');
    
    // Obtener fecha de hoy (inicio y fin del día)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    console.log(`📅 [Directivo] Rango de fecha: ${startOfDay.toISOString()} - ${endOfDay.toISOString()}`);
    
    // Obtener todos los registros de mood del día
    const moodsHoy = await Mood.find({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    
    console.log(`📈 [Directivo] Registros encontrados hoy: ${moodsHoy.length}`);
    
    // Verificar privacidad (mínimo 15 registros)
    const MINIMO_REGISTROS = 15;
    if (moodsHoy.length < MINIMO_REGISTROS) {
      console.log(`🔒 [Directivo] Insuficientes registros para mostrar datos (${moodsHoy.length}/${MINIMO_REGISTROS})`);
      return res.json({
        success: true,
        data: {
          suficientesRegistros: false,
          totalRegistros: moodsHoy.length,
          minimoRequerido: MINIMO_REGISTROS,
          mensaje: `Se necesitan al menos ${MINIMO_REGISTROS} registros para proteger la privacidad de los estudiantes.`,
          fecha: today.toISOString().split('T')[0]
        }
      });
    }
    
    // Calcular estadísticas del clima emocional
    const estadisticas = calcularEstadisticasClima(moodsHoy);
    
    console.log(`✅ [Directivo] Clima emocional calculado: ${estadisticas.climaGeneral}`);
    
    res.json({
      success: true,
      data: {
        suficientesRegistros: true,
        totalRegistros: moodsHoy.length,
        fecha: today.toISOString().split('T')[0],
        clima: estadisticas,
        ultimaActualizacion: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [Directivo] Error calculando clima emocional:', error);
    res.status(500).json({
      success: false,
      message: 'Error al calcular el clima emocional diario'
    });
  }
});

// Endpoint para obtener análisis emocional por curso
router.get('/clima-emocional-por-curso', verifyDirectivo, async (req, res) => {
  try {
    console.log('🏫 [Directivo] Calculando clima emocional por curso...');
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    const startOfPeriod = new Date(sevenDaysAgo.getFullYear(), sevenDaysAgo.getMonth(), sevenDaysAgo.getDate());
    
    // 1. Obtener todas las clases del sistema (asumiendo una escuela)
    const Class = require('../models/Class');
    const User = require('../models/User');
    
    const clases = await Class.find({}).populate('docenteId', 'name');
    console.log(`📚 [Directivo] Encontradas ${clases.length} clases`);
    
    const analisisPorCurso = [];
    
    for (const clase of clases) {
      // 2. Obtener estudiantes de esta clase
      const estudiantes = await User.find({ 
        classId: clase._id,
        role: 'student'
      });
      
      const studentIds = estudiantes.map(e => e._id);
      
      if (studentIds.length === 0) {
        console.log(`⚠️  [Directivo] Clase ${clase.name} sin estudiantes`);
        continue;
      }
      
      // 3. Obtener moods de hoy para esta clase
      const moodsHoy = await Mood.find({
        userId: { $in: studentIds },
        createdAt: { $gte: startOfDay, $lt: endOfDay }
      });
      
      // 4. Obtener moods de los últimos 7 días para esta clase
      const moodsPeriodo = await Mood.find({
        userId: { $in: studentIds },
        createdAt: { $gte: startOfPeriod, $lt: endOfDay }
      });
      
      // 5. Calcular estadísticas del curso
      const MINIMO_REGISTROS_CURSO = 3; // Mínimo más bajo para curso individual
      
      let climaHoy = null;
      let tendencia7Dias = null;
      
      // Análisis de hoy
      if (moodsHoy.length >= MINIMO_REGISTROS_CURSO) {
        climaHoy = calcularEstadisticasClima(moodsHoy);
        climaHoy.suficientesRegistros = true;
      } else {
        climaHoy = {
          suficientesRegistros: false,
          totalRegistros: moodsHoy.length,
          minimoRequerido: MINIMO_REGISTROS_CURSO,
          mensaje: `Necesita al menos ${MINIMO_REGISTROS_CURSO} registros`
        };
      }
      
      // Análisis de 7 días
      if (moodsPeriodo.length >= MINIMO_REGISTROS_CURSO) {
        tendencia7Dias = calcularTendencias7Dias(moodsPeriodo, sevenDaysAgo, today);
        tendencia7Dias.suficientesRegistros = true;
        tendencia7Dias.totalRegistros = moodsPeriodo.length;
      } else {
        tendencia7Dias = {
          suficientesRegistros: false,
          totalRegistros: moodsPeriodo.length,
          minimoRequerido: MINIMO_REGISTROS_CURSO,
          mensaje: `Necesita al menos ${MINIMO_REGISTROS_CURSO} registros`
        };
      }
      
      // 6. Agregar análisis del curso
      analisisPorCurso.push({
        curso: {
          id: clase._id,
          nombre: clase.name,
          codigo: clase.code,
          docente: clase.docenteId.name,
          totalEstudiantes: estudiantes.length
        },
        climaHoy: {
          ...climaHoy,
          fecha: today.toISOString().split('T')[0]
        },
        tendencia7Dias: {
          ...tendencia7Dias,
          periodo: {
            inicio: sevenDaysAgo.toISOString().split('T')[0],
            fin: today.toISOString().split('T')[0]
          }
        },
        participacion: {
          registrosHoy: moodsHoy.length,
          registros7Dias: moodsPeriodo.length,
          porcentajeParticipacionHoy: estudiantes.length > 0 ? 
            Math.round((new Set(moodsHoy.map(m => m.userId.toString())).size / estudiantes.length) * 100) : 0,
          porcentajeParticipacion7Dias: estudiantes.length > 0 ? 
            Math.round((new Set(moodsPeriodo.map(m => m.userId.toString())).size / estudiantes.length) * 100) : 0
        }
      });
      
      console.log(`📊 [Directivo] ${clase.name}: ${moodsHoy.length} registros hoy, ${moodsPeriodo.length} en 7 días`);
    }
    
    // 7. Calcular resumen general
    const resumenGeneral = {
      totalCursos: clases.length,
      cursosConDatosHoy: analisisPorCurso.filter(c => c.climaHoy.suficientesRegistros).length,
      cursosCon7Dias: analisisPorCurso.filter(c => c.tendencia7Dias.suficientesRegistros).length,
      totalEstudiantes: analisisPorCurso.reduce((sum, c) => sum + c.curso.totalEstudiantes, 0),
      totalRegistrosHoy: analisisPorCurso.reduce((sum, c) => sum + c.participacion.registrosHoy, 0),
      totalRegistros7Dias: analisisPorCurso.reduce((sum, c) => sum + c.participacion.registros7Dias, 0)
    };
    
    // 8. Ordenar cursos por registros de hoy (más activos primero)
    analisisPorCurso.sort((a, b) => b.participacion.registrosHoy - a.participacion.registrosHoy);
    
    console.log(`✅ [Directivo] Análisis por curso completado: ${analisisPorCurso.length} cursos analizados`);
    
    res.json({
      success: true,
      data: {
        resumenGeneral,
        cursos: analisisPorCurso,
        ultimaActualizacion: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [Directivo] Error en análisis por curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el análisis por curso'
    });
  }
});

// Función auxiliar para calcular estadísticas del clima emocional
function calcularEstadisticasClima(moods) {
  if (!moods || moods.length === 0) {
    return {
      climaGeneral: 'Sin datos',
      puntuacion: 0,
      distribucion: {},
      emocionesPredominantes: [],
      lugaresComunes: []
    };
  }
  
  // Mapeo de moods a puntuaciones (1-5)
  const puntuacionesMood = {
    'No tan bien': 1,
    'Más o menos': 2,
    'Bien': 3,
    'Muy bien': 4,
    'Excelente': 5
  };
  
  // Calcular puntuación promedio
  const puntuaciones = moods.map(mood => puntuacionesMood[mood.mood] || 3);
  const puntuacionPromedio = puntuaciones.reduce((sum, p) => sum + p, 0) / puntuaciones.length;
  
  // Determinar clima general basado en la puntuación
  let climaGeneral;
  let emoji;
  if (puntuacionPromedio >= 4.5) {
    climaGeneral = 'Excelente';
    emoji = '🌟';
  } else if (puntuacionPromedio >= 3.5) {
    climaGeneral = 'Muy positivo';
    emoji = '😊';
  } else if (puntuacionPromedio >= 2.5) {
    climaGeneral = 'Positivo';
    emoji = '🙂';
  } else if (puntuacionPromedio >= 1.5) {
    climaGeneral = 'Regular';
    emoji = '😐';
  } else {
    climaGeneral = 'Necesita atención';
    emoji = '😟';
  }
  
  // Calcular distribución de moods
  const distribucion = {};
  moods.forEach(mood => {
    distribucion[mood.mood] = (distribucion[mood.mood] || 0) + 1;
  });
  
  // Emociones más comunes (top 3)
  const emociones = {};
  moods.forEach(mood => {
    emociones[mood.emotion] = (emociones[mood.emotion] || 0) + 1;
  });
  const emocionesPredominantes = Object.entries(emociones)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([emocion, count]) => ({ emocion, count }));
  
  // Lugares más comunes (top 3)
  const lugares = {};
  moods.forEach(mood => {
    lugares[mood.place] = (lugares[mood.place] || 0) + 1;
  });
  const lugaresComunes = Object.entries(lugares)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([lugar, count]) => ({ lugar, count }));
  
  return {
    climaGeneral,
    emoji,
    puntuacion: Math.round(puntuacionPromedio * 10) / 10, // Redondear a 1 decimal
    distribucion,
    emocionesPredominantes,
    lugaresComunes,
    totalRegistros: moods.length
  };
}

// Función auxiliar para calcular tendencias de 7 días
function calcularTendencias7Dias(moods, fechaInicio, fechaFin) {
  if (!moods || moods.length === 0) {
    return {
      dias: [],
      resumen: {
        tendenciaGeneral: 'Sin datos',
        puntuacionPromedio: 0,
        mejorDia: null,
        peorDia: null
      }
    };
  }
  
  // Mapeo de moods a puntuaciones (1-5)
  const puntuacionesMood = {
    'No tan bien': 1,
    'Más o menos': 2,
    'Bien': 3,
    'Muy bien': 4,
    'Excelente': 5
  };
  
  // Crear array de 7 días
  const dias = [];
  const fechaActual = new Date(fechaInicio);
  
  for (let i = 0; i < 7; i++) {
    const fechaDia = new Date(fechaActual);
    fechaDia.setDate(fechaInicio.getDate() + i);
    
    const fechaStr = fechaDia.toISOString().split('T')[0];
    const inicioDelDia = new Date(fechaDia.getFullYear(), fechaDia.getMonth(), fechaDia.getDate());
    const finDelDia = new Date(fechaDia.getFullYear(), fechaDia.getMonth(), fechaDia.getDate() + 1);
    
    // Filtrar moods de este día
    const moodsDelDia = moods.filter(mood => {
      const fechaMood = new Date(mood.createdAt);
      return fechaMood >= inicioDelDia && fechaMood < finDelDia;
    });
    
    // Calcular estadísticas del día
    let puntuacionDia = 0;
    let climaDia = 'Sin datos';
    let emojiDia = '❓';
    
    if (moodsDelDia.length > 0) {
      const puntuaciones = moodsDelDia.map(mood => puntuacionesMood[mood.mood] || 3);
      puntuacionDia = puntuaciones.reduce((sum, p) => sum + p, 0) / puntuaciones.length;
      
      // Determinar clima del día
      if (puntuacionDia >= 4.5) {
        climaDia = 'Excelente';
        emojiDia = '🌟';
      } else if (puntuacionDia >= 3.5) {
        climaDia = 'Muy positivo';
        emojiDia = '😊';
      } else if (puntuacionDia >= 2.5) {
        climaDia = 'Positivo';
        emojiDia = '🙂';
      } else if (puntuacionDia >= 1.5) {
        climaDia = 'Regular';
        emojiDia = '😐';
      } else {
        climaDia = 'Necesita atención';
        emojiDia = '😟';
      }
    }
    
    dias.push({
      fecha: fechaStr,
      diaSemana: fechaDia.toLocaleDateString('es-ES', { weekday: 'short' }),
      registros: moodsDelDia.length,
      puntuacion: Math.round(puntuacionDia * 10) / 10,
      clima: climaDia,
      emoji: emojiDia
    });
  }
  
  // Calcular resumen de tendencias
  const diasConDatos = dias.filter(dia => dia.registros > 0);
  let resumen = {
    tendenciaGeneral: 'Sin datos suficientes',
    puntuacionPromedio: 0,
    mejorDia: null,
    peorDia: null
  };
  
  if (diasConDatos.length > 0) {
    const puntuacionPromedio = diasConDatos.reduce((sum, dia) => sum + dia.puntuacion, 0) / diasConDatos.length;
    resumen.puntuacionPromedio = Math.round(puntuacionPromedio * 10) / 10;
    
    // Determinar tendencia general
    if (puntuacionPromedio >= 4.0) {
      resumen.tendenciaGeneral = 'Muy positiva';
    } else if (puntuacionPromedio >= 3.0) {
      resumen.tendenciaGeneral = 'Positiva';
    } else if (puntuacionPromedio >= 2.0) {
      resumen.tendenciaGeneral = 'Estable';
    } else {
      resumen.tendenciaGeneral = 'Requiere atención';
    }
    
    // Encontrar mejor y peor día
    resumen.mejorDia = diasConDatos.reduce((mejor, dia) => 
      dia.puntuacion > mejor.puntuacion ? dia : mejor
    );
    resumen.peorDia = diasConDatos.reduce((peor, dia) => 
      dia.puntuacion < peor.puntuacion ? dia : peor
    );
  }
  
  return {
    dias,
    resumen
  };
}

module.exports = router; 