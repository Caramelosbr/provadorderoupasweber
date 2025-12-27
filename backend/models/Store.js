const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Nome da loja é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Descrição deve ter no máximo 1000 caracteres']
  },
  logo: {
    url: String,
    publicId: String
  },
  banner: {
    url: String,
    publicId: String
  },
  cnpj: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  whatsapp: String,
  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String
  },
  socialMedia: {
    instagram: String,
    facebook: String,
    tiktok: String,
    youtube: String
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  settings: {
    enableTryOn: { type: Boolean, default: true },
    freeShippingMinValue: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    acceptedPayments: [{
      type: String,
      enum: ['pix', 'credit_card', 'debit_card', 'boleto']
    }]
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  stats: {
    totalSales: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    expiresAt: Date,
    maxProducts: { type: Number, default: 50 }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Gerar slug automaticamente
storeSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Índices
storeSchema.index({ name: 'text', description: 'text' });
// ✅ REMOVIDO: storeSchema.index({ slug: 1 }); - Duplicado, já está como unique no schema
storeSchema.index({ owner: 1 });
storeSchema.index({ 'address.city': 1 });
storeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Store', storeSchema);