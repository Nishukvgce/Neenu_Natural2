import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const PreferencesSection = ({ preferences, onUpdatePreferences }) => {
  const [formData, setFormData] = useState({
    emailNotifications: {
      orderUpdates: preferences?.emailNotifications?.orderUpdates ?? true,
      promotions: preferences?.emailNotifications?.promotions ?? true,
      newsletter: preferences?.emailNotifications?.newsletter ?? false,
      productRecommendations: preferences?.emailNotifications?.productRecommendations ?? false,
      priceDropAlerts: preferences?.emailNotifications?.priceDropAlerts ?? false
    },
    smsNotifications: {
      orderUpdates: preferences?.smsNotifications?.orderUpdates ?? true,
      deliveryUpdates: preferences?.smsNotifications?.deliveryUpdates ?? true,
      promotions: preferences?.smsNotifications?.promotions ?? false
    },
    privacy: {
      profileVisibility: preferences?.privacy?.profileVisibility ?? 'private',
      dataSharing: preferences?.privacy?.dataSharing ?? false,
      marketingCommunication: preferences?.privacy?.marketingCommunication ?? false
    },
    shopping: {
      currency: preferences?.shopping?.currency ?? 'INR',
      language: preferences?.shopping?.language ?? 'English',
      defaultPaymentMethod: preferences?.shopping?.defaultPaymentMethod ?? 'COD',
      savePaymentMethods: preferences?.shopping?.savePaymentMethods ?? false
    }
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleEmailNotificationChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      emailNotifications: {
        ...prev?.emailNotifications,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSmsNotificationChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      smsNotifications: {
        ...prev?.smsNotifications,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handlePrivacyChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev?.privacy,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleShoppingChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      shopping: {
        ...prev?.shopping,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSavePreferences = () => {
    onUpdatePreferences(formData);
    setHasChanges(false);
  };

  const handleResetPreferences = () => {
    setFormData({
      emailNotifications: {
        orderUpdates: preferences?.emailNotifications?.orderUpdates ?? true,
        promotions: preferences?.emailNotifications?.promotions ?? true,
        newsletter: preferences?.emailNotifications?.newsletter ?? false,
        productRecommendations: preferences?.emailNotifications?.productRecommendations ?? false,
        priceDropAlerts: preferences?.emailNotifications?.priceDropAlerts ?? false
      },
      smsNotifications: {
        orderUpdates: preferences?.smsNotifications?.orderUpdates ?? true,
        deliveryUpdates: preferences?.smsNotifications?.deliveryUpdates ?? true,
        promotions: preferences?.smsNotifications?.promotions ?? false
      },
      privacy: {
        profileVisibility: preferences?.privacy?.profileVisibility ?? 'private',
        dataSharing: preferences?.privacy?.dataSharing ?? false,
        marketingCommunication: preferences?.privacy?.marketingCommunication ?? false
      },
      shopping: {
        currency: preferences?.shopping?.currency ?? 'INR',
        language: preferences?.shopping?.language ?? 'English',
        defaultPaymentMethod: preferences?.shopping?.defaultPaymentMethod ?? 'COD',
        savePaymentMethods: preferences?.shopping?.savePaymentMethods ?? false
      }
    });
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* <h1 className="font-heading text-2xl font-bold text-foreground">
          Preferences & Settings
        </h1> */}
        {hasChanges && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetPreferences}
            >
              Reset
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSavePreferences}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>
      {/* Email Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Mail" size={20} className="text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Email Notifications
          </h3>
        </div>
        <div className="space-y-4">
          <Checkbox
            label="Order Updates"
            description="Receive emails about order confirmations, shipping, and delivery"
            checked={formData?.emailNotifications?.orderUpdates}
            onChange={(e) => handleEmailNotificationChange('orderUpdates', e?.target?.checked)}
          />
          <Checkbox
            label="Promotions & Offers"
            description="Get notified about special deals, discounts, and seasonal offers"
            checked={formData?.emailNotifications?.promotions}
            onChange={(e) => handleEmailNotificationChange('promotions', e?.target?.checked)}
          />
          <Checkbox
            label="Newsletter"
            description="Weekly newsletter with recipes, tips, and product highlights"
            checked={formData?.emailNotifications?.newsletter}
            onChange={(e) => handleEmailNotificationChange('newsletter', e?.target?.checked)}
          />
          <Checkbox
            label="Product Recommendations"
            description="Personalized product suggestions based on your preferences"
            checked={formData?.emailNotifications?.productRecommendations}
            onChange={(e) => handleEmailNotificationChange('productRecommendations', e?.target?.checked)}
          />
          <Checkbox
            label="Price Drop Alerts"
            description="Get notified when items in your wishlist go on sale"
            checked={formData?.emailNotifications?.priceDropAlerts}
            onChange={(e) => handleEmailNotificationChange('priceDropAlerts', e?.target?.checked)}
          />
        </div>
      </div>
      {/* SMS Notifications */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="MessageSquare" size={20} className="text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">
            SMS Notifications
          </h3>
        </div>
        <div className="space-y-4">
          <Checkbox
            label="Order Updates"
            description="SMS alerts for order confirmations and important updates"
            checked={formData?.smsNotifications?.orderUpdates}
            onChange={(e) => handleSmsNotificationChange('orderUpdates', e?.target?.checked)}
          />
          <Checkbox
            label="Delivery Updates"
            description="Real-time SMS updates about your delivery status"
            checked={formData?.smsNotifications?.deliveryUpdates}
            onChange={(e) => handleSmsNotificationChange('deliveryUpdates', e?.target?.checked)}
          />
          <Checkbox
            label="Promotional SMS"
            description="Receive SMS about flash sales and limited-time offers"
            checked={formData?.smsNotifications?.promotions}
            onChange={(e) => handleSmsNotificationChange('promotions', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Privacy Settings */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Shield" size={20} className="text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Privacy Settings
          </h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-body font-medium text-foreground mb-2">
              Profile Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="public"
                  checked={formData?.privacy?.profileVisibility === 'public'}
                  onChange={(e) => handlePrivacyChange('profileVisibility', e?.target?.value)}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="font-body text-sm text-foreground">Public</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="profileVisibility"
                  value="private"
                  checked={formData?.privacy?.profileVisibility === 'private'}
                  onChange={(e) => handlePrivacyChange('profileVisibility', e?.target?.value)}
                  className="w-4 h-4 text-primary border-border focus:ring-primary"
                />
                <span className="font-body text-sm text-foreground">Private</span>
              </label>
            </div>
          </div>
          <Checkbox
            label="Data Sharing"
            description="Allow sharing anonymized data for product improvement"
            checked={formData?.privacy?.dataSharing}
            onChange={(e) => handlePrivacyChange('dataSharing', e?.target?.checked)}
          />
          <Checkbox
            label="Marketing Communication"
            description="Allow third-party partners to send relevant offers"
            checked={formData?.privacy?.marketingCommunication}
            onChange={(e) => handlePrivacyChange('marketingCommunication', e?.target?.checked)}
          />
        </div>
      </div>
      {/* Shopping Preferences */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="ShoppingBag" size={20} className="text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Shopping Preferences
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-body font-medium text-foreground mb-2">
              Currency
            </label>
            <select
              value={formData?.shopping?.currency}
              onChange={(e) => handleShoppingChange('currency', e?.target?.value)}
              className="w-full font-body text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD">US Dollar ($)</option>
            </select>
          </div>
          <div>
            <label className="block font-body font-medium text-foreground mb-2">
              Language
            </label>
            <select
              value={formData?.shopping?.language}
              onChange={(e) => handleShoppingChange('language', e?.target?.value)}
              className="w-full font-body text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="English">English</option>
              <option value="Hindi">हिंदी</option>
              <option value="Tamil">தமிழ்</option>
              <option value="Telugu">తెలుగు</option>
            </select>
          </div>
          <div>
            <label className="block font-body font-medium text-foreground mb-2">
              Default Payment Method
            </label>
            <select
              value={formData?.shopping?.defaultPaymentMethod}
              onChange={(e) => handleShoppingChange('defaultPaymentMethod', e?.target?.value)}
              className="w-full font-body text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="COD">Cash on Delivery</option>
              <option value="UPI">UPI</option>
              <option value="Card">Credit/Debit Card</option>
              <option value="NetBanking">Net Banking</option>
            </select>
          </div>
          <div className="flex items-center">
            <Checkbox
              label="Save Payment Methods"
              description="Securely save payment methods for faster checkout"
              checked={formData?.shopping?.savePaymentMethods}
              onChange={(e) => handleShoppingChange('savePaymentMethods', e?.target?.checked)}
            />
          </div>
        </div>
      </div>
      {/* Account Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Icon name="Settings" size={20} className="text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Account Actions
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <h4 className="font-body font-medium text-foreground">
                Download Account Data
              </h4>
              <p className="font-caption text-sm text-muted-foreground">
                Get a copy of all your account information and order history
              </p>
            </div>
            <Button variant="outline" size="sm">
              Download
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <h4 className="font-body font-medium text-foreground">
                Delete Account
              </h4>
              <p className="font-caption text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
      {/* Save Changes Button - Mobile */}
      {hasChanges && (
        <div className="sticky bottom-4 bg-background border border-border rounded-lg p-4 shadow-warm-lg md:hidden">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleResetPreferences}
              fullWidth
            >
              Reset
            </Button>
            <Button
              variant="default"
              onClick={handleSavePreferences}
              fullWidth
            >
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreferencesSection;