const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Log the token for debugging
    console.log('Verifying token:', token.substring(0, 20) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload to request
    req.user = decoded.user;
    console.log('Token verified successfully for user:', req.user.id);
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    
    // Provide more specific error message based on the type of error
    let errorMessage = 'Token is not valid';
    if (err.name === 'JsonWebTokenError' && err.message === 'invalid signature') {
      errorMessage = 'Token was signed with a different JWT_SECRET than currently set in .env';
      console.error('JWT_SECRET MISMATCH: Your .env JWT_SECRET does not match what was used to generate this token');
    } else if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
    }
    
    res.status(401).json({ 
      error: errorMessage,
      details: err.message
    });
  }
};