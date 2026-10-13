import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { ShoppingBag, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devResetToken, setDevResetToken] = useState<string | null>(null);
  const { error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setIsSubmitted(true);
      if (res.data.devToken) {
        setDevResetToken(res.data.devToken);
      }
    } catch (err: any) {
      error(err.message || 'Failed to request password reset');
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
          <h2 className="text-xl font-extrabold text-dark-primary">Reset Password</h2>
          <p className="text-xs text-dark-secondary">
            Enter your email and we'll send you instructions to reset your password.
          </p>
        </div>

        {!isSubmitted ? (
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
            <Button type="submit" className="w-full" size="md" isLoading={isLoading}>
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 text-success flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-dark-secondary leading-relaxed">
              If an account matches <strong>{email}</strong>, a password reset link has been dispatched.
            </p>

            {devResetToken && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-left">
                <p className="text-[11px] font-bold text-primary-900 mb-1">
                  Developer Mode Preview:
                </p>
                <Link
                  to={`/reset-password?token=${devResetToken}`}
                  className="text-xs text-primary-600 underline font-semibold break-all"
                >
                  Click here to Reset Password Now (Token: {devResetToken.slice(0, 8)}...)
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-2 border-t border-gray-100">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-secondary hover:text-primary-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
