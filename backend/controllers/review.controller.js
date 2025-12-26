const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Store = require('../models/Store');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Criar avaliação
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { 
      productId, 
      orderId, 
      rating, 
      title, 
      comment, 
      ratings,
      buyerInfo,
      usedTryOn,
      tryOnAccuracy
    } = req.body;

    // Verificar se pedido existe e pertence ao usuário
    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      status: 'delivered'
    });

    if (!order) {
      return res.status(400).json({ 
        message: 'Você só pode avaliar produtos de pedidos entregues' 
      });
    }

    // Verificar se produto está no pedido
    const orderItem = order.items.find(
      item => item.product.toString() === productId
    );

    if (!orderItem) {
      return res.status(400).json({ 
        message: 'Produto não encontrado neste pedido' 
      });
    }

    // Verificar se já avaliou
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId,
      order: orderId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Você já avaliou este produto' });
    }

    // Criar avaliação
    const review = await Review.create({
      user: req.user._id,
      product: productId,
      store: orderItem.store,
      order: orderId,
      rating,
      title,
      comment,
      ratings,
      buyerInfo,
      usedTryOn,
      tryOnAccuracy,
      isVerifiedPurchase: true
    });

    res.status(201).json({ message: 'Avaliação criada', review });
  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Upload de fotos da avaliação
// @route   POST /api/reviews/:id/images
// @access  Private
exports.uploadReviewImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    // Limite de 5 imagens
    if (review.images.length + req.files.length > 5) {
      return res.status(400).json({ message: 'Máximo de 5 imagens por avaliação' });
    }

    const uploadedImages = [];
    for (const file of req.files) {
      const result = await uploadImage(file.path, 'reviews');
      uploadedImages.push({
        url: result.url,
        publicId: result.publicId
      });
      fs.unlinkSync(file.path);
    }

    review.images.push(...uploadedImages);
    await review.save();

    res.json({ message: 'Imagens enviadas', images: review.images });
  } catch (error) {
    console.error('Erro ao fazer upload das imagens:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Listar avaliações de um produto
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', rating } = req.query;

    const query = { 
      product: req.params.productId,
      isApproved: true
    };
    if (rating) query.rating = Number(rating);

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Calcular distribuição de notas
    const distribution = await Review.aggregate([
      { $match: { product: req.params.productId, isApproved: true } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      reviews,
      distribution,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Marcar avaliação como útil
// @route   POST /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    // Verificar se já marcou
    if (review.helpful.users.includes(req.user._id)) {
      // Remover marcação
      review.helpful.users.pull(req.user._id);
      review.helpful.count -= 1;
    } else {
      // Adicionar marcação
      review.helpful.users.push(req.user._id);
      review.helpful.count += 1;
    }

    await review.save();

    res.json({ 
      helpful: review.helpful.count,
      isMarked: review.helpful.users.includes(req.user._id)
    });
  } catch (error) {
    console.error('Erro ao marcar avaliação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Minhas avaliações
// @route   GET /api/reviews/my-reviews
// @access  Private
exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name slug images')
      .sort('-createdAt');

    res.json({ reviews });
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar avaliação
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    const { rating, title, comment, ratings, buyerInfo } = req.body;

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { rating, title, comment, ratings, buyerInfo },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    res.json({ message: 'Avaliação atualizada', review });
  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Deletar avaliação
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    // Deletar imagens
    for (const image of review.images) {
      if (image.publicId) {
        await deleteImage(image.publicId);
      }
    }

    await review.deleteOne();

    res.json({ message: 'Avaliação removida' });
  } catch (error) {
    console.error('Erro ao deletar avaliação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// === ROTAS DO VENDEDOR ===

// @desc    Listar avaliações da loja
// @route   GET /api/reviews/store
// @access  Private (seller)
exports.getStoreReviews = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    const { page = 1, limit = 20, rating, responded } = req.query;

    const query = { store: store._id };
    if (rating) query.rating = Number(rating);
    if (responded === 'true') query.storeResponse = { $exists: true };
    if (responded === 'false') query.storeResponse = { $exists: false };

    const reviews = await Review.find(query)
      .populate('user', 'name')
      .populate('product', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Responder avaliação
// @route   POST /api/reviews/:id/respond
// @access  Private (seller)
exports.respondToReview = async (req, res) => {
  try {
    const { comment } = req.body;

    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, store: store._id },
      { 
        storeResponse: {
          comment,
          respondedAt: new Date()
        }
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    res.json({ message: 'Resposta enviada', review });
  } catch (error) {
    console.error('Erro ao responder avaliação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
