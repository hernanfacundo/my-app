const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyTeacher = async (req, res, next) => {
  try {
    // Verificar que existe el token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Acceso denegado. Token requerido.' 
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token inválido. Usuario no encontrado.' 
      });
    }

    // Verificar que el usuario tiene rol de teacher
    if (user.role !== 'teacher') {
      return res.status(403).json({ 
        message: 'Acceso denegado. Se requiere rol de docente.' 
      });
    }

    // Agregar información del usuario a la request
    req.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Error en middleware teacher:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado.' 
      });
    }

    res.status(500).json({ 
      message: 'Error interno del servidor.' 
    });
  }
};

module.exports = { verifyTeacher }; 