import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import dataService from '../../services/dataService';
import userApi from '../../services/userApi';
import orderApi from '../../services/orderApi';
import wishlistApi from '../../services/wishlistApi';
import apiClient from '../../services/api';
import Header from '../../components/ui/Header';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardOverview from './components/DashboardOverview';
import OrderHistory from './components/OrderHistory';
import ProfileManagement from './components/ProfileManagement';
import AddressBook from './components/AddressBook';
import WishlistSection from './components/WishlistSection';
import PreferencesSection from './components/PreferencesSection';

const UserAccountDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: authUser, userProfile, loading } = useAuth();
  const { getCartItemCount } = useCart();
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Real orders data - moved before any useEffect that uses it
  const [orders, setOrders] = useState([]);

  // Convert relative or bare filenames to absolute URLs under API base for order item images
  const resolveImageUrl = (candidate) => {
    if (!candidate || typeof candidate !== 'string') return '';
    if (/^(https?:)?\/\//i.test(candidate) || candidate.startsWith('data:')) return candidate;
    // Extract filename if absolute path or contains backslashes
    if (/^[a-zA-Z]:\\/.test(candidate) || candidate.startsWith('\\\\') || candidate.startsWith('/') || candidate.includes('\\')) {
      const parts = candidate.split(/\\|\//);
      candidate = parts[parts.length - 1];
    }
    // Map bare filename to API image route
    if (/^[^/]+\.[a-zA-Z0-9]+$/.test(candidate)) {
      candidate = `/admin/products/images/${candidate}`;
    }
    const base = apiClient?.defaults?.baseURL || '';
    return candidate.startsWith('/') ? `${base}${candidate}` : `${base}/${candidate}`;
  };

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !authUser) {
      navigate('/user-login', { 
        state: { 
          from: '/user-account-dashboard',
          message: 'Please sign in to access your account dashboard'
        },
        replace: true
      });
    }
  }, [authUser, loading, navigate]);

  // Only use authenticated user data - fetch profile from backend
  const [user, setUser] = useState(null);

  // Calculate real user stats from orders
  useEffect(() => {
    if (Array.isArray(orders) && orders.length > 0) {
      const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0);
      const totalSaved = orders.reduce((sum, order) => sum + (parseFloat(order.discount) || 0), 0);
      const loyaltyPoints = Math.floor(totalSpent * 0.1); // 10% of spending as points
      
      setUser(prev => ({
        ...prev,
        totalOrders: orders.length,
        totalSpent: totalSpent.toFixed(2),
        totalSaved: totalSaved.toFixed(2),
        loyaltyPoints: loyaltyPoints,
        cartItemCount: getCartItemCount()
      }));
    }
  }, [orders, getCartItemCount]);

  // Fetch user profile from backend when logged in
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!authUser?.email) return;
        const profile = await userApi.getProfile(authUser.email);
        setUser({
          id: profile?.id,
          name: profile?.name || authUser?.name || authUser?.email,
          email: profile?.email || authUser?.email,
          phone: profile?.phone,
          dateOfBirth: profile?.dateOfBirth,
          gender: profile?.gender,
          memberSince: profile?.memberSince,
          totalOrders: profile?.totalOrders || 0,
          totalSpent: profile?.totalSpent || 0,
          totalSaved: profile?.totalSaved || 0,
          loyaltyPoints: profile?.loyaltyPoints || 0,
          cartItemCount: getCartItemCount(),
          wishlistCount: authUser?.wishlistCount || 0,
          lastPasswordChange: profile?.lastPasswordChange
        });
      } catch (e) {
        console.error('Failed to load profile', e);
      }
    };
    loadProfile();
  }, [authUser, getCartItemCount]);

  // Load user orders from backend API
  useEffect(() => {
    const loadUserOrders = async () => {
      try {
        if (user?.email) {
          const userOrders = await orderApi.getUserOrders(user.email);
          console.log('Loaded user orders:', userOrders);
          const normalized = (userOrders || []).map((order) => ({
            ...order,
            items: (order?.items || []).map((item) => {
              const resolvedImg = resolveImageUrl(item?.image || item?.productImage || item?.imageUrl || '');
              return {
                ...item,
                image: resolvedImg,
              };
            }),
          }));
          setOrders(normalized);
        }
      } catch (error) {
        console.error('Error loading user orders:', error);
        setOrders([]);
      }
    };

    if (user?.email) {
      loadUserOrders();
    }
  }, [user?.email]);

  // Addresses from backend
  const [addresses, setAddresses] = useState([]);
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        if (!authUser?.email) return;
        const list = await userApi.getAddresses(authUser.email);
        setAddresses(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load addresses', e);
        setAddresses([]);
      }
    };
    loadAddresses();
  }, [authUser?.email]);

  // Wishlist data - fetch from API
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  const toUiWishlist = (apiItems = []) => {
    return (apiItems || []).map(item => ({
      id: item.productId || item.id,
      productId: item.productId || item.id, // ensure productId is available for remove API
      name: item.productName || item.name,
      price: item.productPrice || item.price || 0,
      originalPrice: item.originalPrice || item.productPrice || item.price || 0,
      image: resolveImageUrl(item.productImage || item.image || item.imageUrl || ''),
      variants: item.variants || ["Default"],
      selectedVariant: item.selectedVariant || "Default",
      inStock: item.inStock !== false,
      rating: item.rating || 4.5,
      reviewCount: item.reviewCount || 0,
      badges: item.badges || [],
      addedDate: item.createdAt || item.addedDate || new Date().toISOString()
    }));
  };

  // Fetch wishlist from backend API
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!authUser?.email) {
        setWishlistItems([]);
        setWishlistCount(0);
        return;
      }

      try {
        setWishlistLoading(true);
        setWishlistError(null);
        
        console.log('Fetching wishlist for user:', authUser.email);
        
        const wishlistData = await wishlistApi.getAll(authUser.email);
        const transformedWishlist = toUiWishlist(wishlistData);
        setWishlistItems(transformedWishlist);
        try {
          const count = await wishlistApi.getCount(authUser.email);
          setWishlistCount(typeof count === 'number' ? count : transformedWishlist.length);
        } catch (e) {
          setWishlistCount(transformedWishlist.length);
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        setWishlistError(error.message);
        
        // Fallback to localStorage wishlist if API fails
        try {
          const localWishlist = localStorage.getItem('neenu_wishlist');
          if (localWishlist) {
            const parsedWishlist = JSON.parse(localWishlist);
            if (Array.isArray(parsedWishlist)) {
              setWishlistItems(parsedWishlist);
              console.log('Using localStorage wishlist as fallback');
              setWishlistCount(parsedWishlist.length);
            }
          } else {
            setWishlistItems([]);
            setWishlistCount(0);
          }
        } catch (localError) {
          console.error('Error loading localStorage wishlist:', localError);
          setWishlistItems([]);
          setWishlistCount(0);
        }
      } finally {
        setWishlistLoading(false);
      }
    };

    fetchWishlist();
  }, [authUser?.email]);

  // Refresh wishlist count when only count is needed (e.g., external updates)
  useEffect(() => {
    const fetchCount = async () => {
      if (!authUser?.email) return;
      try {
        const count = await wishlistApi.getCount(authUser.email);
        if (typeof count === 'number') setWishlistCount(count);
      } catch (e) {
        // ignore
      }
    };
    fetchCount();
  }, [authUser?.email]);

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    if (!authUser?.email) return;

    try {
      console.log('Removing product from wishlist:', productId);
      await wishlistApi.remove(authUser.email, { productId });
      // Hard re-fetch from DB to stay in sync with wishlist_items
      try {
        const fresh = await wishlistApi.getAll(authUser.email);
        setWishlistItems(toUiWishlist(fresh));
        const count = await wishlistApi.getCount(authUser.email);
        setWishlistCount(typeof count === 'number' ? count : (fresh?.length || 0));
      } catch (refreshErr) {
        // Fallback to optimistic local update if refresh fails
        setWishlistItems(prev => prev.filter(item => item.id !== productId));
        setWishlistCount(prev => Math.max(0, (prev || 0) - 1));
      }
      console.log('Successfully removed from wishlist');
      
      // Show success notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm bg-green-500 text-white';
      notification.innerHTML = '<div class="flex items-center gap-2"><span>Removed from wishlist!</span></div>';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      
      // Fallback: remove from localStorage
      try {
        const localWishlist = localStorage.getItem('neenu_wishlist');
        if (localWishlist) {
          const parsedWishlist = JSON.parse(localWishlist);
          const updatedWishlist = parsedWishlist.filter(item => item.id !== productId);
          localStorage.setItem('neenu_wishlist', JSON.stringify(updatedWishlist));
          setWishlistItems(updatedWishlist);
          setWishlistCount(updatedWishlist.length);
        }
      } catch (localError) {
        console.error('Error updating localStorage wishlist:', localError);
      }
    }
  };

  // Mock preferences data
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      orderUpdates: true,
      promotions: true,
      newsletter: false,
      productRecommendations: false,
      priceDropAlerts: true
    },
    smsNotifications: {
      orderUpdates: true,
      deliveryUpdates: true,
      promotions: false
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      marketingCommunication: false
    },
    shopping: {
      currency: 'INR',
      language: 'English',
      defaultPaymentMethod: 'COD',
      savePaymentMethods: false
    }
  });

  // Mock cart data
  const [cartItems] = useState([
    {
      id: 1,
      name: "Organic Turmeric Powder",
      variant: "500g",
      price: 299.00,
      quantity: 1,
      image: "https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg"
    }
  ]);

  const recentOrders = orders?.slice(0, 3);
  const loyaltyPoints = user?.loyaltyPoints;

  // Handle section changes from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const section = urlParams?.get('section');
    if (section && ['overview', 'orders', 'profile', 'addresses', 'wishlist', 'preferences']?.includes(section)) {
      setActiveSection(section);
    }
  }, [location]);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setIsMobileSidebarOpen(false);
  };

  const handleUpdateProfile = (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
    console.log('Profile updated:', updatedData);
  };

  const handleAddAddress = async (addressData) => {
    try {
      const saved = await userApi.addAddress(authUser.email, addressData);
      setAddresses(prev => [...prev, saved]);
    } catch (e) {
      console.error('Add address failed', e);
    }
  };

  const handleUpdateAddress = async (id, updatedData) => {
    try {
      const saved = await userApi.updateAddress(authUser.email, id, updatedData);
      setAddresses(prev => prev?.map(addr => addr?.id === id ? saved : addr));
    } catch (e) {
      console.error('Update address failed', e);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await userApi.deleteAddress(authUser.email, id);
      setAddresses(prev => prev?.filter(addr => addr?.id !== id));
    } catch (e) {
      console.error('Delete address failed', e);
    }
  };

  const handleSetDefaultAddress = (id) => {
    setAddresses(prev => prev?.map(addr => ({
      ...addr,
      isDefault: addr?.id === id
    })));
    console.log('Default address set:', id);
  };

  const handleAddToCart = (item) => {
    console.log('Added to cart:', item);
    // Handle add to cart logic
  };

  const handleUpdatePreferences = (updatedPreferences) => {
    setPreferences(updatedPreferences);
    console.log('Preferences updated:', updatedPreferences);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'orders':
        return <OrderHistory orders={orders} />;
      case 'profile':
        return <ProfileManagement user={user} onUpdateProfile={handleUpdateProfile} />;
      case 'addresses':
        return (
          <AddressBook
            addresses={addresses}
            onAddAddress={handleAddAddress}
            onUpdateAddress={handleUpdateAddress}
            onDeleteAddress={handleDeleteAddress}
            onSetDefault={handleSetDefaultAddress}
          />
        );
      case 'wishlist':
        return (
          <WishlistSection
            wishlistItems={wishlistItems}
            onRemoveFromWishlist={handleRemoveFromWishlist}
            onAddToCart={handleAddToCart}
          />
        );
      case 'preferences':
        return (
          <PreferencesSection
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
          />
        );
      case 'overview':
      default:
        return (
          <DashboardOverview
            user={user}
            recentOrders={recentOrders}
            loyaltyPoints={loyaltyPoints}
            wishlistCount={wishlistCount}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        isLoggedIn={!!authUser}
        onSearch={(query) => console.log('Search:', query)}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="w-full bg-card border border-border rounded-lg p-4 flex items-center justify-between"
            >
              <span className="font-body font-medium text-foreground">
                Account Menu
              </span>
              <span className="text-muted-foreground">
                {isMobileSidebarOpen ? '×' : '☰'}
              </span>
            </button>
            
            {isMobileSidebarOpen && (
              <div className="mt-4">
                <DashboardSidebar
                  user={user}
                  onSectionChange={handleSectionChange}
                  activeSection={activeSection}
                  wishlistCount={wishlistCount}
                />
              </div>
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <DashboardSidebar
              user={user}
              onSectionChange={handleSectionChange}
              activeSection={activeSection}
              wishlistCount={wishlistCount}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 lg:w-3/4">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccountDashboard;