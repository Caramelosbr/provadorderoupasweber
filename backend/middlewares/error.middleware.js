// Middleware global de tratamento de erros
const errorMiddleware = (err, req, res, next) => {
  console.error('Erro:', err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      message: 'Erro de validação',
      errors 
    });
  }

  // Erro de cast do Mongoose (ID inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      message: 'ID inválido' 
    });
  }

  // Erro de duplicidade
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ 
      message: `${field} já está em uso` 
    });
  }

  // Erro de token JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      message: 'Token inválido' 
    });
  }

  // Erro de token JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      message: 'Token expirado' 
    });
  }

  // Erro padrão
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorMiddleware;