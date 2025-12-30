import api from './api'

export const reviewService = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  create: (data) => api.post('/reviews', data),
  uploadImages: (id, formData) => api.post(`/reviews/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  markHelpful: (id) => api.post(`/reviews/${id}/helpful`),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  
  // Vendedor
  getStoreReviews: (params) => api.get('/reviews/store', { params }),
  respond: (id, comment) => api.post(`/reviews/${id}/respond`, { comment })
}
