require('dotenv').config();
const mongoose = require('mongoose');
const BadgeService = require('../services/badgeService');
const GratitudeEntry = require('../models/GratitudeEntry');
const User = require('../models/User');

async function testBadgeSystem() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Conectado a MongoDB');

    // Buscar un usuario de prueba
    const testUser = await User.findOne({ role: 'student' });
    if (!testUser) {
      console.log('❌ No se encontró un usuario estudiante para pruebas');
      return;
    }
    console.log(`👤 Usuario de prueba: ${testUser.name} (${testUser.email})`);

    // Prueba 1: Categorización automática
    console.log('\n🧪 Prueba 1: Categorización automática');
    const testTexts = [
      'Estoy agradecido por mi familia',
      'Mi mejor amigo me ayudó hoy',
      'Tuve un buen día en la escuela',
      'Me siento sano y con energía',
      'Logré terminar mi proyecto'
    ];

    testTexts.forEach(text => {
      const category = BadgeService.categorizeGratitude(text);
      console.log(`"${text}" → ${category}`);
    });

    // Prueba 2: Cálculo de streaks
    console.log('\n🧪 Prueba 2: Cálculo de streaks');
    const mockEntries = [
      { date: new Date('2024-01-01') },
      { date: new Date('2024-01-02') },
      { date: new Date('2024-01-03') },
      // Salto de un día
      { date: new Date('2024-01-05') },
      { date: new Date('2024-01-06') }
    ];
    
    const streak = BadgeService.calculateStreak(mockEntries);
    console.log(`Streak calculado: ${streak} días`);

    // Prueba 3: Obtener estadísticas del usuario
    console.log('\n🧪 Prueba 3: Estadísticas del usuario');
    const stats = await BadgeService.getUserStats(testUser._id);
    console.log('Estadísticas:', stats);

    // Prueba 4: Obtener insignias del usuario
    console.log('\n🧪 Prueba 4: Insignias del usuario');
    const badges = await BadgeService.getUserBadges(testUser._id);
    console.log(`Total de insignias disponibles: ${badges.length}`);
    
    badges.forEach(badge => {
      const status = badge.isUnlocked ? '✅ Desbloqueada' : '🔒 Bloqueada';
      const progress = `${badge.progress.current}/${badge.progress.required} (${badge.progress.percentage.toFixed(1)}%)`;
      console.log(`${status} ${badge.emoji} ${badge.name} - ${progress}`);
    });

    // Prueba 5: Simular nueva entrada de gratitud
    console.log('\n🧪 Prueba 5: Simular nueva entrada');
    const newEntry = {
      text: 'Estoy agradecido por esta prueba del sistema de insignias',
      userId: testUser._id,
      date: new Date()
    };

    // Obtener todas las entradas del usuario
    const allEntries = await GratitudeEntry.find({ userId: testUser._id });
    console.log(`Entradas existentes: ${allEntries.length}`);

    // Simular actualización de progreso
    const progress = await BadgeService.updateUserProgress(testUser._id, newEntry, [...allEntries, newEntry]);
    console.log('Progreso actualizado:', {
      currentStreak: progress.currentStreak,
      totalEntries: progress.totalEntries,
      categoriesUsed: progress.categoriesUsed.length
    });

    // Verificar nuevas insignias
    const newBadges = await BadgeService.checkForNewBadges(testUser._id, progress);
    if (newBadges.length > 0) {
      console.log('🎉 ¡Nuevas insignias desbloqueadas!');
      newBadges.forEach(badge => {
        console.log(`${badge.emoji} ${badge.name}: ${badge.description}`);
        const message = BadgeService.getBadgeMessage(badge);
        console.log(`Mensaje: ${message}`);
      });
    } else {
      console.log('📝 No se desbloquearon nuevas insignias');
    }

    console.log('\n✅ Todas las pruebas completadas exitosamente');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testBadgeSystem();
}

module.exports = testBadgeSystem; 