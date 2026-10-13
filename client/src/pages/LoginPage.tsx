import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success && res.data.data) {
        login(res.data.data.token, res.data.data.user);
        success(`Welcome back, ${res.data.data.user.name}!`);
        if (res.data.data.user.role === 'ADMIN' && redirect === '/') {
          navigate('/admin');
        } else {
          navigate(redirect);
        }
      }
    } catch (err: any) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('rahul@example.com');
    setPassword('Password123!');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@cravekart.com');
    setPassword('AdminPassword123!');
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
          <h2 className="text-xl font-extrabold text-dark-primary">Welcome Back</h2>
          <p className="text-xs text-dark-secondary">
            Sign in to access your orders, favorites, and saved delivery addresses.
          </p>
        </div>

        {/* 1-Click Demo Login Bar */}
        <div className="bg-orange-50/70 border border-orange-200 p-3.5 rounded-2xl space-y-2">
          <p className="text-[11px] font-bold text-primary-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
            <span>Quick Demo Credentials</span>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fillDemoCustomer}
              className="flex-1 bg-white hover:bg-orange-100 text-dark-primary border border-orange-200 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="flex-1 bg-white hover:bg-orange-100 text-dark-primary border border-orange-200 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-dark-primary">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-primary-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />
          </div>

          <Button type="submit" className="w-full" size="md" isLoading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-dark-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
