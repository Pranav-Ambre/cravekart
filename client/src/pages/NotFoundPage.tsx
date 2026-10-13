import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 text-primary-500 flex items-center justify-center mb-4">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-dark-primary tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-dark-primary mt-1">Page Not Found</h2>
      <p className="text-xs text-dark-secondary mt-1 max-w-sm">
        Oops! The page you were looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Home
        </Button>
      </Link>
    </div>
  );
};
