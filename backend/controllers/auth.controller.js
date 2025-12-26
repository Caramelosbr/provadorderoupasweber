const jwt = require('jsonwebtoken');
const { validationResult, body } = require('express-validator');
const User = require('../models/User');

// Gerar token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Validações
exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória')
];

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso' });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      role: role === 'seller' ? 'seller' : 'customer'
    });

    // Gerar token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Login do usuário
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Buscar usuário com senha
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar se usuário tem senha (pode ser conta Google)
    if (!user.password) {
      return res.status(401).json({ 
        message: 'Esta conta foi criada com Google. Use o login com Google.' 
      });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar se conta está ativa
    if (!user.isActive) {
      return res.status(401).json({ message: 'Conta desativada' });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token
    const token = generateToken(user._id);

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter usuário autenticado
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Callback do Google OAuth
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    
    // Redirecionar para frontend com token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

// @desc    Logout (invalida token no frontend)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
};

// @desc    Solicitar reset de senha
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email não encontrado' });
    }

    // Gerar token de reset
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    // TODO: Enviar email com link de reset
    // await sendEmail({ to: email, subject: 'Reset de senha', ... });

    res.json({ 
      message: 'Email de recuperação enviado',
      // Em desenvolvimento, retornar token (remover em produção)
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Erro no forgot password:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Resetar senha
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({
      _id: decoded.id,
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    // Atualizar senha
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro no reset password:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};