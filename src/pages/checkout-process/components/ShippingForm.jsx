import React, { useEffect, useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useAuth } from '../../../contexts/AuthContext';
import userApi from '../../../services/userApi';

/**
 * ShippingForm Component - Step 1 of Checkout Process
 * 
 * This component handles address selection for delivery:
 * 1. Shows saved addresses if available
 * 2. Allows adding new address
 * 3. Validates address information
 * 4. Saves selection to backend before proceeding
 * 
 * Props:
 * - onNext: Function to proceed to next step
 * - onAddressSelect: Function to handle address selection
 * - user: Current user object
 * - isLoading: Loading state for form submission
 */
const ShippingForm = ({ onNext, onAddressSelect, user, isLoading = false }) => {
  const { user: authUser } = useAuth();
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [saved, setSaved] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [errors, setErrors] = useState({});
  const [saveAddress, setSaveAddress] = useState(false);

  const stateOptions = [
    { value: 'karnataka', label: 'Karnataka' },
    { value: 'maharashtra', label: 'Maharashtra' },
    { value: 'tamil-nadu', label: 'Tamil Nadu' },
    { value: 'delhi', label: 'Delhi' },
    { value: 'gujarat', label: 'Gujarat' },
    { value: 'rajasthan', label: 'Rajasthan' },
    { value: 'west-bengal', label: 'West Bengal' },
    { value: 'uttar-pradesh', label: 'Uttar Pradesh' }
  ];

  // Load saved addresses from backend
  useEffect(() => {
    const load = async () => {
      try {
        if (!authUser?.email) return;
        const list = await userApi.getAddresses(authUser.email);
        const addressList = Array.isArray(list) ? list : [];
        setSaved(addressList);
        
        // If no saved addresses, automatically show new address form
        if (addressList.length === 0) {
          setShowNewAddressForm(true);
        }
      } catch (e) {
        setSaved([]);
        // If error loading addresses, show new address form
        setShowNewAddressForm(true);
      }
    };
    load();
  }, [authUser?.email]);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Check if form is valid without setting errors (for button state)
   */
  const isFormValid = () => {
    return formData?.firstName?.trim() &&
           formData?.lastName?.trim() &&
           formData?.email?.trim() &&
           /\S+@\S+\.\S+/?.test(formData?.email) &&
           formData?.phone?.trim() &&
           /^[+]?[91]?[6-9]\d{9}$/?.test(formData?.phone?.replace(/\s/g, '')) &&
           formData?.address?.trim() &&
           formData?.city?.trim() &&
           formData?.state &&
           formData?.pincode?.trim() &&
           /^\d{6}$/?.test(formData?.pincode);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData?.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/?.test(formData?.email)) newErrors.email = 'Invalid email format';
    if (!formData?.phone?.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[+]?[91]?[6-9]\d{9}$/?.test(formData?.phone?.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid Indian phone number';
    }
    if (!formData?.address?.trim()) newErrors.address = 'Address is required';
    if (!formData?.city?.trim()) newErrors.city = 'City is required';
    if (!formData?.state) newErrors.state = 'State is required';
    if (!formData?.pincode?.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/?.test(formData?.pincode)) newErrors.pincode = 'Invalid pincode format';

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  /**
   * Handle form submission
   * Validates form data and proceeds to next step
   */
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    try {
      if (selectedAddress) {
        // Use selected saved address
        const address = saved?.find(a => String(a?.id) === String(selectedAddress));
        if (!address) {
          throw new Error('Selected address not found');
        }
        
        if (onAddressSelect) onAddressSelect(address);
        onNext(address);
        return;
      }
      
      if (showNewAddressForm && validateForm()) {
        // Create new address
        let created = null;
        
        // Save to backend if requested
        if (saveAddress && authUser?.email) {
          try {
            const payload = {
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              phone: formData.phone,
              street: formData.address + (formData.apartment ? `, ${formData.apartment}` : ''),
              city: formData.city,
              state: typeof formData.state === 'string' ? formData.state : formData.state?.value,
              pincode: formData.pincode,
              landmark: '',
              addressType: 'Home',
              default: saved?.length === 0
            };
            created = await userApi.addAddress(authUser.email, payload);
            setSaved(prev => [...prev, created]);
            console.log('New address saved to backend:', created);
          } catch (error) {
            console.error('Failed to save address to backend:', error);
            // Continue with local address creation
          }
        }
        
        // Create address object for checkout
        const addressToUse = created || {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phone,
          street: formData.address + (formData.apartment ? `, ${formData.apartment}` : ''),
          city: formData.city,
          state: typeof formData.state === 'string' ? formData.state : formData.state?.value,
          pincode: formData.pincode,
          landmark: '',
          addressType: 'Home'
        };
        
        if (onAddressSelect) onAddressSelect(addressToUse);
        onNext(addressToUse);
      }
    } catch (error) {
      console.error('Error in address submission:', error);
      setErrors({ submit: error.message || 'Failed to process address selection' });
    }
  };

  const handleAddressSelection = (addressId) => {
    setSelectedAddress(addressId);
    setShowNewAddressForm(false);
    if (onAddressSelect) {
      const address = saved?.find(addr => String(addr?.id) === String(addressId));
      onAddressSelect(address);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="font-heading font-semibold text-xl text-foreground mb-6">
        Shipping Information
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Saved Addresses */}
        {saved?.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-body font-medium text-foreground">
              Choose from saved addresses
            </h3>
            <div className="space-y-3">
              {saved?.map((address) => (
                <label
                  key={address?.id}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                    selectedAddress === address?.id?.toString()
                      ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    value={address?.id}
                    checked={selectedAddress === address?.id?.toString()}
                    onChange={(e) => handleAddressSelection(e?.target?.value)}
                    className="sr-only"
                  />
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-body font-medium text-foreground">
                          {address?.addressType}
                        </span>
                        {address?.isDefault && (
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-caption">Default</span>
                        )}
                      </div>
                      <p className="font-body text-sm text-muted-foreground">
                        {address?.street}
                      </p>
                      <p className="font-body text-sm text-muted-foreground">
                        {address?.city}, {address?.state} - {address?.pincode}
                      </p>
                      <p className="font-data text-sm text-muted-foreground">
                        {address?.phone}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAddress === address?.id?.toString()
                        ? 'border-primary bg-primary' :'border-border'
                    }`}>
                      {selectedAddress === address?.id?.toString() && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNewAddressForm(true);
                setSelectedAddress('');
              }}
              iconName="Plus"
              iconPosition="left"
              className="w-full"
            >
              Add New Address
            </Button>
          </div>
        )}

        {/* New Address Form */}
        {(showNewAddressForm || saved?.length === 0) && (
          <div className="space-y-4">
            {saved?.length > 0 && (
              <div className="flex items-center justify-between">
                <h3 className="font-body font-medium text-foreground">
                  Add New Address
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewAddressForm(false)}
                  iconName="X"
                  iconPosition="left"
                >
                  Cancel
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                value={formData?.firstName}
                onChange={handleInputChange}
                error={errors?.firstName}
                required
                placeholder="Enter first name"
              />
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                value={formData?.lastName}
                onChange={handleInputChange}
                error={errors?.lastName}
                required
                placeholder="Enter last name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData?.email}
                onChange={handleInputChange}
                error={errors?.email}
                required
                placeholder="your.email@example.com"
              />
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData?.phone}
                onChange={handleInputChange}
                error={errors?.phone}
                required
                placeholder="+91 98765 43210"
              />
            </div>

            <Input
              label="Address"
              type="text"
              name="address"
              value={formData?.address}
              onChange={handleInputChange}
              error={errors?.address}
              required
              placeholder="House number, street name"
            />

            <Input
              label="Apartment, suite, etc. (optional)"
              type="text"
              name="apartment"
              value={formData?.apartment}
              onChange={handleInputChange}
              placeholder="Apartment, suite, unit, building, floor, etc."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="City"
                type="text"
                name="city"
                value={formData?.city}
                onChange={handleInputChange}
                error={errors?.city}
                required
                placeholder="Enter city"
              />
              <Select
                label="State"
                options={stateOptions}
                value={formData?.state}
                onChange={(value) => setFormData(prev => ({ ...prev, state: value }))}
                error={errors?.state}
                required
                placeholder="Select state"
              />
              <Input
                label="Pincode"
                type="text"
                name="pincode"
                value={formData?.pincode}
                onChange={handleInputChange}
                error={errors?.pincode}
                required
                placeholder="560001"
                maxLength={6}
              />
            </div>

            <Checkbox
              label="Save this address for future orders"
              checked={saveAddress}
              onChange={(e) => setSaveAddress(e?.target?.checked)}
            />
          </div>
        )}

        {/* Error Display */}
        {errors?.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            variant="default"
            iconName="ArrowRight"
            iconPosition="right"
            disabled={isLoading || (!selectedAddress && !showNewAddressForm) || (showNewAddressForm && !isFormValid())}
            loading={isLoading}
          >
            {isLoading ? 'Processing...' : 'Continue to Delivery'}
          </Button>
        </div>
        
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-2 bg-gray-100 text-xs text-gray-600 rounded">
            <p>Debug: selectedAddress={selectedAddress ? 'Yes' : 'No'}, showNewAddressForm={showNewAddressForm ? 'Yes' : 'No'}, isFormValid={isFormValid() ? 'Yes' : 'No'}</p>
            <p>Button disabled: {isLoading || (!selectedAddress && !showNewAddressForm) || (showNewAddressForm && !isFormValid()) ? 'Yes' : 'No'}</p>
          </div>
        )}
      </form>
    </div>
  );
};

export default ShippingForm;