import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';
import { useAuth } from '../../../contexts/AuthContext';
import checkoutApi from '../../../services/checkoutApi';

/**
 * PaymentForm Component - Step 3 of Checkout Process
 * 
 * This component handles payment method selection:
 * 1. Shows available payment methods (COD, UPI, Card, etc.)
 * 2. Collects payment details based on selected method
 * 3. Validates payment information
 * 4. Saves payment method selection to backend
 * 5. Proceeds to order review step
 * 
 * Props:
 * - onNext: Function to proceed to next step
 * - onBack: Function to go back to previous step
 * - orderTotal: Total order amount
 * - paymentMethod: Currently selected payment method
 * - setPaymentMethod: Function to update payment method
 * - user: Current user object
 * - isLoading: Loading state for form submission
 */
const PaymentForm = ({ onNext, onBack, orderTotal, paymentMethod: initialPaymentMethod, setPaymentMethod: setParentPaymentMethod, user: parentUser, isLoading = false }) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: ''
  });
  const [upiId, setUpiId] = useState('');
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: 'Banknote',
      fee: 0,
      available: true
    },
    // {
    //   id: 'upi',
    //   name: 'UPI Payment',
    //   description: 'Pay using Google Pay, PhonePe, Paytm, etc.',
    //   icon: 'Smartphone',
    //   fee: 0,
    //   available: true
    // },
    // {
    //   id: 'card',
    //   name: 'Credit/Debit Card',
    //   description: 'Visa, Mastercard, RuPay accepted',
    //   icon: 'CreditCard',
    //   fee: 0,
    //   available: true
    // },
    // {
    //   id: 'netbanking',
    //   name: 'Net Banking',
    //   description: 'Pay directly from your bank account',
    //   icon: 'Building2',
    //   fee: 0,
    //   available: true
    // }
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1)?.padStart(2, '0'),
    label: String(i + 1)?.padStart(2, '0')
  }));

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date()?.getFullYear() + i;
    return { value: String(year), label: String(year) };
  });

  const handleCardInputChange = (e) => {
    const { name, value } = e?.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value?.replace(/\s/g, '')?.replace(/(.{4})/g, '$1 ')?.trim();
      if (formattedValue?.length > 19) return;
    } else if (name === 'cvv') {
      formattedValue = value?.replace(/\D/g, '');
      if (formattedValue?.length > 3) return;
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePaymentForm = () => {
    const newErrors = {};

    if (paymentMethod === 'card') {
      if (!cardData?.cardNumber?.replace(/\s/g, '')) {
        newErrors.cardNumber = 'Card number is required';
      } else if (cardData?.cardNumber?.replace(/\s/g, '')?.length < 16) {
        newErrors.cardNumber = 'Invalid card number';
      }
      
      if (!cardData?.expiryMonth) newErrors.expiryMonth = 'Expiry month is required';
      if (!cardData?.expiryYear) newErrors.expiryYear = 'Expiry year is required';
      if (!cardData?.cvv) newErrors.cvv = 'CVV is required';
      if (!cardData?.cardholderName?.trim()) newErrors.cardholderName = 'Cardholder name is required';
    } else if (paymentMethod === 'upi') {
      if (!upiId?.trim()) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[\w.-]+@[\w.-]+$/?.test(upiId)) {
        newErrors.upiId = 'Invalid UPI ID format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  /**
   * Handle form submission
   * Validates payment data and saves selection to backend
   */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!paymentMethod) {
      setErrors({ paymentMethod: 'Please select a payment method' });
      return;
    }

    if (!validatePaymentForm()) {
      return;
    }

    try {
      const paymentData = {
        method: paymentMethod,
        ...(paymentMethod === 'card' && { cardData }),
        ...(paymentMethod === 'upi' && { upiId }),
        savePaymentMethod
      };

      // Save payment method to backend
      if (user?.email) {
        await checkoutApi.saveSelection(user.email, {
          paymentMethod: paymentMethod
        });
        console.log('Payment method saved:', paymentMethod);
      }

      // Update parent component's payment method state
      if (setParentPaymentMethod) {
        setParentPaymentMethod(paymentData);
      }

      onNext(paymentData);
    } catch (error) {
      console.error('Error saving payment method:', error);
      setErrors({ submit: 'Failed to save payment method. Please try again.' });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
        Payment Method
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Methods */}
        <div className="space-y-3">
          {paymentMethods?.map((method) => (
            <label
              key={method?.id}
              className={`block p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                paymentMethod === method?.id
                  ? 'border-primary bg-primary/5'
                  : method?.available 
                    ? 'border-border hover:border-primary/50' :'border-border bg-muted/50 cursor-not-allowed'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method?.id}
                checked={paymentMethod === method?.id}
                onChange={(e) => setPaymentMethod(e?.target?.value)}
                disabled={!method?.available}
                className="sr-only"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    paymentMethod === method?.id 
                      ? 'bg-primary text-primary-foreground' 
                      : method?.available
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-muted/50 text-muted-foreground/50'
                  }`}>
                    <Icon name={method?.icon} size={20} />
                  </div>
                  <div>
                    <h3 className={`font-body font-medium ${
                      method?.available ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {method?.name}
                    </h3>
                    <p className="font-body text-sm text-muted-foreground">
                      {method?.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {method?.fee > 0 && (
                    <span className="font-data text-sm text-muted-foreground">
                      +₹{method?.fee}
                    </span>
                  )}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === method?.id
                      ? 'border-primary bg-primary' :'border-border'
                  }`}>
                    {paymentMethod === method?.id && (
                      <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Error Display */}
        {(errors?.paymentMethod || errors?.submit) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors?.paymentMethod || errors?.submit}</p>
          </div>
        )}

        {/* Card Payment Form */}
        {paymentMethod === 'card' && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-body font-medium text-foreground">
              Card Details
            </h3>
            
            <Input
              label="Cardholder Name"
              type="text"
              name="cardholderName"
              value={cardData?.cardholderName}
              onChange={handleCardInputChange}
              error={errors?.cardholderName}
              required
              placeholder="Name as on card"
            />

            <Input
              label="Card Number"
              type="text"
              name="cardNumber"
              value={cardData?.cardNumber}
              onChange={handleCardInputChange}
              error={errors?.cardNumber}
              required
              placeholder="1234 5678 9012 3456"
            />

            <div className="grid grid-cols-3 gap-4">
              <Select
                label="Month"
                options={monthOptions}
                value={cardData?.expiryMonth}
                onChange={(value) => setCardData(prev => ({ ...prev, expiryMonth: value }))}
                error={errors?.expiryMonth}
                required
                placeholder="MM"
              />
              <Select
                label="Year"
                options={yearOptions}
                value={cardData?.expiryYear}
                onChange={(value) => setCardData(prev => ({ ...prev, expiryYear: value }))}
                error={errors?.expiryYear}
                required
                placeholder="YYYY"
              />
              <Input
                label="CVV"
                type="text"
                name="cvv"
                value={cardData?.cvv}
                onChange={handleCardInputChange}
                error={errors?.cvv}
                required
                placeholder="123"
              />
            </div>
          </div>
        )}

        {/* UPI Payment Form */}
        {paymentMethod === 'upi' && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="font-body font-medium text-foreground">
              UPI Details
            </h3>
            
            <Input
              label="UPI ID"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e?.target?.value)}
              error={errors?.upiId}
              required
              placeholder="yourname@paytm"
              description="Enter your UPI ID (e.g., 9876543210@paytm)"
            />
          </div>
        )}

        {/* COD Information */}
        {paymentMethod === 'cod' && (
          <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="Info" size={16} className="text-warning mt-0.5" />
              <div>
                <h4 className="font-body font-medium text-foreground mb-2">
                  Cash on Delivery
                </h4>
                <ul className="font-body text-sm text-muted-foreground space-y-1">
                  <li>• Pay ₹{orderTotal?.toFixed(2)} when your order is delivered</li>
                  {/* <li>• Please keep exact change ready</li>
                  <li>• COD available for orders up to ₹5,000</li>
                  <li>• Additional verification may be required</li> */}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Save Payment Method */}
        {(paymentMethod === 'card' || paymentMethod === 'upi') && (
          <Checkbox
            label="Save this payment method for future orders"
            checked={savePaymentMethod}
            onChange={(e) => setSavePaymentMethod(e?.target?.checked)}
          />
        )}

        {/* Security Information */}
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Shield" size={16} className="text-success mt-0.5" />
            <div>
              <h4 className="font-body font-medium text-foreground mb-2">
                Secure Payment
              </h4>
              <p className="font-body text-sm text-muted-foreground">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
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
            Back to Delivery
          </Button>
          <Button
            type="submit"
            variant="default"
            iconName="ArrowRight"
            iconPosition="right"
            disabled={!paymentMethod || isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Processing...' : 'Review Order'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;