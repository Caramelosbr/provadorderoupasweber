const Category = require('../models/Category');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const fs = require('fs');

// @desc    Criar categoria (admin)
// @route   POST /api/categories
// @access  Private (admin)
exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ message: 'Categoria criada', category });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Listar categorias
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const { parent, featured, active = true } = req.query;

    const query = {};
    if (active) query.isActive = active === 'true';
    if (featured) query.isFeatured = featured === 'true';
    if (parent === 'null') {
      query.parent = null;
    } else if (parent) {
      query.parent = parent;
    }

    const categories = await Category.find(query)
      .populate('subcategories')
      .sort('order name');

    res.json({ categories });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Obter categoria por slug
// @route   GET /api/categories/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug })
      .populate('subcategories');

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Erro ao obter categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Atualizar categoria
// @route   PUT /api/categories/:id
// @access  Private (admin)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    res.json({ message: 'Categoria atualizada', category });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Upload de imagem da categoria
// @route   PUT /api/categories/:id/image
// @access  Private (admin)
exports.uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma imagem enviada' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    // Deletar imagem anterior se existir
    if (category.image?.publicId) {
      await deleteImage(category.image.publicId);
    }

    const result = await uploadImage(req.file.path, 'categories');
    fs.unlinkSync(req.file.path);

    category.image = {
      url: result.url,
      publicId: result.publicId
    };
    await category.save();

    res.json({ message: 'Imagem atualizada', image: category.image });
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Deletar categoria
// @route   DELETE /api/categories/:id
// @access  Private (admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    // Verificar se tem subcategorias
    const hasChildren = await Category.findOne({ parent: category._id });
    if (hasChildren) {
      return res.status(400).json({ 
        message: 'Não é possível excluir categoria com subcategorias' 
      });
    }

    // Deletar imagem do Cloudinary
    if (category.image?.publicId) {
      await deleteImage(category.image.publicId);
    }

    await category.deleteOne();

    res.json({ message: 'Categoria removida' });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

// @desc    Árvore de categorias completa
// @route   GET /api/categories/tree
// @access  Public
exports.getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true, parent: null })
      .populate({
        path: 'subcategories',
        match: { isActive: true },
        populate: {
          path: 'subcategories',
          match: { isActive: true }
        }
      })
      .sort('order name');

    res.json({ categories });
  } catch (error) {
    console.error('Erro ao obter árvore de categorias:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
