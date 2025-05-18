const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log('Headers recibidos:', req.headers);
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  console.log('Token extraído:', token);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Error verifying token:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;