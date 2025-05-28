require('dotenv').config();
const mongoose = require('mongoose');
const BadgeService = require('../services/badgeService');
const GratitudeEntry = require('../models/GratitudeEntry');
const UserProgress = require('../models/UserProgress');
const UserBadge = require('../models/UserBadge');
const User = require('../models/User');

async function testBadgeSystemPhase2() {
  try {
    console.log('🚀 [Test] Iniciando pruebas de Fase 2 - Sistema de Insignias');
    console.log('=' .repeat(60));

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 [Test] Conectado a MongoDB');

    // Buscar usuario de prueba
    const testUser = await User.findOne({ role: 'student' });
    if (!testUser) {
      console.log('❌ [Test] No se encontró un usuario estudiante para pruebas');
      return;
    }
    console.log(`👤 [Test] Usuario de prueba: ${testUser.name} (${testUser.email})`);

    // Limpiar datos previos del usuario de prueba
    await UserProgress.deleteOne({ userId: testUser._id });
    await UserBadge.deleteMany({ userId: testUser._id });
    await GratitudeEntry.deleteMany({ userId: testUser._id });
    console.log('🧹 [Test] Datos previos limpiados');

    console.log('\n📋 [Test] ESCENARIO 1: Primera entrada de gratitud');
    console.log('-' .repeat(50));
    
    // Simular primera entrada
    const entry1 = await createGratitudeEntry(testUser._id, 'Estoy agradecido por mi familia que siempre me apoya');
    await simulateGratitudeProcess(testUser._id, entry1);

    console.log('\n📋 [Test] ESCENARIO 2: Construir streak de 3 días');
    console.log('-' .repeat(50));
    
    // Crear entradas para 3 días consecutivos (hoy, ayer, anteayer)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);

    // Crear las entradas en orden cronológico (más antigua primero)
    const entry3 = await createGratitudeEntry(testUser._id, 'Estoy agradecido por mi salud y energía', dayBefore);
    await simulateGratitudeProcess(testUser._id, entry3);

    const entry2 = await createGratitudeEntry(testUser._id, 'Agradezco a mis amigos por hacerme reír', yesterday);
    await simulateGratitudeProcess(testUser._id, entry2);

    // La primera entrada ya existe para "hoy", así que el streak debería ser 3
    console.log('📊 [Test] Verificando streak después de 3 días consecutivos...');
    const allEntriesAfterStreak = await GratitudeEntry.find({ userId: testUser._id });
    await simulateGratitudeProcess(testUser._id, allEntriesAfterStreak[0]); // Re-procesar para verificar streak

    console.log('\n📋 [Test] ESCENARIO 3: Diversificar categorías');
    console.log('-' .repeat(50));
    
    // Agregar más entradas de diferentes categorías
    const entry4 = await createGratitudeEntry(testUser._id, 'Agradezco por mi escuela y mis maestros');
    await simulateGratitudeProcess(testUser._id, entry4);

    const entry5 = await createGratitudeEntry(testUser._id, 'Estoy agradecido por la música que me inspira');
    await simulateGratitudeProcess(testUser._id, entry5);

    console.log('\n📋 [Test] ESCENARIO 4: Alcanzar 5 entradas totales');
    console.log('-' .repeat(50));
    
    // Ya tenemos 5 entradas, verificar insignia de total
    const allEntries = await GratitudeEntry.find({ userId: testUser._id });
    await simulateGratitudeProcess(testUser._id, allEntries[allEntries.length - 1]);

    console.log('\n📋 [Test] ESCENARIO 5: Verificar estado final');
    console.log('-' .repeat(50));
    
    // Obtener estadísticas finales
    const finalStats = await BadgeService.getUserStats(testUser._id);
    const finalBadges = await BadgeService.getUserBadges(testUser._id);
    const unlockedBadges = finalBadges.filter(b => b.isUnlocked);

    console.log('📊 [Test] Estadísticas finales:', {
      currentStreak: finalStats.currentStreak,
      totalEntries: finalStats.totalEntries,
      totalBadges: finalStats.totalBadges,
      categoriesUsed: finalStats.categoriesUsed
    });

    console.log('\n🏆 [Test] Insignias desbloqueadas:');
    unlockedBadges.forEach(badge => {
      console.log(`   ✅ ${badge.emoji} ${badge.name} - ${badge.description}`);
    });

    console.log('\n🔒 [Test] Insignias pendientes:');
    const lockedBadges = finalBadges.filter(b => !b.isUnlocked);
    lockedBadges.forEach(badge => {
      const progress = `${badge.progress.current}/${badge.progress.required} (${badge.progress.percentage.toFixed(1)}%)`;
      console.log(`   🔒 ${badge.emoji} ${badge.name} - ${progress}`);
    });

    console.log('\n📋 [Test] ESCENARIO 6: Prueba de categorización');
    console.log('-' .repeat(50));
    
    const testTexts = [
      'Agradezco a mi mamá por cocinar delicioso',
      'Mi mejor amigo me ayudó con la tarea',
      'Tuve un examen exitoso en la escuela',
      'Me siento sano después de hacer ejercicio',
      'Logré terminar mi proyecto de arte',
      'Disfruté de un hermoso atardecer',
      'La comida estuvo deliciosa hoy',
      'Escuché mi canción favorita',
      'Fue un momento especial con mi familia',
      'Tengo una gran oportunidad por delante'
    ];

    console.log('🏷️ [Test] Probando categorización automática:');
    testTexts.forEach(text => {
      const category = BadgeService.categorizeGratitude(text);
      console.log(`   "${text.substring(0, 40)}..." → ${category}`);
    });

    console.log('\n✅ [Test] Todas las pruebas de Fase 2 completadas exitosamente');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ [Test] Error en las pruebas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 [Test] Desconectado de MongoDB');
  }
}

async function createGratitudeEntry(userId, text, date = new Date()) {
  const entry = new GratitudeEntry({
    userId,
    text,
    date
  });
  await entry.save();
  console.log(`📝 [Test] Entrada creada: "${text.substring(0, 50)}..." (${date.toLocaleDateString()})`);
  return entry;
}

async function simulateGratitudeProcess(userId, newEntry) {
  try {
    // Obtener todas las entradas del usuario
    const allUserEntries = await GratitudeEntry.find({ userId }).sort({ date: 1 });
    
    // Actualizar progreso
    const progress = await BadgeService.updateUserProgress(userId, newEntry, allUserEntries);
    
    // Verificar nuevas insignias
    const newBadges = await BadgeService.checkForNewBadges(userId, progress);
    
    if (newBadges.length > 0) {
      console.log(`🎉 [Test] ¡${newBadges.length} nuevas insignias desbloqueadas!`);
      newBadges.forEach(badge => {
        console.log(`   🏅 ${badge.emoji} ${badge.name}`);
      });
    }
    
    return { progress, newBadges };
  } catch (error) {
    console.error('❌ [Test] Error simulando proceso:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testBadgeSystemPhase2();
}

module.exports = testBadgeSystemPhase2; 