const asaasService = require('../services/asaas.service');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * Criar/vincular cliente no Asaas
 */
exports.createCustomer = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.cpf) {
      return res.status(400).json({ message: 'CPF é obrigatório para pagamentos' });
    }

    // Verificar se já existe
    const existing = await asaasService.findCustomerByCpfCnpj(user.cpf);
    if (existing.success) {
      user.asaasCustomerId = existing.customer.id;
      await user.save();
      return res.json({ message: 'Cliente vinculado', customerId: existing.customer.id });
    }

    // Criar novo cliente
    const address = user.addresses.find(a => a.isDefault) || user.addresses[0];
    
    const result = await asaasService.createCustomer({
      name: user.name,
      email: user.email,
      cpfCnpj: user.cpf,
      phone: user.phone,
      address: address?.street,
      addressNumber: address?.number,
      complement: address?.complement,
      neighborhood: address?.neighborhood,
      postalCode: address?.zipCode?.replace(/\D/g, ''),
      externalReference: user._id.toString()
    });

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    user.asaasCustomerId = result.customer.id;
    await user.save();

    res.status(201).json({ 
      message: 'Cliente criado no Asaas', 
      customerId: result.customer.id 
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Criar pagamento PIX
 */
exports.createPixPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    const user = await User.findById(req.user._id);
    if (!user.asaasCustomerId) {
      return res.status(400).json({ 
        message: 'Cliente não cadastrado no sistema de pagamentos',
        code: 'CUSTOMER_NOT_FOUND'
      });
    }

    const result = await asaasService.createPixPayment({
      customerId: user.asaasCustomerId,
      value: order.pricing.total,
      description: `Pedido #${order.orderNumber}`,
      orderId: order._id.toString()
    });

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    // Atualizar pedido com dados do pagamento
    order.payment.transactionId = result.payment.id;
    order.payment.pixCode = result.payment.pixCode;
    order.payment.pixQrCode = result.payment.pixQrCode;
    order.payment.status = 'pending';
    await order.save();

    res.json({
      message: 'PIX gerado com sucesso',
      payment: result.payment
    });
  } catch (error) {
    console.error('Erro ao criar PIX:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Criar pagamento com Cartão
 */
exports.createCardPayment = async (req, res) => {
  try {
    const { orderId, card, holder, installments } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    const user = await User.findById(req.user._id);
    if (!user.asaasCustomerId) {
      return res.status(400).json({ 
        message: 'Cliente não cadastrado no sistema de pagamentos',
        code: 'CUSTOMER_NOT_FOUND'
      });
    }

    const result = await asaasService.createCardPayment({
      customerId: user.asaasCustomerId,
      value: order.pricing.total,
      description: `Pedido #${order.orderNumber}`,
      orderId: order._id.toString(),
      card,
      holder,
      installments
    });

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    // Atualizar pedido
    order.payment.transactionId = result.payment.id;
    order.payment.status = result.payment.status === 'CONFIRMED' ? 'paid' : 'processing';
    if (result.payment.status === 'CONFIRMED') {
      order.payment.paidAt = new Date();
      order.status = 'paid';
      order.updateStatus('paid', 'Pagamento confirmado');
    }
    await order.save();

    res.json({
      message: 'Pagamento processado',
      payment: result.payment
    });
  } catch (error) {
    console.error('Erro ao processar cartão:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Criar Boleto
 */
exports.createBoletoPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    const user = await User.findById(req.user._id);
    if (!user.asaasCustomerId) {
      return res.status(400).json({ 
        message: 'Cliente não cadastrado no sistema de pagamentos',
        code: 'CUSTOMER_NOT_FOUND'
      });
    }

    const result = await asaasService.createBoletoPayment({
      customerId: user.asaasCustomerId,
      value: order.pricing.total,
      description: `Pedido #${order.orderNumber}`,
      orderId: order._id.toString()
    });

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    // Atualizar pedido
    order.payment.transactionId = result.payment.id;
    order.payment.boletoUrl = result.payment.bankSlipUrl;
    order.payment.boletoBarcode = result.payment.barCode;
    order.payment.status = 'pending';
    await order.save();

    res.json({
      message: 'Boleto gerado com sucesso',
      payment: result.payment
    });
  } catch (error) {
    console.error('Erro ao gerar boleto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Consultar status do pagamento
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const result = await asaasService.getPaymentStatus(paymentId);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ payment: result.payment });
  } catch (error) {
    console.error('Erro ao consultar pagamento:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Estornar pagamento
 */
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { value } = req.body;

    const result = await asaasService.refundPayment(paymentId, value);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ message: 'Estorno realizado', refund: result.refund });
  } catch (error) {
    console.error('Erro ao estornar:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Cancelar cobrança
 */
exports.cancelPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const result = await asaasService.cancelPayment(paymentId);

    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }

    res.json({ message: 'Cobrança cancelada' });
  } catch (error) {
    console.error('Erro ao cancelar cobrança:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

/**
 * Webhook do Asaas
 */
exports.handleWebhook = async (req, res) => {
  try {
    const event = req.body;

    console.log('Webhook Asaas recebido:', event.event);

    const result = asaasService.handleWebhook(event);

    if (result.action === 'confirm_order' && event.payment?.externalReference) {
      const order = await Order.findById(event.payment.externalReference);
      if (order) {
        order.payment.status = 'paid';
        order.payment.paidAt = new Date();
        order.status = 'paid';
        order.updateStatus('paid', 'Pagamento confirmado via webhook');
        await order.save();
        console.log(`Pedido ${order.orderNumber} confirmado via webhook`);
      }
    }

    if (result.action === 'refund_order' && event.payment?.externalReference) {
      const order = await Order.findById(event.payment.externalReference);
      if (order) {
        order.payment.status = 'refunded';
        order.status = 'refunded';
        order.updateStatus('refunded', 'Pagamento estornado');
        await order.save();
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ message: 'Erro interno' });
  }
};
