import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const DashboardSidebar = ({ user, onSectionChange, activeSection }) => {
  const location = useLocation();

  const menuItems = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      description: 'Account overview'
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: 'Package',
      description: 'Order history & tracking'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      description: 'Personal information'
    },
    {
      id: 'addresses',
      label: 'Address Book',
      icon: 'MapPin',
      description: 'Shipping addresses'
    },
    {
      id: 'wishlist',
      label: 'Wishlist',
      icon: 'Heart',
      description: 'Saved products'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-24">
      {/* User Info */}
      <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-border">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="User" size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-foreground">
            {user?.name}
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            {user?.email}
          </p>
        </div>
      </div>
      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems?.map((item) => (
          <button
            key={item?.id}
            onClick={() => onSectionChange(item?.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 text-left ${
              activeSection === item?.id
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <Icon 
              name={item?.icon} 
              size={20} 
              className={activeSection === item?.id ? 'text-primary-foreground' : 'text-muted-foreground'}
            />
            <div>
              <div className={`font-body font-medium ${
                activeSection === item?.id ? 'text-primary-foreground' : 'text-foreground'
              }`}>
                {item?.label}
              </div>
              <div className={`font-caption text-xs ${
                activeSection === item?.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
                {item?.description}
              </div>
            </div>
          </button>
        ))}
      </nav>
      {/* Logout Button */}
      <div className="mt-6 pt-6 border-t border-border">
        <Link
          to="/homepage"
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors duration-200"
        >
          <Icon name="LogOut" size={20} />
          <span className="font-body font-medium">Logout</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardSidebar;