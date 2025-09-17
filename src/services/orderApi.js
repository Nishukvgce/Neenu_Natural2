import apiClient from './api';

/**
 * Order API service for handling order-related operations
 * Provides methods for both user order history and admin order management
 */
const orderApi = {
  /**
   * Get all orders for a specific user
   * @param {string} email - User's email address
   * @returns {Promise<Array>} List of user's orders
   */
  async getUserOrders(email) {
    try {
      const response = await apiClient.get('/orders/user', {
        params: { email }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch orders');
    }
  },

  /**
   * Get all orders in the system (admin only)
   * @returns {Promise<Array>} List of all orders
   */
  async getAllOrders() {
    try {
      const response = await apiClient.get('/orders/admin');
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch orders');
    }
  },

  /**
   * Get a specific order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderById(orderId) {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch order');
    }
  },

  /**
   * Update the status of an order (admin only)
   * @param {number} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, status) {
    try {
      const response = await apiClient.post(`/orders/admin/${orderId}/status`, {
        status
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error(error.response?.data?.error || 'Failed to update order status');
    }
  },

  /**
   * Get orders by status (admin only)
   * @param {string} status - Status to filter by
   * @returns {Promise<Array>} List of orders with the specified status
   */
  async getOrdersByStatus(status) {
    try {
      const response = await apiClient.get(`/orders/admin/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch orders');
    }
  },

  /**
   * Get order statistics (admin only)
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStatistics() {
    try {
      const response = await apiClient.get('/orders/admin/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch statistics');
    }
  }
};

export default orderApi;
