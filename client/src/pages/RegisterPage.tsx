import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ShoppingBag, Lock, Mail, User, Phone } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        phone: phone || undefined,
        password,
      });

      if (res.data.success && res.data.data) {
        login(res.data.data.token, res.data.data.user);
        success(`Welcome to CraveKart, ${res.data.data.user.name}!`);
        navigate('/');
      }
    } catch (err: any) {
      error(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-surface rounded-3xl border border-border p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-md">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-dark-primary tracking-tight">
              Crave<span className="text-primary-500">Kart</span>
            </span>
          </Link>
          <h2 className="text-xl font-extrabold text-dark-primary">Create Your Account</h2>
          <p className="text-xs text-dark-secondary">
            Join CraveKart to explore top local restaurants, unlock special coupons, and order fresh food.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="Rahul Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email Address"
            type="email"
            required
            placeholder="rahul@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" className="w-full" size="md" isLoading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-dark-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary-600 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
