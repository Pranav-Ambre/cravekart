import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      error('Reset token is missing from URL.');
      return;
    }
    if (newPassword.length < 6) {
      error('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (res.data.success) {
        success('Password updated successfully! Please log in.');
        navigate('/login');
      }
    } catch (err: any) {
      error(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-surface rounded-3xl border border-border p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center mx-auto shadow-md">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-extrabold text-dark-primary">Set New Password</h2>
          <p className="text-xs text-dark-secondary">
            Enter and confirm your new account password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            required
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" className="w-full" size="md" isLoading={isLoading}>
            Update Password
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100">
          <Link to="/login" className="text-xs font-bold text-primary-600 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
