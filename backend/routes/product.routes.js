const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { isSeller } = require('../middlewares/role.middleware');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middlewares/upload.middleware');

// Rotas públicas
router.get('/', productController.getProducts);
router.get('/id/:id', productController.getProductById);
router.get('/id/:id/related', productController.getRelatedProducts);
router.get('/:slug', productController.getProductBySlug);

// Rotas protegidas (vendedor)
router.get('/my-products', authenticate, isSeller, productController.getMyProducts);
router.post('/', authenticate, isSeller, productController.createProduct);
router.put('/:id', authenticate, isSeller, productController.updateProduct);
router.delete('/:id', authenticate, isSeller, productController.deleteProduct);

// Upload de imagens
router.post('/:id/images', authenticate, isSeller, uploadMultiple('images', 10), handleUploadError, productController.uploadImages);
router.post('/:id/tryon-image', authenticate, isSeller, uploadSingle('image'), handleUploadError, productController.uploadTryOnImage);
router.delete('/:id/images/:imageId', authenticate, isSeller, productController.deleteImage);

module.exports = router;