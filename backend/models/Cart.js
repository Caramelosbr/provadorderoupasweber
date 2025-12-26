const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
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
    min: [1, 'Quantidade mínima é 1'],
    default: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  coupon: {
    code: String,
    discount: Number,
    type: {
      type: String,
      enum: ['percentage', 'fixed']
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// Virtual para total de itens
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual para desconto
cartSchema.virtual('discountAmount').get(function() {
  if (!this.coupon) return 0;
  if (this.coupon.type === 'percentage') {
    return (this.subtotal * this.coupon.discount) / 100;
  }
  return this.coupon.discount;
});

// Virtual para total
cartSchema.virtual('total').get(function() {
  return this.subtotal - this.discountAmount;
});

// Índice
cartSchema.index({ user: 1 });

module.exports = mongoose.model('Cart', cartSchema);
