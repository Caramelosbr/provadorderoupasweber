const { body, param, query } = require('express-validator');

// Validações de Usuário
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
];

exports.loginValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido'),
  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
];

// Validações de Produto
exports.productValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome do produto é obrigatório')
    .isLength({ max: 200 }).withMessage('Nome deve ter no máximo 200 caracteres'),
  body('description')
    .trim()
    .notEmpty().withMessage('Descrição é obrigatória'),
  body('price')
    .isFloat({ min: 0 }).withMessage('Preço deve ser um número positivo'),
  body('category')
    .isMongoId().withMessage('Categoria inválida')
];

// Validações de Loja
exports.storeValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome da loja é obrigatório')
    .isLength({ max: 100 }).withMessage('Nome deve ter no máximo 100 caracteres'),
  body('email')
    .trim()
    .isEmail().withMessage('Email inválido'),
  body('phone')
    .notEmpty().withMessage('Telefone é obrigatório')
];

// Validações de Avaliação
exports.reviewValidation = [
  body('productId')
    .isMongoId().withMessage('Produto inválido'),
  body('orderId')
    .isMongoId().withMessage('Pedido inválido'),
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('Avaliação deve ser entre 1 e 5'),
  body('comment')
    .trim()
    .notEmpty().withMessage('Comentário é obrigatório')
    .isLength({ max: 1000 }).withMessage('Comentário deve ter no máximo 1000 caracteres')
];

// Validação de MongoDB ID
exports.mongoIdValidation = [
  param('id')
    .isMongoId().withMessage('ID inválido')
];

// Validação de paginação
exports.paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Página deve ser um número positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100')
];