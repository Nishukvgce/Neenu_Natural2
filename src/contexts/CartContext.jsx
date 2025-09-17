
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import cartApi from '../services/cartApi';

const CartContext = createContext({});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Simple notification function
  const showNotification = (message, type = 'success') => {
    // Create a simple toast notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          ${type === 'success' 
            ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>'
            : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>'
          }
        </svg>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const { user } = useAuth();

  // Load cart from backend for logged-in users; fallback to local for guests
  useEffect(() => {
    const init = async () => {
      const savedForLater = localStorage.getItem('neenu_saved_items');
      const savedWishlist = localStorage.getItem('neenu_wishlist');
      if (savedForLater) {
        try { setSavedItems(JSON.parse(savedForLater)); } catch {}
      }
      if (savedWishlist) {
        try { setWishlistItems(JSON.parse(savedWishlist)); } catch {}
      }
      if (user?.email) {
        try {
          const serverCart = await cartApi.getCart(user.email);
          setCartItems(serverCart.map(ci => ({
            id: ci.productId,
            name: ci.name,
            image: ci.imageUrl,
            price: ci.price,
            originalPrice: ci.originalPrice || ci.price, // Fallback to price if no originalPrice
            quantity: ci.quantity,
            variant: 'Default'
          })));
        } catch {
          const savedCart = localStorage.getItem('neenu_cart');
          if (savedCart) {
            try { setCartItems(JSON.parse(savedCart)); } catch {}
          }
        }
      } else {
        const savedCart = localStorage.getItem('neenu_cart');
        if (savedCart) {
          try { setCartItems(JSON.parse(savedCart)); } catch {}
        }
      }
    };
    init();
  }, [user?.email]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('neenu_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('neenu_saved_items', JSON.stringify(savedItems));
  }, [savedItems]);

  useEffect(() => {
    localStorage.setItem('neenu_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const addToCart = async (product, quantity = 1) => {
    // Ensure price is a valid number
    const sanitizedProduct = {
      ...product,
      price: parseFloat(product.price) || 0,
      originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price) || 0,
      quantity: parseInt(quantity) || 1
    };

    if (user?.email) {
      try {
        const apiResponse = await cartApi.add(user.email, { productId: sanitizedProduct.productId || sanitizedProduct.id, quantity: sanitizedProduct.quantity });
        
        // Update cart with API response data
        setCartItems(prev => {
          const existingItem = prev.find(item => item.id === (sanitizedProduct.productId || sanitizedProduct.id));
          if (existingItem) {
            showNotification(`Updated ${sanitizedProduct.name} quantity in cart!`);
            return prev.map(item =>
              item.id === (sanitizedProduct.productId || sanitizedProduct.id)
                ? { 
                    ...item, 
                    quantity: apiResponse.quantity,
                    price: apiResponse.price,
                    originalPrice: apiResponse.originalPrice || apiResponse.price,
                    image: apiResponse.imageUrl || item.image
                  }
                : item
            );
          } else {
            showNotification(`${sanitizedProduct.name} added to cart!`);
            return [...prev, {
              id: apiResponse.productId,
              name: apiResponse.name,
              image: apiResponse.imageUrl,
              price: apiResponse.price,
              originalPrice: apiResponse.originalPrice || apiResponse.price,
              quantity: apiResponse.quantity,
              variant: sanitizedProduct.variant || 'Default',
              category: sanitizedProduct.category,
              brand: sanitizedProduct.brand
            }];
          }
        });
      } catch (error) {
        // Fallback to local cart if API fails
        setCartItems(prev => {
          const existingItem = prev.find(item => item.id === sanitizedProduct.id);
          if (existingItem) {
            showNotification(`Updated ${sanitizedProduct.name} quantity in cart!`);
            return prev.map(item =>
              item.id === sanitizedProduct.id
                ? { ...item, quantity: (parseInt(item.quantity) || 0) + (parseInt(quantity) || 1) }
                : item
            );
          } else {
            showNotification(`${sanitizedProduct.name} added to cart!`);
            return [...prev, sanitizedProduct];
          }
        });
      }
    } else {
      // Guest user - use local cart
      setCartItems(prev => {
        const existingItem = prev.find(item => item.id === sanitizedProduct.id);
        if (existingItem) {
          showNotification(`Updated ${sanitizedProduct.name} quantity in cart!`);
          return prev.map(item =>
            item.id === sanitizedProduct.id
              ? { ...item, quantity: (parseInt(item.quantity) || 0) + (parseInt(quantity) || 1) }
              : item
          );
        } else {
          showNotification(`${sanitizedProduct.name} added to cart!`);
          return [...prev, sanitizedProduct];
        }
      });
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    if (user?.email) {
      try { await cartApi.update(user.email, { productId: itemId, quantity: newQuantity }); } catch {}
    }
  };

  const removeFromCart = async (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    if (user?.email) {
      try { await cartApi.remove(user.email, { productId: itemId }); } catch {}
    }
  };

  const saveForLater = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      setSavedItems(prev => [...prev, { ...item, quantity: 1 }]);
      removeFromCart(itemId);
    }
  };

  const moveToCart = (item) => {
    addToCart(item, 1);
    setSavedItems(prev => prev.filter(saved => saved.id !== item.id));
  };

  const removeFromSaved = (itemId) => {
    setSavedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + (parseInt(item.quantity) || 0), 0);
  };

  const addToWishlist = (product) => {
    setWishlistItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        showNotification(`${product.name} is already in wishlist!`, 'error');
        return prev;
      } else {
        showNotification(`${product.name} added to wishlist!`);
        return [...prev, product];
      }
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prev => {
      const product = prev.find(item => item.id === productId);
      if (product) {
        showNotification(`${product.name} removed from wishlist!`);
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const value = {
    cartItems,
    savedItems,
    wishlistItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    saveForLater,
    moveToCart,
    removeFromSaved,
    clearCart,
    getCartTotal,
    getCartItemCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
