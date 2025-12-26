const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Obter carrinho do usuário
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name slug images price comparePrice store');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({ cart });
  } catch (error) {
    console.error('Erro ao obter carrinho:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Adicionar item ao carrinho
// @route   POST /api/cart/items
// @access  Private
exports.addItem = async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;

    // Verificar se produto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Verificar estoque
    if (variant) {
      const productVariant = product.variants.find(
        v => v.size === variant.size && 
        (!variant.color || v.color?.name === variant.color?.name)
      );
      if (!productVariant || productVariant.stock < quantity) {
        return res.status(400).json({ message: 'Estoque insuficiente' });
      }
    }

    // Buscar ou criar carrinho
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Verificar se item já existe no carrinho
    const existingItemIndex = cart.items.findIndex(
      item => 
        item.product.toString() === productId &&
        item.variant?.size === variant?.size &&
        item.variant?.color?.name === variant?.color?.name
    );

    if (existingItemIndex > -1) {
      // Atualizar quantidade
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Adicionar novo item
      cart.items.push({
        product: productId,
        variant,
        quantity,
        price: product.price
      });
    }

    await cart.save();
    await cart.populate('items.product', 'name slug images price comparePrice store');

    res.json({ message: 'Item adicionado ao carrinho', cart });
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar quantidade do item
// @route   PUT /api/cart/items/:itemId
// @access  Private
exports.updateItemQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantidade mínima é 1' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item não encontrado' });
    }

    // Verificar estoque
    const product = await Product.findById(item.product);
    if (item.variant) {
      const variant = product.variants.find(
        v => v.size === item.variant.size && 
        v.color?.name === item.variant.color?.name
      );
      if (!variant || variant.stock < quantity) {
        return res.status(400).json({ message: 'Estoque insuficiente' });
      }
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name slug images price comparePrice store');

    res.json({ message: 'Quantidade atualizada', cart });
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Remover item do carrinho
// @route   DELETE /api/cart/items/:itemId
// @access  Private
exports.removeItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product', 'name slug images price comparePrice store');

    res.json({ message: 'Item removido', cart });
  } catch (error) {
    console.error('Erro ao remover item:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Limpar carrinho
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      cart.coupon = undefined;
      await cart.save();
    }

    res.json({ message: 'Carrinho limpo' });
  } catch (error) {
    console.error('Erro ao limpar carrinho:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Aplicar cupom
// @route   POST /api/cart/coupon
// @access  Private
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    // TODO: Implementar validação de cupom com model de Coupon
    // Por enquanto, um cupom fake para teste
    const validCoupons = {
      'DESCONTO10': { discount: 10, type: 'percentage' },
      'FRETE': { discount: 20, type: 'fixed' }
    };

    const coupon = validCoupons[code.toUpperCase()];
    if (!coupon) {
      return res.status(400).json({ message: 'Cupom inválido' });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Carrinho não encontrado' });
    }

    cart.coupon = {
      code: code.toUpperCase(),
      discount: coupon.discount,
      type: coupon.type
    };
    await cart.save();
    await cart.populate('items.product', 'name slug images price comparePrice store');

    res.json({ message: 'Cupom aplicado', cart });
  } catch (error) {
    console.error('Erro ao aplicar cupom:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Remover cupom
// @route   DELETE /api/cart/coupon
// @access  Private
exports.removeCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.coupon = undefined;
      await cart.save();
      await cart.populate('items.product', 'name slug images price comparePrice store');
    }

    res.json({ message: 'Cupom removido', cart });
  } catch (error) {
    console.error('Erro ao remover cupom:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
