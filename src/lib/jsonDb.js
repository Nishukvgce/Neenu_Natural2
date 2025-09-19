import apiClient from '../services/api';

class JsonDatabase {
  constructor() {
    this.data = null;
    this.loadData();
  }

  async loadData() {
    try {
      // Initialize from localStorage first; per-method API calls will fetch live data
      const stored = localStorage.getItem('neenu_natural_db');
      if (stored) {
        this.data = JSON.parse(stored);
        console.log('Database loaded from localStorage');
      } else {
        // Initialize with minimal structure if nothing is available
        this.data = {
          users: [],
          products: [],
          orders: [],
          categories: []
        };
        console.log('Database initialized with empty structure');
      }
    } catch (error) {
      // Fallback initialization on any unexpected error
      this.data = {
        users: [],
        products: [],
        orders: [],
        categories: []
      };
      console.error('Failed to initialize database, using empty structure:', error);
    }
  }

  // User authentication
  async authenticateUser(username, password) {
    try {
      // Use backend API for authentication
      const response = await apiClient.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      console.error('Authentication failed:', error);
      
      // Fallback to local data if API fails
      await this.loadData();
      const user = this.data.users.find(u => 
        u.username === username && u.password === password && u.isActive
      );
      return user || null;
    }
  }

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user from API:', error);
      
      // Fallback to local data
      await this.loadData();
      return this.data.users.find(u => u.id === id) || null;
    }
  }

  // Products CRUD
  async getProducts() {
    try {
      const response = await apiClient.get('/admin/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products from API:', error);
      
      // Fallback to local data
      await this.loadData();
      return this.data.products;
    }
  }

  async getProductById(id) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product from API:', error);
      
      // Fallback to local data
      await this.loadData();
      return this.data.products.find(p => p.id === id) || null;
    }
  }

  async addProduct(product) {
    try {
      const response = await apiClient.post('/admin/products', product);
      return response.data;
    } catch (error) {
      console.error('Error adding product via API:', error);
      
      // Fallback to local storage
      await this.loadData();
      const newProduct = {
        ...product,
        id: (this.data.products.length + 1).toString(),
        createdAt: new Date().toISOString()
      };
      this.data.products.push(newProduct);
      this.saveData();
      return newProduct;
    }
  }

  async updateProduct(id, updates) {
    try {
      const response = await apiClient.put(`/admin/products/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating product via API:', error);
      
      // Fallback to local storage
      await this.loadData();
      const index = this.data.products.findIndex(p => p.id === id);
      if (index !== -1) {
        this.data.products[index] = { ...this.data.products[index], ...updates };
        this.saveData();
        return this.data.products[index];
      }
      return null;
    }
  }

  async deleteProduct(id) {
    try {
      await apiClient.delete(`/admin/products/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting product via API:', error);
      
      // Fallback to local storage
      await this.loadData();
      const index = this.data.products.findIndex(p => p.id === id);
      if (index !== -1) {
        this.data.products.splice(index, 1);
        this.saveData();
        return true;
      }
      return false;
    }
  }

  // Orders CRUD
  async getOrders() {
    try {
      const response = await apiClient.get('/orders/admin');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders from API:', error);
      
      // Fallback to local data
      await this.loadData();
      return this.data.orders;
    }
  }

  async addOrder(order) {
    try {
      const response = await apiClient.post('/orders', order);
      return response.data;
    } catch (error) {
      console.error('Error adding order via API:', error);
      
      // Fallback to local storage
      await this.loadData();
      const newOrder = {
        ...order,
        id: (this.data.orders.length + 1).toString(),
        createdAt: new Date().toISOString(),
        status: 'pending'
      };
      this.data.orders.push(newOrder);
      this.saveData();
      return newOrder;
    }
  }

  // Categories
  async getCategories() {
    try {
      const response = await apiClient.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories from API:', error);
      
      // Fallback to local data
      await this.loadData();
      return this.data.categories;
    }
  }

  // Save data (in a real app, this would save to server)
  saveData() {
    // Store in localStorage for persistence in browser
    localStorage.setItem('neenu_natural_db', JSON.stringify(this.data));
    console.log('Data saved to localStorage');
  }

  // Load from localStorage if available
  loadFromStorage() {
    const stored = localStorage.getItem('neenu_natural_db');
    if (stored) {
      this.data = JSON.parse(stored);
      return true;
    }
    return false;
  }
}

export const jsonDb = new JsonDatabase();
