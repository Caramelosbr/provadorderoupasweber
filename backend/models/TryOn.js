const mongoose = require('mongoose');

const tryOnSchema = new mongoose.Schema({
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
  // Imagem do usuário enviada
  userImage: {
    url: { type: String, required: true },
    publicId: String
  },
  // Imagem da roupa
  productImage: {
    url: { type: String, required: true },
    publicId: String
  },
  // Resultado gerado pela IA
  resultImage: {
    url: String,
    publicId: String
  },
  // Variação escolhida
  variant: {
    size: String,
    color: {
      name: String,
      hex: String
    }
  },
  // Status do processamento
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  // Dados da API de IA
  aiData: {
    provider: String,      // Nome do provider de IA
    requestId: String,     // ID da requisição
    processingTime: Number, // Tempo em ms
    error: String          // Mensagem de erro se houver
  },
  // Feedback do usuário
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    liked: Boolean,
    comment: String
  },
  // Se o usuário salvou o resultado
  isSaved: {
    type: Boolean,
    default: false
  },
  // Se o usuário compartilhou
  isShared: {
    type: Boolean,
    default: false
  },
  // Se levou a uma compra
  convertedToSale: {
    type: Boolean,
    default: false
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
  }
}, {
  timestamps: true
});

// Índices
tryOnSchema.index({ user: 1, createdAt: -1 });
tryOnSchema.index({ product: 1 });
tryOnSchema.index({ store: 1, createdAt: -1 });
tryOnSchema.index({ status: 1 });
tryOnSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

module.exports = mongoose.model('TryOn', tryOnSchema);
