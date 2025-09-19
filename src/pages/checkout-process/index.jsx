import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { sendOrderDetailsToWhatsApp } from '../../utils/whatsapp';
import dataService from '../../services/dataService';
import checkoutApi from '../../services/checkoutApi';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import CheckoutProgress from './components/CheckoutProgress';
import ShippingForm from './components/ShippingForm';
import DeliveryOptions from './components/DeliveryOptions';
import PaymentForm from './components/PaymentForm';
import OrderReview from './components/OrderReview';
import OrderSummary from './components/OrderSummary';
import TrustSignals from './components/TrustSignals';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

/**
 * Multi-Step Checkout Process Component
 * 
 * This component implements a complete checkout flow with the following steps:
 * 1. Address Selection - User selects or adds delivery address
 * 2. Delivery & Payment - User chooses delivery option and payment method
 * 3. Order Review - User reviews all details before placing order
 * 4. Place Order - Final order placement with backend integration
 * 
 * Each step validates data and saves selections to backend before proceeding
 */

const CheckoutProcess = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, addToCart } = useCart();
  const { user, loading } = useAuth();

  // State management for checkout flow
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const [orderReviewData, setOrderReviewData] = useState(null);

  // Form data states for each step
  const [shippingData, setShippingData] = useState(null);
  const [deliveryData, setDeliveryData] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/user-login', { 
        state: { 
          from: '/checkout-process',
          message: 'Please sign in to continue with checkout'
        }
      });
    }
  }, [user, loading, navigate]);

  // Validate cart is not empty - show message instead of redirecting for testing
  const [showEmptyCartMessage, setShowEmptyCartMessage] = useState(false);
  
  useEffect(() => {
    if (!loading && user && (!cartItems || cartItems.length === 0)) {
      setShowEmptyCartMessage(true);
    } else {
      setShowEmptyCartMessage(false);
    }
  }, [cartItems, user, loading]);

  // Add test items to cart for testing purposes
  const addTestItems = async () => {
    try {
      // First, try to get existing products from the backend
      const response = await fetch('http://localhost:8080/api/admin/products');
      let availableProducts = [];
      
      if (response.ok) {
        availableProducts = await response.json();
      }
      
      // If no products exist in backend, create some test products first
      if (availableProducts.length === 0) {
        console.log('No products found in backend, creating test products...');
        
        // Create test products
        const testProducts = [
          {
            name: "Traditional Mysore Pak",
            description: "Authentic South Indian sweet made with gram flour, ghee, and sugar",
            price: 399.0,
            originalPrice: 450.0,
            category: "Sweets",
            brand: "Neenu's Natural",
            stock: 100,
            isActive: true
          },
          {
            name: "Homemade Mango Pickle",
            description: "Traditional mango pickle made with fresh mangoes and authentic spices",
            price: 280.0,
            originalPrice: 320.0,
            category: "Pickles",
            brand: "Neenu's Natural",
            stock: 50,
            isActive: true
          }
        ];
        
        // Add products to backend
        for (const product of testProducts) {
          try {
            const createResponse = await fetch('http://localhost:8080/api/admin/products', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(product)
            });
            
            if (createResponse.ok) {
              const createdProduct = await createResponse.json();
              availableProducts.push(createdProduct);
              console.log('Created product:', createdProduct);
            }
          } catch (error) {
            console.error('Error creating product:', error);
          }
        }
      }
      
      // Now add items to cart using available products
      if (availableProducts.length > 0) {
        const itemsToAdd = availableProducts.slice(0, 2).map((product, index) => ({
          id: `${product.id}-default`,
          productId: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.originalPrice || product.price,
          image: product.imageUrl || "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=400&fit=crop",
          variant: "Default",
          category: product.category,
          brand: product.brand
        }));
        
        for (const item of itemsToAdd) {
          try {
            await addToCart(item, 1);
            console.log('Added to cart:', item);
          } catch (error) {
            console.error('Error adding item to cart:', error);
          }
        }
      } else {
        console.error('No products available to add to cart');
      }
    } catch (error) {
      console.error('Error in addTestItems:', error);
    }
  };

  // Calculate totals
  const subtotal = cartItems?.reduce((sum, item) => {
    const itemPrice = parseFloat(item?.price) || 0;
    const itemQuantity = parseInt(item?.quantity) || 0;
    return sum + (itemPrice * itemQuantity);
  }, 0);
  const shippingCost = deliveryData?.price || (subtotal >= 499 ? 0 : 49);
  const discountAmount = appliedCoupon === 'FLAT10' && subtotal >= 1499 ? subtotal * 0.1 : 0;
  const total = subtotal + shippingCost - discountAmount;

  // Auto-apply FLAT10 coupon if eligible
  useEffect(() => {
    if (subtotal >= 1499 && !appliedCoupon) {
      setAppliedCoupon('FLAT10');
    }
  }, [subtotal, appliedCoupon]);

  useEffect(() => {
    if (!user) {
      navigate('/user-auth');
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, [user, navigate]);


  const breadcrumbItems = [
    { label: 'Home', path: '/homepage' },
    { label: 'Shopping Cart', path: '/shopping-cart' },
    { label: 'Checkout', path: '/checkout-process' }
  ];

  /**
   * Handle step progression with backend integration
   * Each step saves data to backend before proceeding to next step
   */
  const handleStepNext = async (stepData) => {
    setIsProcessing(true);
    setError(null);

    try {
      switch (currentStep) {
        case 1: // Address Selection
          setShippingData(stepData);
          if (user?.email && stepData?.id) {
            await checkoutApi.saveSelection(user.email, { addressId: stepData.id });
            console.log('Address selection saved:', stepData.id);
          }
          setCurrentStep(2);
          break;

        case 2: // Delivery & Payment Options
          setDeliveryData(stepData);
          if (user?.email) {
            const selectionData = {
              deliveryOption: stepData?.id || stepData?.deliveryOption,
              paymentMethod: stepData?.method || stepData?.paymentMethod
            };
            await checkoutApi.saveSelection(user.email, selectionData);
            console.log('Delivery and payment selection saved:', selectionData);
          }
          setCurrentStep(3);
          break;

        case 3: // Order Review
          setPaymentData(stepData);
          // Load order review data from backend
          if (user?.email) {
            const reviewData = await checkoutApi.review(user.email);
            setOrderReviewData(reviewData);
            console.log('Order review data loaded:', reviewData);
          }
          setCurrentStep(4);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error in step progression:', error);
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStepBack = (targetStep = null) => {
    const newStep = targetStep || currentStep - 1;
    if (newStep >= 1 && newStep <= 4) {
      setCurrentStep(newStep);
    }
  };

  /**
   * Handle final order placement
   * This method calls the backend API to place the order and handles success/error states
   */
  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Placing order for user:', user?.email);
      
      if (!user?.email) {
        throw new Error('User not authenticated');
      }

      if (!cartItems || cartItems.length === 0) {
        throw new Error('Your cart is empty. Please add items before placing an order.');
      }

      // Place order through backend API
      const savedOrder = await checkoutApi.placeOrder(user.email);
      console.log('Order placed successfully:', savedOrder);

      // Get order review data for WhatsApp message
      let reviewData = orderReviewData;
      if (!reviewData) {
        try {
          reviewData = await checkoutApi.review(user.email);
        } catch (reviewError) {
          console.warn('Could not fetch review data for WhatsApp:', reviewError);
        }
      }

      // Send WhatsApp notification
      await sendOrderToWhatsApp(savedOrder, reviewData, user, currentLocation);

      // Clear cart after successful order
      clearCart();

      // Show success message and redirect
      alert(`Order placed successfully! Order ID: ${savedOrder.id}. Order details have been sent to WhatsApp.`);
      navigate('/user-account-dashboard?section=orders');

    } catch (error) {
      console.error('Order placement failed:', error);
      setError(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Send order details to WhatsApp
   */
  const sendOrderToWhatsApp = async (order, reviewData, user, location) => {
    try {
      await sendOrderDetailsToWhatsApp(order, reviewData, user, location, '917892783668');
    } catch (error) {
      console.error('Failed to send WhatsApp notification:', error);
      // swallow errors to avoid blocking order success
    }
  };

  const handleApplyCoupon = (couponCode) => {
    setAppliedCoupon(couponCode);
  };

  /**
   * Render the current step component based on currentStep state
   * Each step component receives appropriate props and handlers
   */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: // Address Selection Step
        return (
          <ShippingForm
            onNext={handleStepNext}
            onAddressSelect={(address) => setShippingData(address)}
            user={user}
            isLoading={isProcessing}
          />
        );
      case 2: // Delivery & Payment Options Step
        return (
          <DeliveryOptions
            onNext={handleStepNext}
            onBack={handleStepBack}
            shippingAddress={shippingData}
            user={user}
            isLoading={isProcessing}
          />
        );
      case 3: // Payment Method Step
        return (
          <PaymentForm
            onNext={handleStepNext}
            onBack={handleStepBack}
            orderTotal={total}
            paymentMethod={paymentData?.method}
            setPaymentMethod={setPaymentData}
            user={user}
            isLoading={isProcessing}
          />
        );
      case 4: // Order Review & Place Order Step
        return (
          <OrderReview
            onBack={handleStepBack}
            onPlaceOrder={handlePlaceOrder}
            shippingAddress={shippingData}
            deliveryOption={deliveryData}
            paymentMethod={paymentData?.method}
            orderTotal={total}
            orderReviewData={orderReviewData}
            isProcessing={isProcessing}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state if user is not loaded yet
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (showEmptyCartMessage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Breadcrumb customItems={breadcrumbItems} />
          <div className="max-w-2xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <Icon name="ShoppingCart" size={48} className="text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-yellow-800 mb-2">Your Cart is Empty</h2>
              <p className="text-yellow-600 mb-4">Please add items to your cart before proceeding to checkout.</p>
              <div className="space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/shopping-cart')}
                  iconName="ShoppingCart"
                  iconPosition="left"
                >
                  Go to Cart
                </Button>
                <Button
                  variant="default"
                  onClick={addTestItems}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Add Test Items (for testing)
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state if there's an error
  if (error && currentStep === 4) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Breadcrumb customItems={breadcrumbItems} />
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-800 mb-2">Order Placement Failed</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                  iconName="ArrowLeft"
                  iconPosition="left"
                >
                  Back to Review
                </Button>
                <Button
                  variant="default"
                  onClick={() => window.location.reload()}
                  iconName="RefreshCw"
                  iconPosition="left"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb customItems={breadcrumbItems} />

        {/* Error Display */}
        {error && currentStep !== 4 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <Icon name="AlertCircle" size={20} className="text-red-500 mr-2" />
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Mobile Order Summary Toggle */}
        <div className="lg:hidden mb-6">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setOrderSummaryExpanded(!orderSummaryExpanded)}
            iconName={orderSummaryExpanded ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            disabled={isProcessing}
          >
            {orderSummaryExpanded ? 'Hide' : 'Show'} order summary (₹{total?.toFixed(2)})
          </Button>

          {orderSummaryExpanded && (
            <div className="mt-4">
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                shipping={shippingCost}
                discount={discountAmount}
                total={total}
                onApplyCoupon={handleApplyCoupon}
                appliedCoupon={appliedCoupon}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <CheckoutProgress currentStep={currentStep} />
            {renderCurrentStep()}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block space-y-6">
            <OrderSummary
              cartItems={cartItems}
              subtotal={subtotal}
              shipping={shippingCost}
              discount={discountAmount}
              total={total}
              onApplyCoupon={handleApplyCoupon}
              appliedCoupon={appliedCoupon}
            />

            <TrustSignals />
          </div>
        </div>

        {/* Mobile Trust Signals */}
        <div className="lg:hidden mt-8">
          <TrustSignals />
        </div>

        {/* User Account Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-muted/50 px-4 py-2 rounded-lg">
            <Icon name="User" size={16} className="text-muted-foreground" />
            <span className="font-body text-sm text-muted-foreground">
              Checking out as {user?.name || 'user'} •{' '}
              <button
                onClick={() => navigate('/user-account-dashboard')}
                className="text-primary hover:underline font-medium"
              >
                View account
              </button>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutProcess;