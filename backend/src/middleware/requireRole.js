function requireRole(allowedRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    if (req.user.role !== allowedRole) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires ${allowedRole} role`
        }
      });
    }

    next();
  };
}

module.exports = requireRole;
