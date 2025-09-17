import apiClient from './api';

const userApi = {
  // Auth
  async login(credentials) {
    try {
      if (!credentials) {
        throw new Error('Login credentials are required');
      }
      if (!credentials.email) {
        throw new Error('Email is required');
      }
      if (!credentials.password) {
        throw new Error('Password is required');
      }
      
      console.log('UserAPI: Attempting login for user:', credentials.email);
      const res = await apiClient.post('/auth/login', credentials);
      console.log('UserAPI: Successfully logged in user:', credentials.email);
      return res.data;
    } catch (error) {
      console.error('UserAPI: Login failed for user:', credentials?.email, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      
      if (error.response?.status === 400) {
        const validationError = error.response?.data?.message || 'Invalid login data';
        throw new Error(validationError);
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Login failed';
      
      throw new Error(`Unable to login: ${errorMessage}`);
    }
  },

  async getProfile(email) {
    try {
      if (!email) {
        throw new Error('User email is required');
      }
      
      console.log('UserAPI: Fetching profile for user:', email);
      const res = await apiClient.get('/auth/profile', { params: { email } });
      console.log('UserAPI: Successfully fetched profile for user:', email);
      return res.data;
    } catch (error) {
      console.error('UserAPI: Failed to fetch profile for user:', email, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        throw new Error('User profile not found');
      }
      
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this profile');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch profile';
      
      throw new Error(`Unable to load profile: ${errorMessage}`);
    }
  },

  // Users (admin or self-service endpoints depending on backend)
  async getAll() {
    try {
      console.log('UserAPI: Fetching all users (admin)');
      const res = await apiClient.get('/admin/users');
      console.log('UserAPI: Successfully fetched users:', res.data?.length || 0);
      return res.data;
    } catch (error) {
      console.error('UserAPI: Failed to fetch all users:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 403) {
        throw new Error('You do not have admin permissions to view users');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch users';
      
      throw new Error(`Unable to load users: ${errorMessage}`);
    }
  },

  // Password update
  async updatePassword(email, payload) {
    try {
      if (!email) {
        throw new Error('User email is required');
      }
      if (!payload) {
        throw new Error('Password update data is required');
      }
      if (!payload.currentPassword) {
        throw new Error('Current password is required');
      }
      if (!payload.newPassword) {
        throw new Error('New password is required');
      }
      
      console.log('UserAPI: Updating password for user:', email);
      const res = await apiClient.post('/auth/password', payload, { params: { email } });
      console.log('UserAPI: Successfully updated password for user:', email);
      return res.data;
    } catch (error) {
      console.error('UserAPI: Failed to update password for user:', email, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 400) {
        const validationError = error.response?.data?.message || 'Invalid password data';
        throw new Error(validationError);
      }
      
      if (error.response?.status === 401) {
        throw new Error('Current password is incorrect');
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update password';
      
      throw new Error(`Unable to update password: ${errorMessage}`);
    }
  },

  // Addresses
  async getAddresses(email) {
    try {
      if (!email) {
        throw new Error('User email is required');
      }
      
      console.log('UserAPI: Fetching addresses for user:', email);
      const res = await apiClient.get('/addresses', { params: { email } });
      console.log('UserAPI: Successfully fetched addresses:', res.data?.length || 0);
      return res.data;
    } catch (error) {
      console.error('UserAPI: Failed to fetch addresses for user:', email, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        // No addresses found is normal
        console.log('UserAPI: No addresses found for user, returning empty array');
        return [];
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to fetch addresses';
      
      throw new Error(`Unable to load addresses: ${errorMessage}`);
    }
  },

  async addAddress(email, address) {
    try {
      if (!email) {
        throw new Error('User email is required');
      }
      if (!address) {
        throw new Error('Address data is required');
      }
      
      console.log('UserAPI: Adding address for user:', email);
      const res = await apiClient.post('/addresses', address, { params: { email } });
      console.log('UserAPI: Successfully added address for user:', email);
      return res.data;
    } catch (error) {
      console.error('UserAPI: Failed to add address for user:', email, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        address
      });
      
      if (error.response?.status === 400) {
        const validationError = error.response?.data?.message || 'Invalid address data';
        throw new Error(`Cannot add address: ${validationError}`);
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to add address';
      
      throw new Error(`Unable to add address: ${errorMessage}`);
    }
  },

  async updateAddress(email, id, address) {
    try {
      if (!email) {
        throw new Error('User email is required');
      }
      if (!id) {
        throw new Error('Address ID is required');
      }
      if (!address) {
        throw new Error('Address data is required');
      }
      
      console.log('UserAPI: Updating address for user:', email, 'ID:', id);
      const res = await apiClient.put(`/addresses/${id}`, address, { params: { email } });
      console.log('UserAPI: Successfully updated address for user:', email);
      return res.data;
    } catch (error) {
      console.error('UserAPI: Failed to update address for user:', email, 'ID:', id, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        address
      });
      
      if (error.response?.status === 404) {
        throw new Error('Address not found');
      }
      
      if (error.response?.status === 400) {
        const validationError = error.response?.data?.message || 'Invalid address data';
        throw new Error(`Cannot update address: ${validationError}`);
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to update address';
      
      throw new Error(`Unable to update address: ${errorMessage}`);
    }
  },

  async deleteAddress(email, id) {
    try {
      if (!email) {
        throw new Error('User email is required');
      }
      if (!id) {
        throw new Error('Address ID is required');
      }
      
      console.log('UserAPI: Deleting address for user:', email, 'ID:', id);
      const res = await apiClient.delete(`/addresses/${id}`, { params: { email } });
      console.log('UserAPI: Successfully deleted address for user:', email);
      return res.status;
    } catch (error) {
      console.error('UserAPI: Failed to delete address for user:', email, 'ID:', id, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      if (error.response?.status === 404) {
        // Address not found - might be okay
        console.log('UserAPI: Address not found, treating as success');
        return 200;
      }
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to delete address';
      
      throw new Error(`Unable to delete address: ${errorMessage}`);
    }
  }
};

export default userApi;
