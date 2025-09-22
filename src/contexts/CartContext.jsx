import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import cartApi from '../services/cartApi';
import wishlistApi from '../services/wishlistApi';

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

  // Load wishlist from backend for logged-in users
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user?.email) return;
      try {
        const items = await wishlistApi.getAll(user.email);
        // Normalize to UI item shape
        const normalized = (items || []).map(it => ({
          id: it.productId,
          name: it.productName,
          image: it.productImage,
          price: it.productPrice,
          originalPrice: it.productPrice,
          inStock: it.inStock !== false,
          stockQuantity: it.stockQuantity ?? null,
          category: it.category,
          brand: it.brand,
          addedDate: it.createdAt
        }));
        setWishlistItems(normalized);
      } catch (e) {
        // keep local storage fallback silently
      }
    };
    loadWishlist();
  }, [user?.email]);

  const addToCart = async (product, quantity = 1) => {
    // Ensure price is a valid number
    const sanitizedProduct = {
      ...product,
      price: parseFloat(product.price) || 0,
      originalPrice: parseFloat(product.originalPrice) || parseFloat(product.price) || 0,
      quantity: parseInt(quantity) || 1
    };

    // Optional client-side stock checks if stock info is provided on product
    const availableStock = (sanitizedProduct.stock ?? sanitizedProduct.stockQuantity ?? null);
    if (availableStock !== null) {
      if (parseInt(availableStock) <= 0) {
        showNotification('This product is out of stock', 'error');
        return;
      }
      if (sanitizedProduct.quantity > parseInt(availableStock)) {
        showNotification('Stock limit exceeded', 'error');
        sanitizedProduct.quantity = parseInt(availableStock);
      }
    }

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
        // Do not fallback to local cart; show error notification
        showNotification(error?.message || 'Failed to add to cart. Please try again.', 'error');
        return;
      }
    } else {
      // Guest user - use local cart
      setCartItems(prev => {
        const existingItem = prev.find(item => item.id === sanitizedProduct.id);
        // Enforce stock caps if available
        const currentQty = existingItem ? (parseInt(existingItem.quantity) || 0) : 0;
        const requestedQty = (parseInt(quantity) || 1);
        let newQty = currentQty + requestedQty;
        if (availableStock !== null && newQty > parseInt(availableStock)) {
          showNotification('Stock limit exceeded', 'error');
          newQty = parseInt(availableStock);
        }

        if (existingItem) {
          showNotification(`Updated ${sanitizedProduct.name} quantity in cart!`);
          return prev.map(item =>
            item.id === sanitizedProduct.id
              ? { ...item, quantity: newQty }
              : item
          );
        } else {
          showNotification(`${sanitizedProduct.name} added to cart!`);
          return [...prev, { ...sanitizedProduct, quantity: Math.max(1, Math.min(requestedQty, availableStock ?? requestedQty)) }];
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

  const addToWishlist = async (product) => {
    // Avoid dups in UI
    const already = wishlistItems.some(w => w.id === product.id);
    if (already) {
      showNotification(`${product.name} is already in wishlist!`, 'error');
      return;
    }
    if (user?.email) {
      try {
        await wishlistApi.add(user.email, { productId: product.id });
        showNotification(`${product.name} added to wishlist!`);
        setWishlistItems(prev => [...prev, { inStock: true, ...product }]);
        return;
      } catch (e) {
        showNotification(e?.message || 'Failed to add to wishlist', 'error');
        return;
      }
    }
    // Guest fallback to local storage
    showNotification(`${product.name} added to wishlist!`);
    setWishlistItems(prev => [...prev, { inStock: true, ...product }]);
  };

  const removeFromWishlist = async (productId) => {
    if (user?.email) {
      try {
        await wishlistApi.remove(user.email, { productId });
      } catch (e) {
        showNotification(e?.message || 'Failed to remove from wishlist', 'error');
      }
    }
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
