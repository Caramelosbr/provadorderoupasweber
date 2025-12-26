const express = require('express');
const router = express.Router();

const cartController = require('../controllers/cart.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addItem);
router.put('/items/:itemId', cartController.updateItemQuantity);
router.delete('/items/:itemId', cartController.removeItem);
router.delete('/', cartController.clearCart);

// Cupom
router.post('/coupon', cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

module.exports = router;
