// Constantes da aplicação

// Roles de usuário
exports.USER_ROLES = {
  CUSTOMER: 'customer',
  SELLER: 'seller',
  ADMIN: 'admin'
};

// Status de pedido
exports.ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// Status de pagamento
exports.PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Métodos de pagamento
exports.PAYMENT_METHODS = {
  PIX: 'pix',
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BOLETO: 'boleto'
};

// Tamanhos de roupa
exports.SIZES = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'];
exports.NUMERIC_SIZES = ['34', '36', '38', '40', '42', '44', '46', '48', '50'];

// Gêneros
exports.GENDERS = {
  MALE: 'masculino',
  FEMALE: 'feminino',
  UNISEX: 'unissex',
  KIDS: 'infantil'
};

// Tipos de categoria para try-on
exports.TRYON_CATEGORIES = {
  TOP: 'top',
  BOTTOM: 'bottom',
  DRESS: 'dress',
  OUTERWEAR: 'outerwear',
  ACCESSORIES: 'accessories',
  SHOES: 'shoes'
};

// Status de try-on
exports.TRYON_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

// Planos de assinatura de loja
exports.SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'free',
    maxProducts: 50,
    features: ['Provador virtual básico', 'Suporte por email']
  },
  BASIC: {
    name: 'basic',
    maxProducts: 200,
    features: ['Provador virtual avançado', 'Relatórios básicos', 'Suporte prioritário']
  },
  PREMIUM: {
    name: 'premium',
    maxProducts: 1000,
    features: ['Provador virtual ilimitado', 'Relatórios completos', 'API personalizada', 'Suporte 24/7']
  },
  ENTERPRISE: {
    name: 'enterprise',
    maxProducts: -1, // ilimitado
    features: ['Tudo do Premium', 'White label', 'Integrações customizadas', 'Gerente de conta dedicado']
  }
};

// Mensagens de erro
exports.ERROR_MESSAGES = {
  UNAUTHORIZED: 'Não autorizado',
  FORBIDDEN: 'Acesso negado',
  NOT_FOUND: 'Recurso não encontrado',
  VALIDATION_ERROR: 'Erro de validação',
  INTERNAL_ERROR: 'Erro interno do servidor'
};

// Configurações de paginação
exports.PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};
