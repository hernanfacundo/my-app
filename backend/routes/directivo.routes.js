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