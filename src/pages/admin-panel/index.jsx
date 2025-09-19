import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import ProductManagement from './components/ProductManagement';
import UserManagement from './components/UserManagement';
import OrderManagement from './components/OrderManagement';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

const AdminPanel = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Always check authentication on component mount and route changes
    const checkAuthentication = () => {
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || 'null');
      const sessionData = localStorage.getItem('neenu_auth_session');
      
      // Trust backend-issued session stored at login
      const isAdmin = (adminUser?.role || '').toLowerCase() === 'admin';
      if (!isAdmin) {
        localStorage.removeItem('adminUser');
        localStorage.removeItem('neenu_auth_session');
        navigate('/admin-login', { replace: true });
        return false;
      }
      
      setCurrentUser(adminUser);
      return true;
    };

    // Run authentication check
    const isAuthenticated = checkAuthentication();
    
    // Set up periodic authentication check (every 30 seconds)
    const authInterval = setInterval(() => {
      checkAuthentication();
    }, 30000);
    
    return () => clearInterval(authInterval);
  }, [navigate]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement />;
      case 'users':
        return <UserManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUser) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        user={currentUser}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
