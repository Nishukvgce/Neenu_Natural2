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

  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
    setIsSearchOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (searchQuery?.trim() && onSearch) {
      onSearch(searchQuery);
    }
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
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <select
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-transparent border-none text-sm text-muted-foreground focus:outline-none"
                  onChange={e => {
                    const value = e.target.value;
                    if (value) navigate(value);
                  }}
                  defaultValue=""
                >
                  <option value="">All Categories</option>
                  <option value="/product-collection-grid?category=unpolished-pulses">Unpolished Pulses, Dals & Rice</option>
                  <option value="/product-collection-grid?category=poha">Poha / Aval</option>
                  <option value="/product-collection-grid?category=sugars-honey">Sugars & Honey</option>
                  <option value="/product-collection-grid?category=haircare">Haircare Products</option>
                  <option value="/product-collection-grid?category=skincare">Skincare Products</option>
                  <option value="/product-collection-grid?category=millet">Millet Items</option>
                  <option value="/product-collection-grid?category=powders">Powders</option>
                  <option value="/product-collection-grid?category=fries">Fries</option>
                  <option value="/product-collection-grid?category=herbal-handmade">Herbal Handmade</option>
                  <option value="/product-collection-grid?category=soaps">Soaps</option>
                  <option value="/product-collection-grid?category=snacks">Snacks</option>
                  <option value="/product-collection-grid?category=herbal-powders">Herbal Powders</option>
                </select>
                <Input
                  type="search"
                  placeholder="Search for products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                  className="pl-32 pr-12 py-3"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  <Icon name="Search" size={20} />
                </button>
              </form>
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
            {/* Shop by Category Button */}
            {/* <button
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              className="flex items-center space-x-2 px-4 py-3 bg-accent-foreground/10 hover:bg-accent-foreground/20 transition-colors duration-200"
            >
              <Icon name="Menu" size={16} />
              <span className="font-body font-medium">SHOP BY CATEGORY</span>
            </button> */}

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