import api from './api'

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateAvatar: (formData) => api.put('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateMeasurements: (data) => api.put('/users/measurements', data),
  uploadBodyPhoto: (formData) => api.put('/users/body-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data) => api.put('/users/change-password', data),
  
  // Endereços
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  
  // Favoritos
  getFavorites: () => api.get('/users/favorites'),
  toggleFavorite: (productId) => api.post(`/users/favorites/${productId}`)
}
