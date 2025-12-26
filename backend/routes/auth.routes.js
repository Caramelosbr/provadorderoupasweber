const express = require('express');
const passport = require('passport');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Rotas públicas
router.post('/register', authController.registerValidation, authController.register);
router.post('/login', authController.loginValidation, authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google OAuth
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  authController.googleCallback
);

// Rotas protegidas
router.get('/me', authenticate, authController.getMe);
router.post('/logout', authenticate, authController.logout);

module.exports = router;