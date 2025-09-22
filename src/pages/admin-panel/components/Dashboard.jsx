import React, { useState, useEffect } from 'react';
import { 
  Package, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown, 
  AlertTriangle, Plus, BarChart3, Calendar, Eye, RefreshCw, Download, FileText
} from 'lucide-react';
import dataService from '../../../services/dataService';
import userApi from '../../../services/userApi';
import orderApi from '../../../services/orderApi';
import productApi from '../../../services/productApi';
import { 
  exportToCSV, 
  filterDataByDateRange, 
  formatOrdersForCSV, 
  formatUsersForCSV, 
  formatProductsForCSV, 
  formatRevenueDataForCSV,
  generateSummaryReport 
} from '../../../utils/csvExport';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: [],
    monthlyRevenue: 0,
    weeklyOrders: 0,
    topSellingProducts: [],
    pendingOrders: 0,
    completedOrders: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rawData, setRawData] = useState({
    products: [],
    users: [],
    orders: []
  });
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.relative')) {
        setShowExportMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get all data from backend APIs
      const [productsResponse, usersResponse, ordersResponse, orderStats] = await Promise.all([
        dataService.getProducts(),
        // Users endpoint returns non-admin users from backend
        userApi.getAll().catch(() => []),
        // Orders endpoint returns list of orders (DTOs)
        orderApi.getAllOrders().catch(() => []),
        // Optional: order statistics for authoritative totals
        orderApi.getOrderStatistics().catch(() => null)
      ]);

      const products = productsResponse?.data || [];
      const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse?.data || []);
      const orders = Array.isArray(ordersResponse) ? ordersResponse : (ordersResponse?.data || []);
      // Backend already returns non-admin users from /api/admin/users
      const customerUsers = users;
      
      // Store raw data for CSV export
      setRawData({
        products,
        users,
        orders
      });
      
      // Calculate revenue metrics
      const computedTotalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalRevenue = (orderStats && typeof orderStats.totalRevenue === 'number')
        ? orderStats.totalRevenue
        : computedTotalRevenue;
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
      
      // Calculate date-based metrics
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentWeek = getWeekNumber(now);
      
      const monthlyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === now.getFullYear();
      });
      
      const weeklyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return getWeekNumber(orderDate) === currentWeek && orderDate.getFullYear() === now.getFullYear();
      });
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      // Order status counts
      const pendingOrders = (orderStats && typeof orderStats.pendingOrders === 'number')
        ? orderStats.pendingOrders
        : orders.filter(order => (order.status || '').toLowerCase() === 'pending').length;
      const deliveredCount = (orderStats && typeof orderStats.deliveredOrders === 'number')
        ? orderStats.deliveredOrders
        : orders.filter(order => (order.status || '').toLowerCase() === 'delivered').length;
      const completedOrders = Math.max(deliveredCount, orders.filter(order => {
        const st = (order.status || '').toLowerCase();
        return st === 'delivered' || st === 'completed';
      }).length);
      
      // Product analytics
      const lowStockProducts = products.filter(p => (p.stockQuantity || 0) < 10);
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      // Top selling products (based on order frequency)
      const productSales = {};
      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            const productId = item.productId || item.id;
            if (productId) {
              productSales[productId] = (productSales[productId] || 0) + (item.quantity || 1);
            }
          });
        }
      });
      
      const topSellingProducts = Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([productId, quantity]) => {
          const product = products.find(p => p.id == productId);
          return product ? { ...product, soldQuantity: quantity } : null;
        })
        .filter(Boolean);
      
      setStats({
        totalProducts: products.length,
        // Customers are the non-admin users returned by backend
        totalUsers: users.length,
        totalOrders: (orderStats && typeof orderStats.totalOrders === 'number') ? orderStats.totalOrders : orders.length,
        totalRevenue,
        monthlyRevenue,
        weeklyOrders: weeklyOrders.length,
        averageOrderValue,
        pendingOrders,
        completedOrders,
        recentOrders,
        lowStockProducts,
        topSellingProducts
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  const handleQuickRestockProduct = async (productId) => {
    const restockAmount = prompt('Enter quantity to add to stock:');
    if (restockAmount && !isNaN(restockAmount) && parseInt(restockAmount) > 0) {
      try {
        // Load current product details from backend
        const productsRes = await dataService.getProducts();
        const product = (productsRes?.data || []).find(p => p.id === productId);
        if (!product) {
          alert('Product not found. Please refresh and try again.');
          return;
        }

        const newStock = (product.stockQuantity || 0) + parseInt(restockAmount, 10);
        const payload = { ...product, stockQuantity: newStock, inStock: newStock > 0 };

        // Persist to backend
        await productApi.update(productId, payload);

        await loadDashboardData(); // Refresh data from backend
        alert(`Stock updated! ${product.name} now has ${newStock} items in stock.`);
      } catch (error) {
        console.error('Error updating stock:', error);
        alert('Failed to update stock. Please try again.');
      }
    }
  };
  
  const handleBulkRestock = () => {
    // Show modal or navigate to bulk stock management
    // alert('Bulk restock feature - would open a dedicated stock management interface');
  };

  // CSV Export Functions
  const handleExportOrders = (filterType) => {
    const filteredOrders = filterDataByDateRange(rawData.orders, filterType);
    const formattedData = formatOrdersForCSV(filteredOrders);
    const filename = `orders_${filterType}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(formattedData, filename);
    setShowExportMenu(false);
  };

  const handleExportUsers = (filterType) => {
    const filteredUsers = filterDataByDateRange(rawData.users.filter(u => u.role === 'customer'), filterType);
    const formattedData = formatUsersForCSV(filteredUsers);
    const filename = `users_${filterType}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(formattedData, filename);
    setShowExportMenu(false);
  };

  const handleExportProducts = () => {
    const formattedData = formatProductsForCSV(rawData.products);
    const filename = `products_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(formattedData, filename);
    setShowExportMenu(false);
  };

  const handleExportRevenue = (filterType) => {
    const formattedData = formatRevenueDataForCSV(rawData.orders, filterType);
    const filename = `revenue_${filterType}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(formattedData, filename);
    setShowExportMenu(false);
  };

  const handleExportSummary = (filterType) => {
    const summaryData = generateSummaryReport(rawData.products, rawData.users, rawData.orders, filterType);
    const filename = `summary_report_${filterType}_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(summaryData, filename);
    setShowExportMenu(false);
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary' }) => (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-body text-muted-foreground">{title}</p>
          <p className="text-2xl font-heading font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}/10 flex-shrink-0`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Export Button with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
                <div className="p-3">
                  <div className="space-y-3">
                    {/* Summary Report */}
                    <div className="border-b border-border pb-3">
                      <h3 className="font-medium text-foreground mb-2 flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        Summary Report
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
                          <button
                            key={period}
                            onClick={() => handleExportSummary(period)}
                            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors capitalize"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Orders */}
                    <div className="border-b border-border pb-3">
                      <h3 className="font-medium text-foreground mb-2">Orders</h3>
                      <div className="flex flex-wrap gap-1">
                        {['daily', 'weekly', 'monthly', 'yearly', 'all'].map(period => (
                          <button
                            key={period}
                            onClick={() => handleExportOrders(period)}
                            className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded hover:bg-accent/80 transition-colors capitalize"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Users */}
                    <div className="border-b border-border pb-3">
                      <h3 className="font-medium text-foreground mb-2">Customers</h3>
                      <div className="flex flex-wrap gap-1">
                        {['daily', 'weekly', 'monthly', 'yearly', 'all'].map(period => (
                          <button
                            key={period}
                            onClick={() => handleExportUsers(period)}
                            className="px-2 py-1 text-xs bg-success text-success-foreground rounded hover:bg-success/80 transition-colors capitalize"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="border-b border-border pb-3">
                      <h3 className="font-medium text-foreground mb-2">Revenue</h3>
                      <div className="flex flex-wrap gap-1">
                        {['daily', 'weekly', 'monthly', 'yearly'].map(period => (
                          <button
                            key={period}
                            onClick={() => handleExportRevenue(period)}
                            className="px-2 py-1 text-xs bg-warning text-warning-foreground rounded hover:bg-warning/80 transition-colors capitalize"
                          >
                            {period}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Products */}
                    <div>
                      <h3 className="font-medium text-foreground mb-2">Products</h3>
                      <button
                        onClick={handleExportProducts}
                        className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded hover:bg-muted/80 transition-colors"
                      >
                        Export All Products
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-2 border-t border-border">
                  <button
                    onClick={() => setShowExportMenu(false)}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    Close Menu
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          subtitle={`${stats.lowStockProducts.length} low stock`}
          icon={Package}
          color="primary"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalUsers}
          subtitle="Active users"
          icon={Users}
          color="success"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle={`${stats.pendingOrders} pending`}
          icon={ShoppingCart}
          color="warning"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          subtitle={`Avg: ₹${Math.round(stats.averageOrderValue)}`}
          icon={DollarSign}
          color="success"
        />
      </div>
      
      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          subtitle="This month"
          icon={BarChart3}
          color="primary"
        />
        <StatCard
          title="Weekly Orders"
          value={stats.weeklyOrders}
          subtitle="This week"
          icon={Calendar}
          color="success"
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          subtitle="Need attention"
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Completed Orders"
          value={stats.completedOrders}
          subtitle="Successfully delivered"
          icon={ShoppingCart}
          color="success"
        />
      </div>

      {/* Dashboard Sections - 2x2 Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-foreground">Revenue Overview</h2>
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Revenue</span>
              <span className="font-semibold text-foreground">₹{stats.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-semibold text-primary">₹{stats.monthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.totalRevenue > 0 ? Math.min((stats.monthlyRevenue / stats.totalRevenue) * 100, 100) : 0}%` 
                }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-success/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Avg Order</p>
                <p className="font-semibold text-success">₹{Math.round(stats.averageOrderValue)}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="font-semibold text-primary">
                  {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-foreground">Top Selling</h2>
            <Eye className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {stats.topSellingProducts.length > 0 ? (
              stats.topSellingProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-body font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.weight || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body font-bold text-primary">{product.soldQuantity} sold</p>
                    <p className="text-sm text-success">₹{product.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No sales data yet</p>
              </div>
            )}
          </div>
        </div>
        {/* Stock Alerts */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-warning" />
              <h2 className="text-lg font-heading font-semibold text-foreground">Stock Alerts</h2>
              {stats.lowStockProducts.length > 0 && (
                <span className="ml-2 bg-warning text-warning-foreground px-2 py-1 rounded-full text-xs font-medium">
                  {stats.lowStockProducts.length}
                </span>
              )}
            </div>
            <button
              onClick={handleBulkRestock}
              className="flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {/* <span>+ Bulk</span> */}
            </button>
          </div>
          <div className="space-y-3">
            {stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                  <div className="flex-1">
                    <p className="font-body font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.weight || 'N/A'}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className={`font-body font-bold ${
                        (product.stockQuantity || 0) <= 5 ? 'text-destructive' : 'text-warning'
                      }`}>
                        {product.stockQuantity || 0} left
                      </p>
                    </div>
                    <button
                      onClick={() => handleQuickRestockProduct(product.id)}
                      className="px-3 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="w-8 h-8 text-success mx-auto mb-2" />
                <p className="text-success font-medium">All products well stocked!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold text-foreground">Recent Orders</h2>
            <ShoppingCart className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                  <div className="flex-1">
                    <p className="font-body font-medium text-foreground">#{order.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress?.firstName || order.customerName || 'Customer'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-body font-bold text-foreground">₹{(order.total || 0).toLocaleString()}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize mt-1 ${
                      order.status === 'pending' ? 'bg-warning/20 text-warning' :
                      order.status === 'processing' ? 'bg-primary/20 text-primary' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'delivered' || order.status === 'completed' ? 'bg-success/20 text-success' :
                      order.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
