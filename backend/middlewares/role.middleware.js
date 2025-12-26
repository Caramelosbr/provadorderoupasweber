// Middleware para verificar roles
exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Não autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Você não tem permissão para acessar este recurso' 
      });
    }

    next();
  };
};

// Middleware específicos
exports.isAdmin = exports.requireRole('admin');
exports.isSeller = exports.requireRole('seller', 'admin');
exports.isCustomer = exports.requireRole('customer', 'seller', 'admin');
