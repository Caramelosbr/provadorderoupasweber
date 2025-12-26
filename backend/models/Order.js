const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
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
  name: String,
  image: String,
  variant: {
    size: String,
    color: {
      name: String,
      hex: String
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    state: String,
    zipCode: String
  },
  payment: {
    method: {
      type: String,
      enum: ['pix', 'credit_card', 'debit_card', 'boleto'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date,
    pixCode: String,
    pixQrCode: String,
    boletoUrl: String,
    boletoBarcode: String
  },
  pricing: {
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true }
  },
  coupon: {
    code: String,
    discount: Number
  },
  shipping: {
    method: String,
    carrier: String,
    trackingCode: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date
  },
  status: {
    type: String,
    enum: [
      'pending',        // Aguardando pagamento
      'paid',           // Pago
      'processing',     // Preparando
      'shipped',        // Enviado
      'delivered',      // Entregue
      'cancelled',      // Cancelado
      'refunded'        // Reembolsado
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    date: { type: Date, default: Date.now },
    note: String
  }],
  notes: String,
  cancelReason: String
}, {
  timestamps: true
});

// Gerar número do pedido
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.orderNumber = `PV${year}${month}${(count + 1).toString().padStart(6, '0')}`;
    
    // Adicionar status inicial ao histórico
    this.statusHistory.push({
      status: this.status,
      date: new Date(),
      note: 'Pedido criado'
    });
  }
  next();
});

// Método para atualizar status
orderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    date: new Date(),
    note
  });
};

// Índices
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'items.store': 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
