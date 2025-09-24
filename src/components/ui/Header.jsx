import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

import Input from './Input';
import AnnouncementBar from './AnnouncementBar';
import MegaMenu from './MegaMenu';
import CartDrawer from './CartDrawer';
import { useCart } from '../../contexts/CartContext.jsx';

const Header = ({ isLoggedIn = false, onSearch = () => {} }) => {
  const { cartItems, getCartItemCount, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }
    let ignore = false;
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const list = await fetch('/api/products');
        let items = await list.json();
        const qLower = q.toLowerCase();
        items = items.filter(p => String(p?.name || p?.title || '').toLowerCase().includes(qLower));
        const limited = items.slice(0, 8).map(p => ({
          id: p?.id,
          name: p?.name || p?.title,
          price: p?.price ?? p?.salePrice ?? 0,
          image: p?.imageUrl || p?.image || p?.thumbnailUrl || p?.image_path
        }));
        if (!ignore) {
          setSuggestions(limited);
          setSuggestionsOpen(true);
        }
      } catch (e) {
        if (!ignore) {
          setSuggestions([]);
          setSuggestionsOpen(false);
        }
      } finally {
        if (!ignore) setSearchLoading(false);
      }
    }, 250);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSearch = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery?.trim()) params.set('search', searchQuery.trim());
    const target = `/product-collection-grid${params.toString() ? `?${params.toString()}` : ''}`;
    navigate(target);
    if (searchQuery?.trim() && onSearch) onSearch(searchQuery.trim());
  };

  const navigationItems = [
    {
      label: '',
      path: '/product-collection-grid',
      hasDropdown: true,
      onClick: () => setIsMegaMenuOpen(!isMegaMenuOpen)
    },
    { label: 'Products', path: '/product-collection-grid' },
    { label: 'Account', path: '/user-account-dashboard' },
  ];

  return (
    <>
      {/* 4-Layer Announcement Bars */}
      {/* Orange Layer */}
      <div className="bg-warning text-warning-foreground py-2 text-center text-sm font-body">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <span>Free Shipping from Rs. 499 (Bangalore), Rs. 999 (Elsewhere)</span>
          <span>10% off on orders above Rs. 1499 with "FLAT10"</span>
        </div>
      </div>
      
      {/* Green Layer */}
      <div className="bg-accent text-accent-foreground py-2 text-center text-sm font-body">
        <div className="container mx-auto px-4">
          <span>Shop our Bestsellers at special prices</span>
        </div>
      </div>
      
      {/* White Layer with Search */}
      <div className="bg-white border-b border-border py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/homepage" className="flex items-center space-x-2">
              <div className="w-40 h-16 flex items-center justify-center">
                <img src="/assets/images/logo.png" alt="Logo" className="w-40 h-16 object-contain" />
              </div>
              
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 relative">
              <form onSubmit={handleSearch} className="w-full">
                <div className="relative w-full rounded-lg border border-border bg-background overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/40">
                  <Input
                    type="search"
                    placeholder="Search for products"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                    className="w-full border-0 focus:ring-0 pl-4 pr-12 py-3"
                  />
                  <button
                    type="submit"
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-muted-foreground hover:text-primary transition-colors duration-200"
                    aria-label="Search"
                    title="Search"
                  >
                    {searchLoading ? (
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <Icon name="Search" size={20} />
                    )}
                  </button>
                </div>
              </form>
              {/* Suggestions Dropdown */}
              {suggestionsOpen && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-card border border-border rounded-md shadow-warm z-50 overflow-hidden">
                  {suggestions.map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/product-detail-page?id=${item.id}`)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 text-left"
                    >
                      <img src={item.image || '/assets/images/no_image.png'} alt={item.name} className="w-10 h-10 object-cover rounded" />
                      <div className="flex-1">
                        <div className="text-sm text-foreground line-clamp-1">{item.name}</div>
                        <div className="text-xs text-muted-foreground">₹{(item.price || 0).toFixed(2)}</div>
                      </div>
                      <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                    </button>
                  ))}
                  <div className="border-t border-border">
                    <button
                      onClick={handleSearch}
                      className="w-full text-left p-3 text-sm hover:bg-muted/40"
                    >
                      View all results
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* User Account */}
              {isLoggedIn ? (
                <Link
                  to="/user-account-dashboard"
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200"
                >
                  <Icon name="User" size={20} />
                </Link>
              ) : (
                <Link
                  to="/user-login"
                  className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors duration-200"
                >
                  <Icon name="User" size={20} />
                </Link>
              )}

              {/* Cart */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative text-foreground hover:text-primary transition-colors duration-200"
              >
                <Icon name="ShoppingCart" size={20} />
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                    {getCartItemCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Green Navigation Layer */}
      <div className="bg-accent text-accent-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center">
            {/* Navigation Items */}
            <nav className="hidden lg:flex items-center ml-8 space-x-6">
              {navigationItems?.map((item, index) => (
                <div key={index} className="relative">
                  {item?.hasDropdown ? (
                    <button
                      onClick={item?.onClick}
                      className="flex items-center space-x-1 font-body font-medium hover:text-accent-foreground/80 transition-colors duration-200 py-3"
                    >
                      <span>{item?.label}</span>
                      <Icon
                        name="ChevronDown"
                        size={16}
                        className={`transform transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item?.path}
                      className="font-body font-medium hover:text-accent-foreground/80 transition-colors duration-200 py-3"
                    >
                      {item?.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden ml-auto p-2"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>
      </div>
      {/* Main Header Container */}
      <header className="sticky top-0 bg-background z-[1001] shadow-warm">

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              {navigationItems?.map((item, index) => (
                <div key={index}>
                  {item?.hasDropdown ? (
                    <button
                      onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
                      className="flex items-center justify-between w-full font-body font-medium text-foreground hover:text-primary transition-colors duration-200 py-2"
                    >
                      <span>{item?.label}</span>
                      <Icon
                        name="ChevronDown"
                        size={16}
                        className={`transform transition-transform duration-200 ${isMegaMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={item?.path}
                      className="block font-body font-medium text-foreground hover:text-primary transition-colors duration-200 py-2"
                    >
                      {item?.label}
                    </Link>
                  )}
                </div>
              ))}

              {/* Mobile-only links */}
              <Link
                to="/user-account-dashboard"
                className="flex items-center space-x-2 font-body font-medium text-foreground hover:text-primary transition-colors duration-200 py-2 sm:hidden"
              >
                <Icon name="User" size={16} />
                <span>My Account</span>
              </Link>
            </nav>
          </div>
        )}

        {/* Mega Menu */}
        <MegaMenu
          isOpen={isMegaMenuOpen}
          onClose={() => setIsMegaMenuOpen(false)}
        />
      </header>
      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </>
  );
};

export default Header;