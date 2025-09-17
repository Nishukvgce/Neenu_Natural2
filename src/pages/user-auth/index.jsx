
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import dataService from '../../services/dataService';

const UserAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth ? useAuth() : { signIn: async () => ({ user: null, error: { message: 'No Auth' } }) };
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!isLogin && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const { user, error } = await signIn(formData.email, formData.password);
        if (user && user.role === 'user') {
          navigate('/user-account-dashboard');
        } else if (error) {
          setError(error.message || 'Invalid credentials');
        } else {
          setError('You are not authorized as a user.');
        }
      } else {
        // Registration logic (call /api/auth/register)
        const res = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone
          }),
        });
        if (res.ok) {
          setIsLogin(true);
          setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
          });
          setErrors({});
          navigate('/user-login', { state: { message: 'Account created successfully! Please sign in.' } });
        } else {
          const errorData = await res.json().catch(() => ({}));
          setError(errorData.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-warm-lg">
            <div className="text-center mb-8">
              <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-muted-foreground">
                {isLogin ? 'Sign in to your account' : 'Join Neenu\'s Natural family'}
              </p>
              {location.state?.message && (
                <p className="text-primary text-sm font-medium mt-2">
                  {location.state.message}
                </p>
              )}
            </div>
            {(error || errors.general) && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6">
                <p className="text-destructive text-sm">{error || errors.general}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <Input
                  label="Full Name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
              )}
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />
              {!isLogin && (
                <Input
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  required
                />
              )}
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
              />
              {!isLogin && (
                <Input
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  required
                />
              )}
              <Button
                type="submit"
                variant="default"
                fullWidth
                size="lg"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline font-medium"
              >
                {isLogin ? 'Don\'t have an account? Sign up' : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserAuth;