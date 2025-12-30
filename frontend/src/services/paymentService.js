import api from './api'

export const paymentService = {
  createCustomer: () => api.post('/payments/customer'),
  createPix: (orderId) => api.post('/payments/pix', { orderId }),
  createCard: (data) => api.post('/payments/card', data),
  createBoleto: (orderId) => api.post('/payments/boleto', { orderId }),
  getStatus: (paymentId) => api.get(`/payments/${paymentId}`),
  refund: (paymentId, value) => api.post(`/payments/${paymentId}/refund`, { value }),
  cancel: (paymentId) => api.delete(`/payments/${paymentId}`)
}
