import api from './api'

export const tryonService = {
  create: (data) => api.post('/tryon', data),
  createWithPhoto: (formData) => api.post('/tryon/with-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getById: (id) => api.get(`/tryon/${id}`),
  getMyTryOns: (params) => api.get('/tryon', { params }),
  save: (id) => api.put(`/tryon/${id}/save`),
  sendFeedback: (id, data) => api.put(`/tryon/${id}/feedback`, data),
  delete: (id) => api.delete(`/tryon/${id}`),
  
  // Vendedor
  getStoreStats: () => api.get('/tryon/store/stats')
}
