const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    console.log('Verifying token:', token.substring(0, 20) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if decoded has the expected structure
    if (!decoded.user || !decoded.user.id) {
      console.error('Invalid token format:', decoded);
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    // Add user from payload to request
    req.user = decoded.user;
    console.log('Token verified for user:', req.user.id);
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token has expired' });
    }
    
    res.status(401).json({ 
      error: 'Token is not valid',
      details: err.message
    });
  }
};