import apiClient from './api';

const wishlistApi = {
  async getAll(email) {
    if (!email) throw new Error('User email is required');
    const res = await apiClient.get('/wishlist', { params: { email } });
    return res.data;
  },

  async getCount(email) {
    if (!email) throw new Error('User email is required');
    const res = await apiClient.get('/wishlist/count', { params: { email } });
    return typeof res.data === 'number' ? res.data : 0;
  },

  async add(email, { productId }) {
    if (!email) throw new Error('User email is required');
    if (!productId) throw new Error('Product ID is required');
    const res = await apiClient.post('/wishlist', { productId }, { params: { email } });
    return res.data;
  },

  async remove(email, { productId }) {
    if (!email) throw new Error('User email is required');
    if (!productId) throw new Error('Product ID is required');
    const res = await apiClient.delete(`/wishlist/${productId}`, { params: { email } });
    return res.status === 204 ? true : res.data;
  }
};

export default wishlistApi;
