const passport = require('passport');

// Middleware de autenticação JWT
exports.authenticate = passport.authenticate('jwt', { session: false });

// Middleware opcional de autenticação (não retorna erro se não autenticado)
exports.optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};
