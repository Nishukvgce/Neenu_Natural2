import { Eye, EyeOff, Shield } from 'lucide-react';
import dataService from '../../services/dataService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        const role = (data?.role || '').toLowerCase();
        if (role === 'admin') {
          localStorage.setItem('adminUser', JSON.stringify(data));
          navigate('/admin-panel');
        } else {
          setError('You are not authorized as admin.');
        }
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Shield className="text-primary" size={22} />
            </div>
            <h1 className="font-heading text-2xl font-semibold text-foreground">Admin Login</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Access the admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Admin Email"
              name="email"
              type="email"
              placeholder="admin@neenusnatural.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center"
                >
                  {showPassword ? <><EyeOff size={14} className="mr-1"/> Hide</> : <><Eye size={14} className="mr-1"/> Show</>}
                </button>
              </div>
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-3 font-body text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading} iconName="LogIn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="text-center pt-2">
              <p className="font-caption text-xs text-muted-foreground">
                Tip: Ensure your admin account has role = 'admin'
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;