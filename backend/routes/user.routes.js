const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');

// Todas as rotas requerem autenticação
router.use(authenticate);

// Perfil
router.put('/profile', userController.updateProfile);
router.put('/avatar', uploadSingle('avatar'), handleUploadError, userController.updateAvatar);
router.put('/change-password', userController.changePassword);

// Medidas do corpo
router.put('/measurements', userController.updateMeasurements);
router.put('/body-photo', uploadSingle('photo'), handleUploadError, userController.uploadBodyPhoto);

// Endereços
router.post('/addresses', userController.addAddress);
router.put('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);

// Favoritos
router.get('/favorites', userController.getFavorites);
router.post('/favorites/:productId', userController.toggleFavorite);

module.exports = router;
