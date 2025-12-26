const express = require('express');
const router = express.Router();

const storeController = require('../controllers/store.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isSeller } = require('../middlewares/role.middleware');
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');

// Rotas públicas
router.get('/', storeController.getStores);
router.get('/:slug', storeController.getStoreBySlug);

// Rotas protegidas (vendedor)
router.post('/', authenticate, storeController.createStore);
router.get('/my-store', authenticate, isSeller, storeController.getMyStore);
router.put('/my-store', authenticate, isSeller, storeController.updateStore);
router.put('/my-store/logo', authenticate, isSeller, uploadSingle('logo'), handleUploadError, storeController.uploadLogo);
router.put('/my-store/banner', authenticate, isSeller, uploadSingle('banner'), handleUploadError, storeController.uploadBanner);
router.get('/my-store/stats', authenticate, isSeller, storeController.getStoreStats);

module.exports = router;
