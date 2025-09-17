
import React, { useState, useEffect } from 'react';
import { Search, Eye, Package, Truck, CheckCircle, Download, Printer, AlertCircle } from 'lucide-react';
import orderApi from '../../../services/orderApi';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { downloadInvoice, printInvoice } from '../../../utils/invoiceGenerator';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const allOrders = await orderApi.getAllOrders();
      setOrders(allOrders || []);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    const matchesSearch = order.id.toString().includes(searchTerm) ||
                         order.shipping?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderApi.updateOrderStatus(orderId, newStatus);
      // Reload orders to get updated data
      loadOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status: ' + (err.message || 'Unknown error'));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Package className="w-4 h-4 text-warning" />;
      case 'processing':
        return <Package className="w-4 h-4 text-primary" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-primary" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Package className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-800 bg-yellow-100';
      case 'processing':
        return 'text-blue-800 bg-blue-100';
      case 'shipped':
        return 'text-indigo-800 bg-indigo-100';
      case 'delivered':
        return 'text-green-800 bg-green-100';
      case 'cancelled':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const handleDownloadInvoice = (order) => {
    try {
      // Create a mock settings object for invoice generation
      const settings = {
        companyName: "Neenu's Natural",
        companyAddress: "123 Natural Street, Bangalore, India",
        companyPhone: "+91 9876543210",
        companyEmail: "info@neenusnatural.com"
      };
      
      const customer = {
        name: order.shipping?.name || order.user?.name || 'Customer',
        email: order.user?.email || 'customer@example.com',
        phone: order.shipping?.phone || 'N/A'
      };
      
      downloadInvoice(order, customer, settings);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const handlePrintInvoice = (order) => {
    try {
      // Create a mock settings object for invoice generation
      const settings = {
        companyName: "Neenu's Natural",
        companyAddress: "123 Natural Street, Bangalore, India",
        companyPhone: "+91 9876543210",
        companyEmail: "info@neenusnatural.com"
      };
      
      const customer = {
        name: order.shipping?.name || order.user?.name || 'Customer',
        email: order.user?.email || 'customer@example.com',
        phone: order.shipping?.phone || 'N/A'
      };
      
      printInvoice(order, customer, settings);
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Failed to print invoice. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Track and manage customer orders</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={loadOrders}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Order Management</h1>
        <p className="text-muted-foreground">Track and manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search by order ID or customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-foreground">#{order.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.items?.length || 0} item(s)
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {order.shipping?.name || order.user?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {order.user?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-foreground">₹{order.total?.toFixed(2) || '0.00'}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {order.paymentMethod || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-border bg-background"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="p-1 text-primary hover:text-primary/80 transition-colors"
                        title="Download Invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(order)}
                        className="p-1 text-primary hover:text-primary/80 transition-colors"
                        title="Print Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
