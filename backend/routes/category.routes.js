const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const { uploadSingle, handleUploadError } = require('../middlewares/upload.middleware');

// Rotas públicas
router.get('/', categoryController.getCategories);
router.get('/tree', categoryController.getCategoryTree);
router.get('/:slug', categoryController.getCategoryBySlug);

// Rotas protegidas (admin)
router.post('/', authenticate, isAdmin, categoryController.createCategory);
router.put('/:id', authenticate, isAdmin, categoryController.updateCategory);
router.put('/:id/image', authenticate, isAdmin, uploadSingle('image'), handleUploadError, categoryController.uploadCategoryImage);
router.delete('/:id', authenticate, isAdmin, categoryController.deleteCategory);

module.exports = router;
