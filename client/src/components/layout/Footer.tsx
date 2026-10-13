import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin, Instagram, Twitter, Facebook, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-gray-300 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Crave<span className="text-primary-500">Kart</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-sm leading-relaxed">
              Good Food. Delivered Fresh. Your favorite local restaurants and authentic delicacies delivered straight to your door with blazing speed.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-colors text-gray-400"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-colors text-gray-400"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-primary-500 hover:text-white flex items-center justify-center transition-colors text-gray-400"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="hover:text-white transition-colors">
                  Explore Restaurants
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition-colors">
                  Offers & Coupons
                </Link>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Careers (We're Hiring)
                </span>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Legal & Policies
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Terms & Conditions
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Refund & Cancellation
                </span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-white transition-colors">
                  Delivery Terms
                </span>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Customer Support
            </h4>
            <ul className="space-y-3 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>support@cravekart.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>+91 80 4920 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>Koramangala, Bengaluru, India</span>
              </li>
              <li className="pt-1 flex items-center gap-1.5 text-green-400 text-[11px] font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Safe & Secure Checkout</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} CraveKart Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-red-500">♥</span> for food lovers.
          </p>
        </div>
      </div>
    </footer>
  );
};
