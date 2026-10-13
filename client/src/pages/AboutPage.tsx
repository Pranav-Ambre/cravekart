import React from 'react';
import { ShoppingBag, Utensils, Heart, ShieldCheck, Clock, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
      {/* Brand Hero */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center mx-auto shadow-md">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-primary tracking-tight">
          Good Food. Delivered Fresh.
        </h1>
        <p className="text-sm text-dark-secondary leading-relaxed">
          CraveKart is on a mission to connect food lovers with exceptional local culinary talents,
          hand-crafted recipes, and reliable, high-speed door-to-door delivery.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary-500 flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-dark-primary mb-2">Curated Restaurants</h3>
          <p className="text-xs text-dark-secondary leading-relaxed">
            We partner with verified kitchens renowned for high hygiene, authentic flavors, and fresh ingredients.
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-success flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-dark-primary mb-2">Lightning Fast Delivery</h3>
          <p className="text-xs text-dark-secondary leading-relaxed">
            Optimized hyper-local routing ensures your food arrives piping hot and fresh every single time.
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-dark-primary mb-2">Trust & Security</h3>
          <p className="text-xs text-dark-secondary leading-relaxed">
            Transparent pricing, zero hidden fees, live order tracking, and bank-grade secure payments.
          </p>
        </div>
      </div>

      {/* Story section */}
      <div className="bg-surface rounded-3xl border border-border p-8 md:p-10 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-dark-primary">Our Story</h2>
        <p className="text-xs sm:text-sm text-dark-secondary leading-relaxed">
          Started with a passion for authentic Indian culinary traditions and global street foods,
          CraveKart bridges the gap between busy food enthusiasts and top culinary masters. From
          rich clay-handi dum biryanis to artisan sourdough pizzas, we ensure every dish is treated
          with culinary respect from the kitchen stove to your dinner table.
        </p>
      </div>
    </div>
  );
};
