require('dotenv').config();
const mongoose = require('mongoose');
const Capsula = require('../models/Capsula');

const capsulasDePrueba = [
  // MINDFULNESS
  {
    titulo: "Respiración 4-7-8 para relajarte",
    descripcion: "Una técnica simple de respiración que te ayuda a reducir el estrés y encontrar calma en momentos difíciles.",
    tipo: "texto",
    contenido: `**Técnica de Respiración 4-7-8**

Esta es una técnica poderosa que puedes usar cuando te sientes abrumado o estresado durante el día escolar.

**Pasos:**
1. **Inhala** por la nariz contando hasta **4**
2. **Mantén** la respiración contando hasta **7** 
3. **Exhala** por la boca contando hasta **8**
4. Repite este ciclo **3-4 veces**

**¿Cuándo usarla?**
- Antes de una reunión difícil
- Después de una clase complicada
- Cuando sientes tensión en el cuerpo
- Al final del día para desconectar

**Beneficios:**
- Activa tu sistema nervioso parasimpático
- Reduce los niveles de cortisol
- Te ayuda a recuperar la perspectiva
- Mejora tu capacidad de tomar decisiones

Recuerda: es normal que al principio te cueste concentrarte. Con la práctica se vuelve más natural.`,
    duracion: 5,
    emocionesRelacionadas: ['estresado', 'ansioso', 'abrumado'],
    categoria: 'respiracion',
    nivelDificultad: 'principiante',
    palabrasClave: ['respiración', 'relajación', 'estrés', 'ansiedad', 'calma']
  },
  
  {
    titulo: "Pausa mindful de 3 minutos",
    descripcion: "Un ejercicio rápido de mindfulness para reconectar contigo mismo en medio del día.",
    tipo: "texto",
    contenido: `**Pausa Mindful de 3 Minutos**

Cuando sientes que el día te está sobrepasando, esta pausa te ayuda a centrarte.

**Minuto 1: OBSERVAR**
- Cierra los ojos o mira un punto fijo
- Pregúntate: "¿Cómo me siento ahora?"
- No juzgues, solo observa tus emociones
- Nota las sensaciones en tu cuerpo

**Minuto 2: RESPIRAR**
- Lleva tu atención a la respiración
- Siente cómo entra y sale el aire
- Si tu mente se distrae, regresa gentilmente
- No hay forma "correcta" de hacerlo

**Minuto 3: EXPANDIR**
- Amplía tu conciencia a todo tu cuerpo
- Nota los sonidos a tu alrededor
- Siente tus pies en el suelo
- Prepárate para continuar tu día

**Tips para educadores:**
- Puedes hacerlo en tu escritorio
- También funciona entre clases
- Es perfecto antes de reuniones importantes
- Enseña esta técnica a tus estudiantes

Esta práctica te ayuda a salir del "piloto automático" y reconectar con el momento presente.`,
    duracion: 3,
    emocionesRelacionadas: ['abrumado', 'estresado', 'confundido'],
    categoria: 'mindfulness',
    nivelDificultad: 'principiante',
    palabrasClave: ['mindfulness', 'presente', 'consciencia', 'pausa', 'centrarse']
  },

  // AUTOCUIDADO
  {
    titulo: "El poder de los límites saludables",
    descripcion: "Aprende a establecer límites que protejan tu bienestar sin sentirte culpable.",
    tipo: "texto",
    contenido: `**Estableciendo Límites Saludables**

Como docente, cuidar de otros es tu naturaleza. Pero ¿quién cuida de ti?

**¿Qué son los límites?**
Los límites son las reglas que estableces para proteger tu tiempo, energía y bienestar emocional.

**Límites con estudiantes:**
- "Mis consultas son de 9 AM a 5 PM"
- "Los fines de semana son para mi familia"
- "No reviso trabajos después de las 8 PM"

**Límites con colegas:**
- "Puedo ayudarte, pero necesito terminar esto primero"
- "No puedo quedarme después hoy"
- "Prefiero discutir esto en horario laboral"

**Límites contigo mismo:**
- "No voy a revisar emails durante la cena"
- "Me doy permiso de no ser perfecto"
- "Merezco descansos durante el día"

**Cómo decir NO sin culpa:**
1. Sé directo pero amable
2. No sobre-expliques tus razones
3. Ofrece alternativas cuando puedas
4. Recuerda: NO es una oración completa

**Señales de que necesitas límites:**
- Te sientes agotado constantemente
- Trabajas en casa todos los días
- Te cuesta decir "no"
- Sientes resentimiento hacia tu trabajo

Los límites no te hacen menos comprometido. Te hacen más sostenible.`,
    duracion: 7,
    emocionesRelacionadas: ['agotado', 'abrumado', 'frustrado'],
    categoria: 'autocuidado',
    nivelDificultad: 'intermedio',
    palabrasClave: ['límites', 'autocuidado', 'no', 'sostenibilidad', 'bienestar']
  },

  // GESTIÓN DE ESTRÉS
  {
    titulo: "Transformando los pensamientos catastróficos",
    descripcion: "Herramientas para manejar esos pensamientos que magnifican los problemas y te generan ansiedad.",
    tipo: "texto",
    contenido: `**Manejando Pensamientos Catastróficos**

"¿Y si la inspección sale mal?" "¿Y si los padres se quejan?" "¿Y si no soy un buen docente?"

**Reconoce el patrón:**
- Empiezas con un problema pequeño
- Lo escalas al peor escenario posible
- Te sientes paralizado o muy ansioso
- Actúas desde el miedo, no desde la realidad

**Técnica: Interroga tus pensamientos**

Cuando notes un pensamiento catastrófico, pregúntate:

1. **¿Es esto realmente probable?**
   "¿Cuál es la probabilidad real de que esto pase?"

2. **¿Tengo evidencias?**
   "¿Esto se basa en hechos o en mi miedo?"

3. **¿Cuál es el escenario más realista?**
   "¿Qué es lo que probablemente va a pasar?"

4. **¿Puedo hacer algo al respecto?**
   "¿Qué está bajo mi control?"

5. **¿Cómo le aconsejaría a un amigo?**
   "¿Qué le diría a un colega en esta situación?"

**Ejemplo práctico:**
❌ Pensamiento: "Esta clase salió mal, soy un desastre como docente"
✅ Reformulación: "Esta clase no salió como esperaba, puedo ajustar mi estrategia para la próxima"

**Técnica rápida:**
Cuando notes el pensamiento catastrófico, di mentalmente: "Esa es mi mente preocupándose, no la realidad"

Recuerda: Los pensamientos no son hechos. Eres el observador de tus pensamientos, no sus víctima.`,
    duracion: 8,
    emocionesRelacionadas: ['ansioso', 'abrumado', 'estresado', 'confundido'],
    categoria: 'gestion_estres',
    nivelDificultad: 'intermedio',
    palabrasClave: ['pensamientos', 'ansiedad', 'catastrófico', 'reestructuración', 'perspectiva']
  },

  // MOTIVACIÓN
  {
    titulo: "Reconectando con tu propósito docente",
    descripcion: "Un ejercicio de reflexión para recordar por qué elegiste ser educador y renovar tu motivación.",
    tipo: "texto",
    contenido: `**Reconecta con tu Propósito**

En los días difíciles, es fácil olvidar por qué elegiste ser docente. Este ejercicio te ayuda a recuperar esa chispa.

**Reflexión guiada:**

**1. Viaja al pasado**
- ¿Qué te inspiró a ser docente?
- ¿Hubo algún maestro que te marcó?
- ¿Cuál era tu visión original de la educación?

**2. Celebra tus logros**
Piensa en momentos donde has hecho diferencia:
- Un estudiante que mejoró gracias a ti
- Una vez que resolviste un conflicto
- Cuando viste comprensión en los ojos de alguien
- Un padre que te agradeció

**3. Identifica tus valores**
¿Qué es lo que más valoras de tu rol?
- ☐ Formar ciudadanos críticos
- ☐ Despertar curiosidad
- ☐ Brindar un espacio seguro
- ☐ Acompañar el crecimiento
- ☐ Transmitir conocimiento
- ☐ Otro: ___________

**4. Tu impacto único**
Completa estas frases:
- "Mis estudiantes aprenden de mí..."
- "Lo que me diferencia como educador es..."
- "El legado que quiero dejar es..."

**5. Renovación del compromiso**
Escribe una frase que resuma tu propósito:
"Soy docente porque..."

**Para llevarte:**
- Guarda esta reflexión en tu teléfono
- Léela en días difíciles
- Compártela con colegas de confianza
- Regresa a ella cada pocos meses

Tu trabajo trasciende las calificaciones y los currículos. Estás formando el futuro.`,
    duracion: 10,
    emocionesRelacionadas: ['agotado', 'desmotivado', 'triste', 'confundido'],
    categoria: 'motivacion',
    nivelDificultad: 'principiante',
    palabrasClave: ['propósito', 'motivación', 'reflexión', 'valores', 'impacto']
  },

  // EQUILIBRIO VIDA-TRABAJO
  {
    titulo: "Ritual de desconexión post-trabajo",
    descripcion: "Una rutina simple para cerrar mentalmente el día laboral y conectar con tu vida personal.",
    tipo: "texto",
    contenido: `**Ritual de Desconexión**

¿Te llevas los problemas del aula a casa? Este ritual te ayuda a hacer la transición.

**¿Por qué es importante?**
- Previene el burnout
- Mejora la calidad de tu tiempo personal
- Reduces el estrés crónico
- Proteges tus relaciones familiares

**El Ritual (5-10 minutos):**

**1. Cierre físico (2 minutos)**
- Ordena tu escritorio
- Apaga la computadora intencionalmente
- Guarda tus materiales
- Toma tu bolso/mochila

**2. Reflexión rápida (2 minutos)**
Pregúntate:
- ¿Qué salió bien hoy?
- ¿Qué puedo mejorar mañana?
- ¿Hay algo pendiente urgente?

**3. Cierre mental (2 minutos)**
- Visualiza una puerta cerrándose
- Di mentalmente: "El día de trabajo terminó"
- Respira profundo 3 veces
- Enfócate en lo que viene: tu tiempo personal

**4. Transición física (3 minutos)**
Elige una o varias:
- Cambia de ropa al llegar a casa
- Lávate las manos y la cara
- Escucha una canción favorita
- Llama a alguien querido
- Da una caminata de 5 minutos

**Variables del ritual:**
- Si trabajas desde casa: cambia de habitación
- Si tienes viaje largo: usa el trayecto
- Si tienes niños: explícales que necesitas 5 minutos

**Señales de que funciona:**
- Piensas menos en trabajo durante la noche
- Te sientes más presente con tu familia
- Duermes mejor
- Los lunes no te agobian tanto

La clave está en la consistencia. Tu cerebro aprenderá que es hora de cambiar de modo.`,
    duracion: 6,
    emocionesRelacionadas: ['agotado', 'abrumado', 'estresado'],
    categoria: 'equilibrio_vida',
    nivelDificultad: 'principiante',
    palabrasClave: ['desconexión', 'ritual', 'equilibrio', 'transición', 'casa']
  },

  // RESILIENCIA
  {
    titulo: "Crecimiento a través de la adversidad",
    descripcion: "Cómo encontrar oportunidades de crecimiento en los desafíos educativos más difíciles.",
    tipo: "texto",
    contenido: `**Transformando Desafíos en Crecimiento**

Cada día escolar trae desafíos únicos. Pero ¿y si los viéramos como oportunidades?

**Cambio de perspectiva:**

**En lugar de:** "Este grupo es imposible"
**Piensa:** "Este grupo me está enseñando nuevas estrategias"

**En lugar de:** "No puedo con tanto"
**Piensa:** "Estoy desarrollando mi capacidad de gestión"

**En lugar de:** "Todo sale mal"
**Piensa:** "Estoy aprendiendo qué ajustar"

**El proceso de crecimiento:**

**1. Acepta la dificultad**
- No minimices el desafío
- Es normal sentirse abrumado
- La resistencia es parte del proceso

**2. Busca el aprendizaje**
- ¿Qué nueva habilidad estás desarrollando?
- ¿Qué descubres sobre ti mismo?
- ¿Cómo te está fortaleciendo esta experiencia?

**3. Identifica recursos**
- ¿Qué apoyo tienes disponible?
- ¿Qué has aprendido en situaciones similares?
- ¿Quién puede orientarte?

**4. Toma acción pequeña**
- Un paso pequeño es mejor que la parálisis
- Celebra cada progreso mínimo
- Ajusta sobre la marcha

**Preguntas poderosas:**
- ¿Cómo me está cambiando esta experiencia?
- ¿Qué capacidades estoy desarrollando?
- ¿Cómo puedo usar esto para ayudar a otros?

**Ejemplos de crecimiento:**
- Estudiante disruptivo → Mayor paciencia y creatividad
- Falta de recursos → Ingenio y adaptabilidad
- Conflicto con padres → Mejores habilidades de comunicación
- Cambio de currículo → Flexibilidad y aprendizaje continuo

**Afirmación diaria:**
"Cada desafío me está preparando para ser un mejor educador"

El crecimiento duele, pero la estagnación duele más. Confía en tu capacidad de adaptación.`,
    duracion: 9,
    emocionesRelacionadas: ['frustrado', 'abrumado', 'confundido', 'triste'],
    categoria: 'resiliencia',
    nivelDificultad: 'intermedio',
    palabrasClave: ['crecimiento', 'adversidad', 'resiliencia', 'perspectiva', 'fortaleza']
  },

  // COMUNICACIÓN
  {
    titulo: "Conversaciones difíciles con padres",
    descripcion: "Estrategias para abordar reuniones complicadas con familias manteniendo una comunicación efectiva.",
    tipo: "texto",
    contenido: `**Navegando Conversaciones Difíciles**

Las reuniones con padres pueden generar ansiedad. Estas estrategias te ayudarán a manejarlas con confianza.

**Antes de la reunión:**

**Preparación emocional:**
- Respira profundo y centra tu intención
- Recuerda: todos queremos lo mejor para el estudiante
- Revisa datos objetivos, no solo percepciones

**Preparación práctica:**
- Ten ejemplos específicos de trabajo del estudiante
- Prepara 2-3 puntos principales
- Piensa en soluciones, no solo problemas

**Durante la conversación:**

**1. Comienza positivo**
- "Me alegra que puedan venir"
- "Veo que [nombre] tiene fortalezas en..."
- "Trabajemos juntos para apoyar a [nombre]"

**2. Escucha activamente**
- Parafrasea lo que dicen
- "Entiendo que te preocupa..."
- Valida sus sentimientos sin ceder en los hechos

**3. Mantén el foco**
- Regresa al bienestar del estudiante
- Usa datos, no opiniones
- "Los datos muestran que..."

**4. Busca soluciones colaborativas**
- "¿Qué podríamos probar?"
- "¿Cómo podemos apoyarlo desde casa y escuela?"
- "¿Qué necesita [nombre] para tener éxito?"

**Cuando la conversación se intensifica:**

**Si se ponen defensivos:**
- "Veo que esto es importante para ustedes"
- "Ayúdenme a entender su perspectiva"
- Mantén voz calma y postura abierta

**Si te atacan personalmente:**
- "Entiendo su frustración"
- "Enfoquémonos en cómo ayudar a [nombre]"
- No te defiendas, redirige

**Si no hay acuerdo:**
- "Está bien que tengamos perspectivas diferentes"
- "¿Qué pequeño paso podríamos intentar?"
- "¿Cuándo podríamos reunirnos de nuevo?"

**Después de la reunión:**
- Envía un resumen por escrito
- Incluye acuerdos específicos
- Programa seguimiento si es necesario

**Recordatorios importantes:**
- No tomes nada personal
- Tu rol es ser profesional, no perfecto
- Algunos padres vienen de experiencias escolares difíciles
- El 80% de los padres solo quieren comprensión

Cada conversación difícil es una oportunidad de construir confianza.`,
    duracion: 12,
    emocionesRelacionadas: ['ansioso', 'estresado', 'inseguro'],
    categoria: 'comunicacion',
    nivelDificultad: 'avanzado',
    palabrasClave: ['comunicación', 'padres', 'conflicto', 'reuniones', 'colaboración']
  }
];

