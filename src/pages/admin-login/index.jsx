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
        if (data.role === 'admin') {
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
    <form onSubmit={handleSubmit}>
      <input name="email" value={formData.email} onChange={handleChange} placeholder="Admin Email" />
      <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" />
      <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default AdminLogin;