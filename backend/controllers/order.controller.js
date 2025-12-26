const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Store = require('../models/Store');

// @desc    Criar pedido
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;

    // Buscar carrinho
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Carrinho vazio' });
    }

    // Preparar itens do pedido
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;
      
      // Verificar estoque novamente
      if (item.variant) {
        const variant = product.variants.find(
          v => v.size === item.variant.size && 
          v.color?.name === item.variant.color?.name
        );
        if (!variant || variant.stock < item.quantity) {
          return res.status(400).json({ 
            message: `Estoque insuficiente para ${product.name}` 
          });
        }

        // Decrementar estoque
        variant.stock -= item.quantity;
        await product.save();
      }

      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        store: product.store,
        name: product.name,
        image: product.images[0]?.url,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        subtotal: itemSubtotal
      });
    }

    // Calcular desconto do cupom
    let discount = 0;
    if (cart.coupon) {
      if (cart.coupon.type === 'percentage') {
        discount = (subtotal * cart.coupon.discount) / 100;
      } else {
        discount = cart.coupon.discount;
      }
    }

    // Calcular frete (simplificado)
    const shipping = 0; // TODO: Implementar cálculo de frete

    // Criar pedido
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      pricing: {
        subtotal,
        shipping,
        discount,
        total: subtotal + shipping - discount
      },
      coupon: cart.coupon ? {
        code: cart.coupon.code,
        discount
      } : undefined,
      notes
    });

    // Limpar carrinho
    cart.items = [];
    cart.coupon = undefined;
    await cart.save();

    // Atualizar estatísticas das lojas
    const storeIds = [...new Set(orderItems.map(i => i.store.toString()))];
    for (const storeId of storeIds) {
      await Store.findByIdAndUpdate(storeId, {
        $inc: { 'stats.totalOrders': 1 }
      });
    }

    // Atualizar estatísticas dos produtos
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 'stats.sales': item.quantity }
      });
    }

    res.status(201).json({ message: 'Pedido criado', order });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Listar pedidos do usuário
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao listar pedidos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter pedido por ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product', 'name slug images');

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Erro ao obter pedido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter pedido por número
// @route   GET /api/orders/number/:orderNumber
// @access  Private
exports.getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
      user: req.user._id
    }).populate('items.product', 'name slug images');

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Erro ao obter pedido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Cancelar pedido
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Verificar se pode cancelar
    if (!['pending', 'paid'].includes(order.status)) {
      return res.status(400).json({ 
        message: 'Pedido não pode ser cancelado neste status' 
      });
    }

    // Restaurar estoque
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && item.variant) {
        const variant = product.variants.find(
          v => v.size === item.variant.size && 
          v.color?.name === item.variant.color?.name
        );
        if (variant) {
          variant.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.updateStatus('cancelled', reason || 'Cancelado pelo cliente');
    order.cancelReason = reason;
    await order.save();

    res.json({ message: 'Pedido cancelado', order });
  } catch (error) {
    console.error('Erro ao cancelar pedido:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// === ROTAS DO VENDEDOR ===

// @desc    Listar pedidos da loja
// @route   GET /api/orders/store
// @access  Private (seller)
exports.getStoreOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    const { page = 1, limit = 20, status } = req.query;

    const query = { 'items.store': store._id };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao listar pedidos da loja:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar status do pedido
// @route   PUT /api/orders/:id/status
// @access  Private (seller)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingCode } = req.body;

    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      'items.store': store._id
    });

    if (!order) {
      return res.status(404).json({ message: 'Pedido não encontrado' });
    }

    // Atualizar status
    order.updateStatus(status, note);

    // Se enviado, adicionar código de rastreio
    if (status === 'shipped' && trackingCode) {
      order.shipping.trackingCode = trackingCode;
      order.shipping.shippedAt = new Date();
    }

    // Se entregue
    if (status === 'delivered') {
      order.shipping.deliveredAt = new Date();
    }

    await order.save();

    res.json({ message: 'Status atualizado', order });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
