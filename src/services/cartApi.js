import apiClient from './api';

const cartApi = {
  async getCart(email) {
    try {
      if (!email) {
        throw new Error('User email is required');
      }
      
      console.log('CartAPI: Fetching cart for user:', email);
      const res = await apiClient.get('/cart', { params: { email } });
      console.log('CartAPI: Successfully fetched cart with', res.data?.length || 0, 'items');
      return res.data;
    } catch (error) {
      console.error('CartAPI: Failed to fetch cart for user:', email, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        // Cart not found is normal for new users
        console.log('CartAPI: No cart found for user, returning empty cart');
        return [];
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch cart';
      
      throw new Error(`Unable to load cart: ${errorMessage}`);
    }
  },

  async add(email, { productId, quantity = 1 }) {
    try {
      if (!email) {
        throw new Error('User email is required');
      }
      if (!productId) {
        throw new Error('Product ID is required');
      }
      if (quantity < 1) {
        throw new Error('Quantity must be at least 1');
      }
      
      console.log('CartAPI: Adding product to cart:', { email, productId, quantity });
      const res = await apiClient.post('/cart/add', { productId, quantity }, { params: { email } });
      console.log('CartAPI: Successfully added product to cart');
      return res.data;
    } catch (error) {
      console.error('CartAPI: Failed to add product to cart:', { email, productId, quantity }, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 400) {
        const validationError = error.response?.data?.message || 'Invalid cart data';
        throw new Error(`Cannot add to cart: ${validationError}`);
      }
      
      if (error.response?.status === 404) {
        throw new Error('Product not found or out of stock');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to add to cart';
      
      throw new Error(`Unable to add to cart: ${errorMessage}`);
    }
  },

  async update(email, { productId, quantity }) {
    try {
      if (!email) {
        throw new Error('User email is required');
      }
      if (!productId) {
        throw new Error('Product ID is required');
      }
      if (quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }
      
      console.log('CartAPI: Updating cart item:', { email, productId, quantity });
      const res = await apiClient.post('/cart/update', { productId, quantity }, { params: { email } });
      console.log('CartAPI: Successfully updated cart item');
      return res.data;
    } catch (error) {
      console.error('CartAPI: Failed to update cart item:', { email, productId, quantity }, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 400) {
        const validationError = error.response?.data?.message || 'Invalid cart update data';
        throw new Error(`Cannot update cart: ${validationError}`);
      }
      
      if (error.response?.status === 404) {
        throw new Error('Cart item not found');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update cart';
      
      throw new Error(`Unable to update cart: ${errorMessage}`);
    }
  },

  async remove(email, { productId }) {
    try {
      if (!email) {
        throw new Error('User email is required');
      }
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      console.log('CartAPI: Removing product from cart:', { email, productId });
      const res = await apiClient.post('/cart/remove', { productId }, { params: { email } });
      console.log('CartAPI: Successfully removed product from cart');
      return res.status;
    } catch (error) {
      console.error('CartAPI: Failed to remove product from cart:', { email, productId }, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        // Item not found in cart - this might be okay
        console.log('CartAPI: Item not found in cart, treating as success');
        return 200;
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to remove from cart';
      
      throw new Error(`Unable to remove from cart: ${errorMessage}`);
    }
  }
};

export default cartApi;
