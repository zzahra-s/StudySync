const jwt = require('jsonwebtoken');

/**
 * JWT guard. Set SKIP_AUTH=true in .env for local API testing (Postman) without a token.
 * Optional DEV_USER_ID sets req.user.id when skipping (defaults to 1).
 */
const authenticateToken = (req, res, next) => {
  if (process.env.SKIP_AUTH === 'true') {
    const id = parseInt(process.env.DEV_USER_ID || '1', 10);
    req.user = { id: Number.isFinite(id) ? id : 1, email: 'dev@local' };
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
