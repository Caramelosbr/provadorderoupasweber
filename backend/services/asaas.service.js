/**
 * Serviço de integração com Asaas
 * Documentação: https://docs.asaas.com/
 */


const ASAAS_API_URL = process.env.ASAAS_ENVIRONMENT === 'production'
  ? 'https://api.asaas.com/v3'
  : 'https://sandbox.asaas.com/api/v3';

const headers = {
  'Content-Type': 'application/json',
  'access_token': process.env.ASAAS_API_KEY
};

/**
 * Criar ou buscar cliente no Asaas
 */
exports.createCustomer = async (customer) => {
  try {
    const response = await fetch(`${ASAAS_API_URL}/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: customer.name,
        email: customer.email,
        cpfCnpj: customer.cpfCnpj,
        phone: customer.phone,
        mobilePhone: customer.mobilePhone,
        address: customer.address,
        addressNumber: customer.addressNumber,
        complement: customer.complement,
        province: customer.neighborhood,
        postalCode: customer.postalCode,
        externalReference: customer.externalReference // ID do usuário no seu sistema
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.description || 'Erro ao criar cliente no Asaas');
    }

    return { success: true, customer: data };
  } catch (error) {
    console.error('Erro ao criar cliente Asaas:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Buscar cliente por CPF/CNPJ
 */
exports.findCustomerByCpfCnpj = async (cpfCnpj) => {
  try {
    const response = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cpfCnpj}`, {
      headers
    });

    const data = await response.json();

    if (data.data && data.data.length > 0) {
      return { success: true, customer: data.data[0] };
    }

    return { success: false, error: 'Cliente não encontrado' };
  } catch (error) {
    console.error('Erro ao buscar cliente Asaas:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Criar cobrança PIX
 */
exports.createPixPayment = async (paymentData) => {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer: paymentData.customerId, // ID do cliente no Asaas
        billingType: 'PIX',
        value: paymentData.value,
        dueDate: paymentData.dueDate || new Date().toISOString().split('T')[0],
        description: paymentData.description,
        externalReference: paymentData.orderId // ID do pedido no seu sistema
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.description || 'Erro ao criar cobrança PIX');
    }

    // Buscar QR Code do PIX
    const pixResponse = await fetch(`${ASAAS_API_URL}/payments/${data.id}/pixQrCode`, {
      headers
    });
    const pixData = await pixResponse.json();

    return {
      success: true,
      payment: {
        id: data.id,
        status: data.status,
        value: data.value,
        dueDate: data.dueDate,
        invoiceUrl: data.invoiceUrl,
        pixCode: pixData.payload,
        pixQrCode: pixData.encodedImage,
        expirationDate: pixData.expirationDate
      }
    };
  } catch (error) {
    console.error('Erro ao criar PIX Asaas:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Criar cobrança com Cartão de Crédito
 */
exports.createCardPayment = async (paymentData) => {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer: paymentData.customerId,
        billingType: 'CREDIT_CARD',
        value: paymentData.value,
        dueDate: paymentData.dueDate || new Date().toISOString().split('T')[0],
        description: paymentData.description,
        externalReference: paymentData.orderId,
        creditCard: {
          holderName: paymentData.card.holderName,
          number: paymentData.card.number,
          expiryMonth: paymentData.card.expiryMonth,
          expiryYear: paymentData.card.expiryYear,
          ccv: paymentData.card.ccv
        },
        creditCardHolderInfo: {
          name: paymentData.holder.name,
          email: paymentData.holder.email,
          cpfCnpj: paymentData.holder.cpfCnpj,
          postalCode: paymentData.holder.postalCode,
          addressNumber: paymentData.holder.addressNumber,
          phone: paymentData.holder.phone
        },
        installmentCount: paymentData.installments || 1,
        installmentValue: paymentData.installments > 1 
          ? (paymentData.value / paymentData.installments).toFixed(2)
          : null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.description || 'Erro ao processar cartão');
    }

    return {
      success: true,
      payment: {
        id: data.id,
        status: data.status,
        value: data.value,
        netValue: data.netValue,
        confirmedDate: data.confirmedDate,
        invoiceUrl: data.invoiceUrl
      }
    };
  } catch (error) {
    console.error('Erro ao criar pagamento cartão Asaas:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Criar cobrança Boleto
 */
exports.createBoletoPayment = async (paymentData) => {
  try {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Vencimento em 3 dias

    const response = await fetch(`${ASAAS_API_URL}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer: paymentData.customerId,
        billingType: 'BOLETO',
        value: paymentData.value,
        dueDate: paymentData.dueDate || dueDate.toISOString().split('T')[0],
        description: paymentData.description,
        externalReference: paymentData.orderId
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.description || 'Erro ao gerar boleto');
    }

    return {
      success: true,
      payment: {
        id: data.id,
        status: data.status,
        value: data.value,
        dueDate: data.dueDate,
        bankSlipUrl: data.bankSlipUrl,
        invoiceUrl: data.invoiceUrl,
        nossoNumero: data.nossoNumero,
        barCode: data.identificationField
      }
    };
  } catch (error) {
    console.error('Erro ao criar boleto Asaas:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Consultar status de pagamento
 */
exports.getPaymentStatus = async (paymentId) => {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.description || 'Erro ao consultar pagamento');
    }

    return {
      success: true,
      payment: {
        id: data.id,
        status: data.status, // PENDING, RECEIVED, CONFIRMED, OVERDUE, REFUNDED, etc.
        value: data.value,
        netValue: data.netValue,
        paymentDate: data.paymentDate,
        confirmedDate: data.confirmedDate
      }
    };
  } catch (error) {
    console.error('Erro ao consultar pagamento Asaas:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Estornar/Reembolsar pagamento
 */
exports.refundPayment = async (paymentId, value = null) => {
  try {
    const body = value ? { value } : {};

    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.description || 'Erro ao estornar pagamento');
    }

    return {
      success: true,
      refund: {
        id: data.id,
        status: data.status,
        value: data.value
      }
    };
  } catch (error) {
    console.error('Erro ao estornar pagamento Asaas:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancelar cobrança
 */
exports.cancelPayment = async (paymentId) => {
  try {
    const response = await fetch(`${ASAAS_API_URL}/payments/${paymentId}`, {
      method: 'DELETE',
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.description || 'Erro ao cancelar cobrança');
    }

    return { success: true, deleted: data.deleted };
  } catch (error) {
    console.error('Erro ao cancelar cobrança Asaas:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Listar cobranças
 */
exports.listPayments = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${ASAAS_API_URL}/payments?${params}`, {
      headers
    });

    const data = await response.json();

    return {
      success: true,
      payments: data.data,
      totalCount: data.totalCount,
      hasMore: data.hasMore
    };
  } catch (error) {
    console.error('Erro ao listar pagamentos Asaas:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Webhook handler - processa notificações do Asaas
 * Configure o webhook em: https://www.asaas.com/minhaConta/webhook
 */
exports.handleWebhook = async (event) => {
  const { event: eventType, payment } = event;

  console.log(`Webhook Asaas: ${eventType}`, payment?.id);

  // Eventos de pagamento
  switch (eventType) {
    case 'PAYMENT_CONFIRMED':
    case 'PAYMENT_RECEIVED':
      return { action: 'confirm_order', paymentId: payment.id, status: 'paid' };

    case 'PAYMENT_OVERDUE':
      return { action: 'mark_overdue', paymentId: payment.id, status: 'overdue' };

    case 'PAYMENT_REFUNDED':
      return { action: 'refund_order', paymentId: payment.id, status: 'refunded' };

    case 'PAYMENT_DELETED':
      return { action: 'cancel_order', paymentId: payment.id, status: 'cancelled' };

    default:
      return { action: 'none', eventType };
  }
};