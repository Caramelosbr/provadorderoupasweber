const Store = require('../models/Store');
const User = require('../models/User');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Criar loja
// @route   POST /api/stores
// @access  Private (seller)
exports.createStore = async (req, res) => {
  try {
    // Verificar se usuário já tem uma loja
    const existingStore = await Store.findOne({ owner: req.user._id });
    if (existingStore) {
      return res.status(400).json({ message: 'Você já possui uma loja' });
    }

    const storeData = {
      ...req.body,
      owner: req.user._id
    };

    const store = await Store.create(storeData);

    // Atualizar role do usuário para seller
    await User.findByIdAndUpdate(req.user._id, { role: 'seller' });

    res.status(201).json({ message: 'Loja criada com sucesso', store });
  } catch (error) {
    console.error('Erro ao criar loja:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter loja do usuário logado
// @route   GET /api/stores/my-store
// @access  Private (seller)
exports.getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    res.json({ store });
  } catch (error) {
    console.error('Erro ao obter loja:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter loja por slug (público)
// @route   GET /api/stores/:slug
// @access  Public
exports.getStoreBySlug = async (req, res) => {
  try {
    const store = await Store.findOne({ 
      slug: req.params.slug,
      isActive: true
    }).populate('categories');
    
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    res.json({ store });
  } catch (error) {
    console.error('Erro ao obter loja:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Listar todas as lojas (público)
// @route   GET /api/stores
// @access  Public
exports.getStores = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      search, 
      city,
      category,
      sort = '-createdAt' 
    } = req.query;

    const query = { isActive: true };

    // Busca por texto
    if (search) {
      query.$text = { $search: search };
    }

    // Filtro por cidade
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    // Filtro por categoria
    if (category) {
      query.categories = category;
    }

    const stores = await Store.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-owner');

    const total = await Store.countDocuments(query);

    res.json({
      stores,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao listar lojas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar loja
// @route   PUT /api/stores/my-store
// @access  Private (seller)
exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findOneAndUpdate(
      { owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    res.json({ message: 'Loja atualizada', store });
  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Upload de logo da loja
// @route   PUT /api/stores/my-store/logo
// @access  Private (seller)
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    // Deletar logo anterior se existir
    if (store.logo?.publicId) {
      await deleteImage(store.logo.publicId);
    }

    // Upload para Cloudinary
    const result = await uploadImage(req.file.path, 'store_logos');

    // Remover arquivo local
    fs.unlinkSync(req.file.path);

    // Atualizar loja
    store.logo = {
      url: result.url,
      publicId: result.publicId
    };
    await store.save();

    res.json({ message: 'Logo atualizado', logo: store.logo });
  } catch (error) {
    console.error('Erro ao fazer upload do logo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Upload de banner da loja
// @route   PUT /api/stores/my-store/banner
// @access  Private (seller)
exports.uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    // Deletar banner anterior se existir
    if (store.banner?.publicId) {
      await deleteImage(store.banner.publicId);
    }

    // Upload para Cloudinary
    const result = await uploadImage(req.file.path, 'store_banners');

    // Remover arquivo local
    fs.unlinkSync(req.file.path);

    // Atualizar loja
    store.banner = {
      url: result.url,
      publicId: result.publicId
    };
    await store.save();

    res.json({ message: 'Banner atualizado', banner: store.banner });
  } catch (error) {
    console.error('Erro ao fazer upload do banner:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter estatísticas da loja
// @route   GET /api/stores/my-store/stats
// @access  Private (seller)
exports.getStoreStats = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    // Aqui você pode agregar mais estatísticas de outros models
    res.json({ 
      stats: store.stats,
      rating: store.rating,
      subscription: store.subscription
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
