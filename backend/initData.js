const mongoose = require('mongoose');
const Emotion = require('./models/Emotion');
const Place = require('./models/Place');
require('dotenv').config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar:', err));

const emotions = [
  'Feliz', 'Triste', 'Ansioso', 'Relajado', 'Enojado',
  'Entusiasmado', 'Cansado', 'Confundido', 'Agradecido', 'Solitario'
];

const places = [
  'Casa', 'Trabajo', 'Parque', 'Transporte',
  'Gimnasio', 'Café', 'Tienda', 'Naturaleza'
];

const initData = async () => {
  try {
    await Emotion.deleteMany({});
    await Place.deleteMany({});
    await Emotion.insertMany(emotions.map(name => ({ name })));
    await Place.insertMany(places.map(name => ({ name })));
    console.log('Datos inicializados');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error al inicializar datos:', error);
    mongoose.connection.close();
  }
};

initData();