import api from './api'

export const storeService = {
  getAll: (params) => api.get('/stores', { params }),
  getBySlug: (slug) => api.get(`/stores/${slug}`),
  
  // Vendedor
  getMyStore: () => api.get('/stores/my-store'),
  create: (data) => api.post('/stores', data),
  update: (data) => api.put('/stores/my-store', data),
  uploadLogo: (formData) => api.put('/stores/my-store/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadBanner: (formData) => api.put('/stores/my-store/banner', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => api.get('/stores/my-store/stats')
}
