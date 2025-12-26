const express = require('express');
const router = express.Router();

const orderController = require('../controllers/order.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { isSeller } = require('../middlewares/role.middleware');

// Rotas do cliente
router.use(authenticate);

router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/number/:orderNumber', orderController.getOrderByNumber);
router.get('/:id', orderController.getOrderById);
router.put('/:id/cancel', orderController.cancelOrder);

// Rotas do vendedor
router.get('/store', isSeller, orderController.getStoreOrders);
router.put('/:id/status', isSeller, orderController.updateOrderStatus);

module.exports = router;
