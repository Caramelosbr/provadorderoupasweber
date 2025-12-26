const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/review.controller');
const { authenticate, optionalAuth } = require('../middlewares/auth.middleware');
const { isSeller } = require('../middlewares/role.middleware');
const { uploadMultiple, handleUploadError } = require('../middlewares/upload.middleware');

// Rotas públicas
router.get('/product/:productId', reviewController.getProductReviews);

// Rotas protegidas (cliente)
router.use(authenticate);

router.get('/my-reviews', reviewController.getMyReviews);
router.post('/', reviewController.createReview);
router.post('/:id/images', uploadMultiple('images', 5), handleUploadError, reviewController.uploadReviewImages);
router.post('/:id/helpful', reviewController.markHelpful);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);

// Rotas do vendedor
router.get('/store', isSeller, reviewController.getStoreReviews);
router.post('/:id/respond', isSeller, reviewController.respondToReview);

module.exports = router;