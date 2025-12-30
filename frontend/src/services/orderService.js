import api from './api'

export const orderService = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  
  // Vendedor
  getStoreOrders: (params) => api.get('/orders/store', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data)
}
