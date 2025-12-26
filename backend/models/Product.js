const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true,
    maxlength: [200, 'Nome deve ter no máximo 200 caracteres']
  },
  slug: {
    type: String,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    maxlength: [5000, 'Descrição deve ter no máximo 5000 caracteres']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Descrição curta deve ter no máximo 300 caracteres']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    trim: true
  },
  images: [{
    url: { type: String, required: true },
    publicId: String,
    isMain: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  // Imagem para prova virtual (imagem da roupa isolada)
  tryOnImage: {
    url: String,
    publicId: String
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço não pode ser negativo']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Preço comparativo não pode ser negativo']
  },
  costPrice: {
    type: Number,
    min: [0, 'Preço de custo não pode ser negativo']
  },
  // Variações (tamanhos e cores)
  variants: [{
    size: {
      type: String,
      enum: ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG', '34', '36', '38', '40', '42', '44', '46', '48', '50', 'UNICO']
    },
    color: {
      name: String,
      hex: String
    },
    stock: { type: Number, default: 0, min: 0 },
    sku: String,
    price: Number, // Preço específico da variação (opcional)
    images: [{
      url: String,
      publicId: String
    }]
  }],
  // Atributos adicionais
  attributes: {
    material: String,
    composition: String, // Ex: "100% Algodão"
    weight: Number,
    gender: {
      type: String,
      enum: ['masculino', 'feminino', 'unissex', 'infantil']
    },
    fit: {
      type: String,
      enum: ['slim', 'regular', 'oversized', 'skinny', 'loose']
    },
    occasion: [String], // Ex: ['casual', 'formal', 'esporte']
    season: [String], // Ex: ['verão', 'inverno']
    care: [String] // Instruções de cuidado
  },
  // Medidas detalhadas
  measurements: {
    P: { chest: Number, waist: Number, length: Number, shoulder: Number },
    M: { chest: Number, waist: Number, length: Number, shoulder: Number },
    G: { chest: Number, waist: Number, length: Number, shoulder: Number },
    GG: { chest: Number, waist: Number, length: Number, shoulder: Number }
  },
  // Tabela de tamanhos personalizada
  sizeGuide: {
    type: String,
    maxlength: 2000
  },
  // Configurações de provador virtual
  tryOnSettings: {
    enabled: { type: Boolean, default: true },
    category: {
      type: String,
      enum: ['top', 'bottom', 'dress', 'outerwear', 'accessories']
    }
  },
  // Estatísticas
  stats: {
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    tryOns: { type: Number, default: 0 }
  },
  // Avaliações
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  // Tags para busca
  tags: [String],
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Gerar slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  }
  next();
});

// Calcular estoque total
productSchema.virtual('totalStock').get(function() {
  return this.variants.reduce((total, variant) => total + variant.stock, 0);
});

// Índices
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ store: 1, status: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema);