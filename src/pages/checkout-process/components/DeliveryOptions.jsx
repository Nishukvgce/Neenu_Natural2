import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import checkoutApi from '../../../services/checkoutApi';

/**
 * DeliveryOptions Component - Step 2 of Checkout Process
 * 
 * This component handles delivery option selection:
 * 1. Shows available delivery options based on location
 * 2. Displays pricing and delivery times
 * 3. Saves delivery selection to backend
 * 4. Proceeds to payment method selection
 * 
 * Props:
 * - onNext: Function to proceed to next step
 * - onBack: Function to go back to previous step
 * - shippingAddress: Selected shipping address
 * - user: Current user object
 * - isLoading: Loading state for form submission
 */
const DeliveryOptions = ({ onNext, onBack, shippingAddress, user: parentUser, isLoading = false }) => {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState('');

  const isBengaluru = shippingAddress?.city?.toLowerCase() === 'bengaluru'|| shippingAddress?.pincode?.startsWith('560');

  const deliveryOptions = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: isBengaluru ? '2-3 business days' : '4-5 business days',
      price: isBengaluru ? 0 : 49,
      icon: 'Truck',
      recommended: false
    },
    // {
    //   id: 'express',
    //   name: 'Express Delivery',
    //   description: isBengaluru ? 'Next business day' : '2-3 business days',
    //   price: isBengaluru ? 99 : 149,
    //   icon: 'Zap',
    //   recommended: true
    // },
    // {
    //   id: 'premium',
    //   name: 'Premium Delivery',
    //   description: isBengaluru ? 'Same day delivery' : 'Next business day',
    //   price: isBengaluru ? 199 : 249,
    //   icon: 'Clock',
    //   recommended: false
    // }
  ];

  /**
   * Handle form submission
   * Saves delivery option selection and proceeds to payment step
   */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!selectedOption) {
      return;
    }
    
    try {
      const selected = deliveryOptions?.find(option => option?.id === selectedOption);
      if (!selected) {
        throw new Error('Selected delivery option not found');
      }
      
      // Save delivery option to backend
      if (user?.email) {
        await checkoutApi.saveSelection(user.email, {
          deliveryOption: selected?.id
        });
        console.log('Delivery option saved:', selected?.id);
      }
      
      onNext(selected);
    } catch (error) {
      console.error('Error saving delivery option:', error);
      // Continue with local selection even if backend save fails
      const selected = deliveryOptions?.find(option => option?.id === selectedOption);
      onNext(selected);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
        Delivery Options
      </h2>
      {/* Location Info */}
      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="MapPin" size={16} className="text-primary" />
          <span className="font-body font-medium text-foreground">
            Delivering to: {shippingAddress?.city || 'Your Location'}
          </span>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          {isBengaluru ? (
            'You qualify for faster delivery options in Bengaluru!'
          ) : (
            'Delivery times may vary for locations outside Bengaluru'
          )}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {deliveryOptions?.map((option) => (
          <label
            key={option?.id}
            className={`block p-4 border rounded-lg cursor-pointer transition-colors duration-200 relative ${
              selectedOption === option?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}
          >
            <input
              type="radio"
              name="deliveryOption"
              value={option?.id}
              checked={selectedOption === option?.id}
              onChange={(e) => setSelectedOption(e?.target?.value)}
              className="sr-only"
            />
            
            {option?.recommended && (
              <div className="absolute -top-2 left-4 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-caption font-medium">
                Recommended
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedOption === option?.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  <Icon name={option?.icon} size={20} />
                </div>
                <div>
                  <h3 className="font-body font-medium text-foreground">
                    {option?.name}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {option?.description}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-data font-semibold text-foreground">
                  {option?.price === 0 ? 'Free' : `₹${option?.price}`}
                </p>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                  selectedOption === option?.id
                    ? 'border-primary bg-primary' :'border-border'
                }`}>
                  {selectedOption === option?.id && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </label>
        ))}

        {/* Delivery Information */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={16} className="text-accent mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-body font-medium text-foreground">
                Delivery Information
              </h4>
              <ul className="font-body text-sm text-muted-foreground space-y-1">
                {/* <li>• Orders placed before 2 PM are processed the same day</li>
                <li>• Weekend deliveries available for express and premium options</li> */}
                <li>• Free delivery on orders above ₹{isBengaluru ? '499' : '999'}</li>
                <li>• All products are carefully packaged to maintain freshness</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            iconName="ArrowLeft"
            iconPosition="left"
            disabled={isLoading}
          >
            Back to Shipping
          </Button>
          <Button
            type="submit"
            variant="default"
            iconName="ArrowRight"
            iconPosition="right"
            disabled={!selectedOption || isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Processing...' : 'Continue to Payment'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DeliveryOptions;