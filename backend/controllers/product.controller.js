const Product = require('../models/Product');
const Store = require('../models/Store');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Criar produto
// @route   POST /api/products
// @access  Private (seller)
exports.createProduct = async (req, res) => {
  try {
    // Buscar loja do usuário
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Você não possui uma loja' });
    }

    // Verificar limite de produtos do plano
    const productCount = await Product.countDocuments({ store: store._id });
    if (productCount >= store.subscription.maxProducts) {
      return res.status(400).json({ 
        message: 'Limite de produtos atingido. Faça upgrade do seu plano.' 
      });
    }

    const productData = {
      ...req.body,
      store: store._id
    };

    const product = await Product.create(productData);

    // Atualizar contador de produtos da loja
    store.stats.totalProducts = productCount + 1;
    await store.save();

    res.status(201).json({ message: 'Produto criado', product });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Listar produtos (público)
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      store,
      minPrice,
      maxPrice,
      size,
      color,
      gender,
      sort = '-createdAt',
      status = 'active'
    } = req.query;

    const query = { status };

    // Busca por texto
    if (search) {
      query.$text = { $search: search };
    }

    // Filtros
    if (category) query.category = category;
    if (store) query.store = store;
    if (gender) query['attributes.gender'] = gender;

    // Filtro de preço
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filtro de tamanho
    if (size) {
      query['variants.size'] = size;
      query['variants.stock'] = { $gt: 0 };
    }

    // Filtro de cor
    if (color) {
      query['variants.color.name'] = new RegExp(color, 'i');
    }

    const products = await Product.find(query)
      .populate('store', 'name slug logo')
      .populate('category', 'name slug')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter produto por slug
// @route   GET /api/products/:slug
// @access  Public
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate('store', 'name slug logo rating')
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Incrementar visualizações
    product.stats.views += 1;
    await product.save();

    res.json({ product });
  } catch (error) {
    console.error('Erro ao obter produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter produto por ID
// @route   GET /api/products/id/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('store', 'name slug logo rating')
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Erro ao obter produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Listar produtos da minha loja
// @route   GET /api/products/my-products
// @access  Private (seller)
exports.getMyProducts = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    const { page = 1, limit = 20, status, search } = req.query;

    const query = { store: store._id };
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar produto
// @route   PUT /api/products/:id
// @access  Private (seller)
exports.updateProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    if (!store) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, store: store._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto atualizado', product });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Upload de imagens do produto
// @route   POST /api/products/:id/images
// @access  Private (seller)
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    const store = await Store.findOne({ owner: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, store: store._id });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await uploadImage(file.path, 'products');
      uploadedImages.push({
        url: result.url,
        publicId: result.publicId,
        isMain: product.images.length === 0 && uploadedImages.length === 0,
        order: product.images.length + uploadedImages.length
      });
      fs.unlinkSync(file.path);
    }

    product.images.push(...uploadedImages);
    await product.save();

    res.json({ message: 'Imagens enviadas', images: product.images });
  } catch (error) {
    console.error('Erro ao fazer upload das imagens:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Upload de imagem para provador virtual
// @route   POST /api/products/:id/tryon-image
// @access  Private (seller)
exports.uploadTryOnImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    const store = await Store.findOne({ owner: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, store: store._id });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Deletar imagem anterior se existir
    if (product.tryOnImage?.publicId) {
      await deleteImage(product.tryOnImage.publicId);
    }

    const result = await uploadImage(req.file.path, 'tryon_products');
    fs.unlinkSync(req.file.path);

    product.tryOnImage = {
      url: result.url,
      publicId: result.publicId
    };
    await product.save();

    res.json({ message: 'Imagem do provador enviada', tryOnImage: product.tryOnImage });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Deletar imagem do produto
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private (seller)
exports.deleteImage = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, store: store._id });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const image = product.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Imagem não encontrada' });
    }

    // Deletar do Cloudinary
    if (image.publicId) {
      await deleteImage(image.publicId);
    }

    product.images.pull(req.params.imageId);
    await product.save();

    res.json({ message: 'Imagem removida', images: product.images });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Deletar produto
// @route   DELETE /api/products/:id
// @access  Private (seller)
exports.deleteProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user._id });
    const product = await Product.findOne({ _id: req.params.id, store: store._id });

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // Deletar imagens do Cloudinary
    for (const image of product.images) {
      if (image.publicId) {
        await deleteImage(image.publicId);
      }
    }

    if (product.tryOnImage?.publicId) {
      await deleteImage(product.tryOnImage.publicId);
    }

    await product.deleteOne();

    // Atualizar contador da loja
    store.stats.totalProducts -= 1;
    await store.save();

    res.json({ message: 'Produto removido' });
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Produtos relacionados
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    const related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: 'active'
    })
      .populate('store', 'name slug')
      .limit(8);

    res.json({ products: related });
  } catch (error) {
    console.error('Erro ao obter produtos relacionados:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
