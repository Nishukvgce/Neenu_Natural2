import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DashboardOverview = ({ user, recentOrders, loyaltyPoints, wishlistCount }) => {
  const quickActions = [
    {
      title: 'Track Order',
      description: 'Check your order status',
      icon: 'Truck',
      action: 'orders'
    },
    {
      title: 'Reorder',
      description: 'Buy previous items',
      icon: 'RotateCcw',
      action: 'orders'
    },
    {
      title: 'Update Profile',
      description: 'Edit personal info',
      icon: 'Edit',
      action: 'profile'
    },
    {
      title: 'Add Address',
      description: 'New shipping address',
      icon: 'Plus',
      action: 'addresses'
    }
  ];

  const stats = [
    {
      label: 'Total Orders',
      value: user?.totalOrders || 0,
      icon: 'Package',
      color: 'text-primary'
    },
    // {
    //   label: 'Total Spent',
    //   value: `₹${user?.totalSpent || 0}`,
    //   icon: 'CreditCard',
    //   color: 'text-primary'
    // },
    // {
    //   label: 'Total Saved',
    //   value: `₹${user?.totalSaved || 0}`,
    //   icon: 'Wallet',
    //   color: 'text-success'
    // },
    {
      label: 'Cart Items',
      value: user?.cartItemCount || 0,
      icon: 'ShoppingCart',
      color: 'text-accent'
    },
    {
      label: 'Loyalty Points',
      value: loyaltyPoints || 0,
      icon: 'Star',
      color: 'text-warning'
    },
    {
      label: 'Wishlist Items',
      value: typeof wishlistCount === 'number' ? wishlistCount : (user?.wishlistCount || 0),
      icon: 'Heart',
      color: 'text-destructive'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
          Welcome back, {user?.name?.split(' ')?.[0]}!
        </h1>
        <p className="font-body text-muted-foreground">
          Manage your orders, profile, and preferences from your dashboard.
        </p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats?.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Icon name={stat?.icon} size={20} className={stat?.color} />
              <span className="font-data text-lg font-bold text-foreground">
                {stat?.value}
              </span>
            </div>
            <p className="font-caption text-sm text-muted-foreground">
              {stat?.label}
            </p>
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      {/* <div>
        <h2 className="font-heading text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions?.map((action, index) => (
            <button
              key={index}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-warm-md transition-shadow duration-200 text-left"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={action?.icon} size={16} className="text-primary" />
                </div>
                <h3 className="font-body font-medium text-foreground">
                  {action?.title}
                </h3>
              </div>
              <p className="font-caption text-sm text-muted-foreground">
                {action?.description}
              </p>
            </button>
          ))}
        </div>
      </div> */}
      {/* Recent Orders */}
      <div>
        {/* <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Recent Orders
          </h2>
          <Button variant="outline" size="sm">
            View All Orders
          </Button>
        </div> */}
        <div className="space-y-3">
          {recentOrders?.slice(0, 3)?.map((order) => (
            <div key={order?.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={order?.items?.[0]?.image}
                      alt={order?.items?.[0]?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-body font-medium text-foreground">
                      Order #{order?.orderNumber}
                    </p>
                    <p className="font-caption text-sm text-muted-foreground">
                      {order?.date} • {order?.items?.length} items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-data font-semibold text-foreground">
                    ₹{order?.total?.toFixed(2)}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-caption font-medium ${
                    order?.status === 'Delivered' ?'bg-success/10 text-success'
                      : order?.status === 'Shipped' ?'bg-primary/10 text-primary' :'bg-warning/10 text-warning'
                  }`}>
                    {order?.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-caption text-sm text-muted-foreground">
                  {order?.items?.[0]?.name}
                  {order?.items?.length > 1 && ` +${order?.items?.length - 1} more`}
                </p>
                <Button variant="outline" size="sm">
                  Track Order
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;