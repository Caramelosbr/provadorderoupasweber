const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Avaliação é obrigatória'],
    min: [1, 'Avaliação mínima é 1'],
    max: [5, 'Avaliação máxima é 5']
  },
  title: {
    type: String,
    maxlength: [100, 'Título deve ter no máximo 100 caracteres']
  },
  comment: {
    type: String,
    required: [true, 'Comentário é obrigatório'],
    maxlength: [1000, 'Comentário deve ter no máximo 1000 caracteres']
  },
  // Avaliações específicas
  ratings: {
    quality: { type: Number, min: 1, max: 5 },       // Qualidade do produto
    fit: { type: Number, min: 1, max: 5 },           // Caimento/tamanho
    valueForMoney: { type: Number, min: 1, max: 5 }, // Custo-benefício
    delivery: { type: Number, min: 1, max: 5 }       // Entrega
  },
  // Informações do comprador
  buyerInfo: {
    size: String,        // Tamanho comprado
    height: String,      // Altura do comprador
    weight: String,      // Peso
    fitFeedback: {       // Feedback sobre tamanho
      type: String,
      enum: ['too_small', 'slightly_small', 'perfect', 'slightly_large', 'too_large']
    }
  },
  // Fotos da avaliação
  images: [{
    url: String,
    publicId: String
  }],
  // Se usou provador virtual antes
  usedTryOn: {
    type: Boolean,
    default: false
  },
  tryOnAccuracy: {
    type: Number,
    min: 1,
    max: 5
  },
  // Moderação
  isApproved: {
    type: Boolean,
    default: true
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  },
  // Interações
  helpful: {
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  // Resposta da loja
  storeResponse: {
    comment: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Índice único para evitar avaliações duplicadas
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Outros índices
reviewSchema.index({ product: 1, isApproved: 1, createdAt: -1 });
reviewSchema.index({ store: 1, isApproved: 1 });
reviewSchema.index({ rating: 1 });

// Atualizar média do produto após salvar
reviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const reviews = await this.constructor.find({ 
    product: this.product, 
    isApproved: true 
  });
  
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  
  await Product.findByIdAndUpdate(this.product, {
    'rating.average': Math.round(avgRating * 10) / 10,
    'rating.count': reviews.length
  });
});

module.exports = mongoose.model('Review', reviewSchema);