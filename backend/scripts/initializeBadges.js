require('dotenv').config();
const mongoose = require('mongoose');
const Badge = require('../models/Badge');
const { BADGES_CONFIG } = require('../config/badges');

async function initializeBadges() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Conectado a MongoDB');

    // Limpiar insignias existentes (opcional)
    await Badge.deleteMany({});
    console.log('Insignias existentes eliminadas');

    // Crear todas las insignias
    const allBadges = [
      ...BADGES_CONFIG.streak.map(badge => ({ ...badge, category: 'streak' })),
      ...BADGES_CONFIG.total.map(badge => ({ ...badge, category: 'total' })),
      ...BADGES_CONFIG.variety.map(badge => ({ ...badge, category: 'variety' }))
    ];

    for (const badgeData of allBadges) {
      const badge = new Badge(badgeData);
      await badge.save();
      console.log(`Insignia creada: ${badge.name} (${badge.id})`);
    }

    console.log(`\n✅ ${allBadges.length} insignias inicializadas correctamente`);
    
    // Mostrar resumen
    console.log('\n📊 Resumen de insignias:');
    console.log(`- Constancia (streak): ${BADGES_CONFIG.streak.length}`);
    console.log(`- Cantidad total: ${BADGES_CONFIG.total.length}`);
    console.log(`- Variedad: ${BADGES_CONFIG.variety.length}`);

  } catch (error) {
    console.error('Error inicializando insignias:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initializeBadges();
}

module.exports = initializeBadges; 