
const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Webhook do Asaas (público - recebe notificações)
router.post('/webhook', paymentController.handleWebhook);

// Rotas protegidas
router.use(authenticate);

// Criar cliente no Asaas
router.post('/customer', paymentController.createCustomer);

// Criar cobranças
router.post('/pix', paymentController.createPixPayment);
router.post('/card', paymentController.createCardPayment);
router.post('/boleto', paymentController.createBoletoPayment);

// Consultar e gerenciar pagamentos
router.get('/:paymentId', paymentController.getPaymentStatus);
router.post('/:paymentId/refund', paymentController.refundPayment);
router.delete('/:paymentId', paymentController.cancelPayment);

module.exports = router;
