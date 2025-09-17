import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import userApi from '../../../services/userApi';

const ProfileManagement = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email,
    phone: user?.phone,
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/?.test(formData?.phone?.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData?.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!passwordData?.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData?.newPassword?.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordData?.newPassword !== passwordData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSaveProfile = () => {
    if (validateForm()) {
      onUpdateProfile(formData);
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;
    try {
      await userApi.updatePassword(user?.email, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password updated successfully');
    } catch (e) {
      alert(e?.response?.data?.message || 'Failed to update password');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name,
      email: user?.email,
      phone: user?.phone,
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || ''
    });
    setIsEditing(false);
    setIsChangingPassword(false);
    setErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Profile Management
        </h1>
        {!isEditing && !isChangingPassword && (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            iconName="Edit"
            iconPosition="left"
          >
            Edit Profile
          </Button>
        )}
      </div>
      {/* Profile Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="User" size={32} className="text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {user?.name}
            </h2>
            <p className="font-body text-muted-foreground">
              Member since {user?.memberSince}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            type="text"
            value={formData?.name}
            onChange={(e) => handleInputChange('name', e?.target?.value)}
            disabled={!isEditing}
            error={errors?.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            disabled={!isEditing}
            error={errors?.email}
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData?.phone}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            disabled={!isEditing}
            error={errors?.phone}
            required
          />

          <Input
            label="Date of Birth"
            type="date"
            value={formData?.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e?.target?.value)}
            disabled={!isEditing}
          />

          <div className="md:col-span-2">
            <label className="block font-body font-medium text-foreground mb-2">
              Gender
            </label>
            <div className="flex space-x-4">
              {['Male', 'Female', 'Other']?.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="gender"
                    value={option}
                    checked={formData?.gender === option}
                    onChange={(e) => handleInputChange('gender', e?.target?.value)}
                    disabled={!isEditing}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <span className="font-body text-sm text-foreground">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex space-x-3 mt-6 pt-6 border-t border-border">
            <Button
              variant="default"
              onClick={handleSaveProfile}
            >
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
      {/* Password Change Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Password & Security
          </h3>
          {!isChangingPassword && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </Button>
          )}
        </div>

        {isChangingPassword ? (
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={passwordData?.currentPassword}
              onChange={(e) => handlePasswordChange('currentPassword', e?.target?.value)}
              error={errors?.currentPassword}
              required
            />

            <Input
              label="New Password"
              type="password"
              value={passwordData?.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e?.target?.value)}
              error={errors?.newPassword}
              description="Password must be at least 8 characters long"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData?.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e?.target?.value)}
              error={errors?.confirmPassword}
              required
            />

            <div className="flex space-x-3 pt-4">
              <Button
                variant="default"
                onClick={handleChangePassword}
              >
                Update Password
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground">
            <p className="font-body text-sm">
              Last password change: {user?.lastPasswordChange || 'Never'}
            </p>
          </div>
        )}
      </div>
      {/* Account Statistics */}
      {/* <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
          Account Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="font-data text-2xl font-bold text-primary">
              {user?.totalOrders}
            </div>
            <div className="font-caption text-sm text-muted-foreground">
              Total Orders
            </div>
          </div>
          <div className="text-center">
            <div className="font-data text-2xl font-bold text-success">
              ₹{user?.totalSpent}
            </div>
            <div className="font-caption text-sm text-muted-foreground">
              Total Spent
            </div>
          </div>
          <div className="text-center">
            <div className="font-data text-2xl font-bold text-warning">
              {user?.loyaltyPoints}
            </div>
            <div className="font-caption text-sm text-muted-foreground">
              Loyalty Points
            </div>
          </div>
          <div className="text-center">
            <div className="font-data text-2xl font-bold text-destructive">
              ₹{user?.totalSaved}
            </div>
            <div className="font-caption text-sm text-muted-foreground">
              Total Saved
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ProfileManagement;