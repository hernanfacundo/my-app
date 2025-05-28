require('dotenv').config();
const mongoose = require('mongoose');

async function optimizeBadgeSystem() {
  try {
    console.log('⚡ [Optimize] Iniciando optimización del sistema de insignias');
    console.log('=' .repeat(60));

    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 [Optimize] Conectado a MongoDB');

    const db = mongoose.connection.db;

    // 1. Optimizar colección GratitudeEntry
    console.log('\n📊 [Optimize] Optimizando colección GratitudeEntry...');
    
    // Índice compuesto para consultas por usuario y fecha
    await db.collection('gratitudeentries').createIndex(
      { userId: 1, date: -1 },
      { name: 'userId_date_desc' }
    );
    console.log('✅ [Optimize] Índice userId + date creado');

    // Índice para consultas por usuario solamente
    await db.collection('gratitudeentries').createIndex(
      { userId: 1 },
      { name: 'userId_asc' }
    );
    console.log('✅ [Optimize] Índice userId creado');

    // 2. Optimizar colección UserProgress
    console.log('\n📈 [Optimize] Optimizando colección UserProgress...');
    
    // Índice único por usuario (ya existe en el modelo, pero verificamos)
    await db.collection('userprogresses').createIndex(
      { userId: 1 },
      { unique: true, name: 'userId_unique' }
    );
    console.log('✅ [Optimize] Índice único userId en UserProgress verificado');

    // 3. Optimizar colección UserBadge
    console.log('\n🏆 [Optimize] Optimizando colección UserBadge...');
    
    // Índice compuesto para consultas por usuario y badge
    await db.collection('userbadges').createIndex(
      { userId: 1, badgeId: 1 },
      { unique: true, name: 'userId_badgeId_unique' }
    );
    console.log('✅ [Optimize] Índice único userId + badgeId creado');

    // Índice para consultas por usuario
    await db.collection('userbadges').createIndex(
      { userId: 1 },
      { name: 'userId_badges' }
    );
    console.log('✅ [Optimize] Índice userId en UserBadge creado');

    // Índice para consultas por fecha de desbloqueo
    await db.collection('userbadges').createIndex(
      { unlockedAt: -1 },
      { name: 'unlockedAt_desc' }
    );
    console.log('✅ [Optimize] Índice unlockedAt creado');

    // 4. Verificar estadísticas de las colecciones
    console.log('\n📊 [Optimize] Estadísticas de las colecciones:');
    
    const gratitudeStats = await db.collection('gratitudeentries').stats();
    console.log(`   📝 GratitudeEntry: ${gratitudeStats.count} documentos, ${(gratitudeStats.size / 1024).toFixed(2)} KB`);

    const progressStats = await db.collection('userprogresses').stats();
    console.log(`   📈 UserProgress: ${progressStats.count} documentos, ${(progressStats.size / 1024).toFixed(2)} KB`);

    const badgeStats = await db.collection('userbadges').stats();
    console.log(`   🏆 UserBadge: ${badgeStats.count} documentos, ${(badgeStats.size / 1024).toFixed(2)} KB`);

    // 5. Listar todos los índices creados
    console.log('\n🔍 [Optimize] Índices creados:');
    
    const gratitudeIndexes = await db.collection('gratitudeentries').listIndexes().toArray();
    console.log('   📝 GratitudeEntry:');
    gratitudeIndexes.forEach(index => {
      console.log(`      - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    const progressIndexes = await db.collection('userprogresses').listIndexes().toArray();
    console.log('   📈 UserProgress:');
    progressIndexes.forEach(index => {
      console.log(`      - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    const badgeIndexes = await db.collection('userbadges').listIndexes().toArray();
    console.log('   🏆 UserBadge:');
    badgeIndexes.forEach(index => {
      console.log(`      - ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\n✅ [Optimize] Optimización completada exitosamente');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ [Optimize] Error en la optimización:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 [Optimize] Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  optimizeBadgeSystem();
}

module.exports = optimizeBadgeSystem; 