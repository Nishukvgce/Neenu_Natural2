import apiClient from './api';

const categoryApi = {
  async getAll() {
    const res = await apiClient.get('/categories');
    return res.data;
  },
  async getById(categoryId) {
    const res = await apiClient.get(`/categories/${categoryId}`);
    return res.data;
  },
  async add(categoryPayload) {
    const res = await apiClient.post('/admin/categories', categoryPayload);
    return res.data;
  },
  async update(categoryId, categoryPayload) {
    const res = await apiClient.put(`/admin/categories/${categoryId}`, categoryPayload);
    return res.data;
  },
  async remove(categoryId) {
    const res = await apiClient.delete(`/admin/categories/${categoryId}`);
    return res.data;
  }
};

export default categoryApi;