const seedCapsulas = async () => {
  try {
    console.log('🧘‍♂️ POBLANDO BASE DE DATOS CON CÁPSULAS DE AUTOCUIDADO');
    console.log('=' .repeat(60));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Limpiar colección existente
    await Capsula.deleteMany({});
    console.log('🧹 Cápsulas anteriores eliminadas');
    
    // Insertar nuevas cápsulas
    const capsulaCreadas = await Capsula.insertMany(capsulasDePrueba);
    console.log(`✅ ${capsulaCreadas.length} cápsulas creadas exitosamente`);
    
    console.log('\n📊 RESUMEN DE CÁPSULAS CREADAS:');
    capsulaCreadas.forEach((capsula, index) => {
      console.log(`   ${index + 1}. "${capsula.titulo}" (${capsula.categoria}) - ${capsula.duracion}min`);
    });
    
    console.log('\n🎯 ESTADÍSTICAS:');
    const categorias = [...new Set(capsulaCreadas.map(c => c.categoria))];
    console.log(`   • Categorías: ${categorias.join(', ')}`);
    console.log(`   • Duración total: ${capsulaCreadas.reduce((sum, c) => sum + c.duracion, 0)} minutos`);
    console.log(`   • Nivel principiante: ${capsulaCreadas.filter(c => c.nivelDificultad === 'principiante').length}`);
    console.log(`   • Nivel intermedio: ${capsulaCreadas.filter(c => c.nivelDificultad === 'intermedio').length}`);
    console.log(`   • Nivel avanzado: ${capsulaCreadas.filter(c => c.nivelDificultad === 'avanzado').length}`);
    
    console.log('\n🚀 ¡Base de datos lista para usar!');
    console.log('Los docentes ya pueden acceder a las cápsulas en: GET /api/teacher/capsulas');
    
  } catch (error) {
    console.error('❌ Error poblando cápsulas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  seedCapsulas()
    .then(() => {
      console.log('\n🎉 ¡Proceso completado exitosamente!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}

module.exports = { seedCapsulas }; 