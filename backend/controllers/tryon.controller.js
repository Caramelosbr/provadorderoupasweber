const TryOn = require('../models/TryOn');
const Product = require('../models/Product');
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const tryonService = require('../services/tryon.service');
const fs = require('fs');

// @desc    Criar nova prova virtual
// @route   POST /api/tryon
// @access  Private
exports.createTryOn = async (req, res) => {
  try {
    const { productId, variant } = req.body;

    // Verificar produto
    const product = await Product.findById(productId).populate('store');
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Verificar se produto tem imagem para try-on
    if (!product.tryOnImage?.url && !product.images[0]?.url) {
      return res.status(400).json({ 
        message: 'Produto não possui imagem para prova virtual' 
      });
    }

    // Verificar se loja permite try-on
    if (!product.store.settings?.enableTryOn) {
      return res.status(400).json({ 
        message: 'Esta loja não possui provador virtual ativo' 
      });
    }

    // Verificar se usuário tem foto do corpo
    const user = await User.findById(req.user._id);
    if (!user.bodyPhoto?.url) {
      return res.status(400).json({ 
        message: 'Envie uma foto sua primeiro para usar o provador virtual',
        code: 'NO_BODY_PHOTO'
      });
    }

    // Criar registro de try-on
    const tryOn = await TryOn.create({
      user: req.user._id,
      product: productId,
      store: product.store._id,
      userImage: user.bodyPhoto,
      productImage: product.tryOnImage || { url: product.images[0].url },
      variant,
      status: 'pending'
    });

    // Processar com IA (assíncrono)
    // Em produção, isso seria uma fila de jobs
    processTryOn(tryOn._id);

    res.status(201).json({ 
      message: 'Prova virtual iniciada',
      tryOn: {
        id: tryOn._id,
        status: tryOn.status
      }
    });
  } catch (error) {
    console.error('Erro ao criar prova virtual:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// Função auxiliar para processar try-on
async function processTryOn(tryOnId) {
  try {
    const tryOn = await TryOn.findById(tryOnId);
    if (!tryOn) return;

    tryOn.status = 'processing';
    await tryOn.save();

    const startTime = Date.now();

    // Chamar serviço de IA
    const result = await tryonService.processVirtualTryOn(
      tryOn.userImage.url,
      tryOn.productImage.url
    );

    if (result.success) {
      tryOn.resultImage = {
        url: result.imageUrl,
        publicId: result.publicId
      };
      tryOn.status = 'completed';
      tryOn.aiData = {
        provider: result.provider,
        requestId: result.requestId,
        processingTime: Date.now() - startTime
      };

      // Incrementar contador de try-ons do produto
      await Product.findByIdAndUpdate(tryOn.product, {
        $inc: { 'stats.tryOns': 1 }
      });
    } else {
      tryOn.status = 'failed';
      tryOn.aiData = {
        error: result.error,
        processingTime: Date.now() - startTime
      };
    }

    await tryOn.save();
  } catch (error) {
    console.error('Erro ao processar try-on:', error);
    await TryOn.findByIdAndUpdate(tryOnId, {
      status: 'failed',
      'aiData.error': error.message
    });
  }
}

// @desc    Criar prova virtual com upload de foto
// @route   POST /api/tryon/with-photo
// @access  Private
exports.createTryOnWithPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma foto enviada' });
    }

    const { productId, variant } = req.body;

    // Verificar produto
    const product = await Product.findById(productId).populate('store');
    if (!product) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Upload da foto do usuário
    const uploadResult = await uploadImage(req.file.path, 'tryon_users');
    fs.unlinkSync(req.file.path);

    // Criar registro de try-on
    const tryOn = await TryOn.create({
      user: req.user._id,
      product: productId,
      store: product.store._id,
      userImage: {
        url: uploadResult.url,
        publicId: uploadResult.publicId
      },
      productImage: product.tryOnImage || { url: product.images[0].url },
      variant,
      status: 'pending'
    });

    // Processar com IA
    processTryOn(tryOn._id);

    res.status(201).json({ 
      message: 'Prova virtual iniciada',
      tryOn: {
        id: tryOn._id,
        status: tryOn.status
      }
    });
  } catch (error) {
    console.error('Erro ao criar prova virtual:', error);
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter status/resultado da prova virtual
// @route   GET /api/tryon/:id
// @access  Private
exports.getTryOn = async (req, res) => {
  try {
    const tryOn = await TryOn.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('product', 'name slug price images');

    if (!tryOn) {
      return res.status(404).json({ message: 'Prova virtual não encontrada' });
    }

    res.json({ tryOn });
  } catch (error) {
    console.error('Erro ao obter prova virtual:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Listar provas virtuais do usuário
// @route   GET /api/tryon
// @access  Private
exports.getMyTryOns = async (req, res) => {
  try {
    const { page = 1, limit = 20, saved } = req.query;

    const query = { user: req.user._id };
    if (saved === 'true') query.isSaved = true;

    const tryOns = await TryOn.find(query)
      .populate('product', 'name slug price images')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TryOn.countDocuments(query);

    res.json({
      tryOns,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao listar provas virtuais:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Salvar prova virtual
// @route   PUT /api/tryon/:id/save
// @access  Private
exports.saveTryOn = async (req, res) => {
  try {
    const tryOn = await TryOn.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isSaved: true },
      { new: true }
    );

    if (!tryOn) {
      return res.status(404).json({ message: 'Prova virtual não encontrada' });
    }

    res.json({ message: 'Prova virtual salva', tryOn });
  } catch (error) {
    console.error('Erro ao salvar prova virtual:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Enviar feedback da prova virtual
// @route   PUT /api/tryon/:id/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, liked, comment } = req.body;

    const tryOn = await TryOn.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { 
        feedback: { rating, liked, comment }
      },
      { new: true }
    );

    if (!tryOn) {
      return res.status(404).json({ message: 'Prova virtual não encontrada' });
    }

    res.json({ message: 'Feedback enviado', tryOn });
  } catch (error) {
    console.error('Erro ao enviar feedback:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Deletar prova virtual
// @route   DELETE /api/tryon/:id
// @access  Private
exports.deleteTryOn = async (req, res) => {
  try {
    const tryOn = await TryOn.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!tryOn) {
      return res.status(404).json({ message: 'Prova virtual não encontrada' });
    }

    // Deletar imagens do Cloudinary
    if (tryOn.userImage?.publicId) {
      await deleteImage(tryOn.userImage.publicId);
    }
    if (tryOn.resultImage?.publicId) {
      await deleteImage(tryOn.resultImage.publicId);
    }

    await tryOn.deleteOne();

    res.json({ message: 'Prova virtual removida' });
  } catch (error) {
    console.error('Erro ao deletar prova virtual:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// === ROTAS DO VENDEDOR ===

// @desc    Estatísticas de try-on da loja
// @route   GET /api/tryon/store/stats
// @access  Private (seller)
exports.getStoreTryOnStats = async (req, res) => {
  try {
    const Store = require('../models/Store');
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    const stats = await TryOn.aggregate([
      { $match: { store: store._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          converted: {
            $sum: { $cond: ['$convertedToSale', 1, 0] }
          },
          avgRating: { $avg: '$feedback.rating' }
        }
      }
    ]);

    res.json({ 
      stats: stats[0] || { total: 0, completed: 0, converted: 0, avgRating: 0 }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
