import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MapPin,
  Search,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  Tag,
  Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { foodService } from '../../services';
import { Restaurant, FoodItem } from '../../types';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { currentLocation, openLocationModal } = useLocation();
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ restaurants: Restaurant[]; foods: FoodItem[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // User menu & Mobile menu
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await foodService.search(searchQuery.trim());
        if (res.success && res.data) {
          setSearchResults(res.data);
          setShowSearchDropdown(true);
        }
      } catch (e) {
        // ignore search error
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (url: string) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(url);
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Location */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-dark-primary font-sans">
                  Crave<span className="text-primary-500">Kart</span>
                </span>
                <span className="text-[10px] -mt-1 font-semibold text-dark-muted tracking-wider uppercase">
                  Delivered Fresh
                </span>
              </div>
            </Link>

            {/* Delivery Location Selector */}
            <button
              onClick={openLocationModal}
              className="hidden lg:flex items-center gap-2 text-left px-3 py-1.5 rounded-xl border border-gray-200 hover:border-primary-400 hover:bg-orange-50/50 transition-colors"
              title="Change Delivery Location"
            >
              <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-dark-primary truncate max-w-[150px]">
                  {currentLocation.area}
                </p>
                <p className="text-[11px] text-dark-muted truncate max-w-[150px]">
                  {currentLocation.city}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-dark-muted" />
            </button>
          </div>

          {/* Search bar */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-md hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-dark-muted absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search for biryani, pizza, burgers, or restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults) setShowSearchDropdown(true);
                }}
                className="w-full bg-gray-50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-dark-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Search Dropdown Results */}
            {showSearchDropdown && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-dropdown border border-border overflow-hidden z-50 max-h-96 overflow-y-auto">
                {searchResults.restaurants.length === 0 && searchResults.foods.length === 0 ? (
                  <div className="p-4 text-center text-xs text-dark-secondary">
                    No dishes or restaurants found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {searchResults.restaurants.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-dark-muted uppercase px-3 py-1">
                          Restaurants
                        </p>
                        {searchResults.restaurants.map((r) => (
                          <div
                            key={r.id}
                            onClick={() => handleSelectSearchResult(`/restaurants/${r.slug || r.id}`)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-colors"
                          >
                            <img src={r.imageUrl} alt={r.name} className="w-9 h-9 rounded-lg object-cover" />
                            <div className="flex-1 truncate">
                              <p className="text-xs font-bold text-dark-primary">{r.name}</p>
                              <p className="text-[11px] text-dark-muted truncate">{r.cuisineTypes}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.foods.length > 0 && (
                      <div className="pt-1 border-t border-gray-100">
                        <p className="text-[11px] font-bold text-dark-muted uppercase px-3 py-1">
                          Dishes
                        </p>
                        {searchResults.foods.map((f) => (
                          <div
                            key={f.id}
                            onClick={() => handleSelectSearchResult(`/restaurants/${f.restaurant?.slug || f.restaurantId}`)}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50 cursor-pointer transition-colors"
                          >
                            <img src={f.imageUrl} alt={f.name} className="w-9 h-9 rounded-lg object-cover" />
                            <div className="flex-1 truncate">
                              <p className="text-xs font-bold text-dark-primary">{f.name}</p>
                              <p className="text-[11px] text-dark-muted">
                                ₹{f.price} • {f.restaurant?.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Navigation Links & Cart & Auth */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link
                to="/restaurants"
                className="text-sm font-semibold text-dark-primary hover:text-primary-500 px-3 py-2 rounded-lg transition-colors"
              >
                Restaurants
              </Link>
              <Link
                to="/offers"
                className="flex items-center gap-1 text-sm font-semibold text-dark-primary hover:text-primary-500 px-3 py-2 rounded-lg transition-colors"
              >
                <Tag className="w-3.5 h-3.5 text-primary-500" />
                <span>Offers</span>
              </Link>
              <Link
                to="/about"
                className="text-sm font-semibold text-dark-primary hover:text-primary-500 px-3 py-2 rounded-lg transition-colors"
              >
                About
              </Link>
            </nav>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-600 px-3.5 py-2 rounded-xl font-bold text-sm transition-colors border border-primary-200"
              aria-label={`Shopping cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-4 h-4 text-primary-500" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="bg-primary-500 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth Menu */}
            {isAuthenticated && user ? (
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-dark-primary hidden sm:inline truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-dark-muted hidden sm:inline" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-dropdown border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-dark-primary truncate">{user.name}</p>
                      <p className="text-[11px] text-dark-muted truncate">{user.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-primary-600 hover:bg-primary-50"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to="/customer/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-dark-primary hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4 text-dark-muted" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/customer/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-dark-primary hover:bg-gray-50"
                      >
                        <Heart className="w-4 h-4 text-dark-muted" />
                        <span>Favorites</span>
                      </Link>
                      <Link
                        to="/customer/addresses"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-dark-primary hover:bg-gray-50"
                      >
                        <MapPin className="w-4 h-4 text-dark-muted" />
                        <span>Saved Addresses</span>
                      </Link>
                      <Link
                        to="/customer/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-dark-primary hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4 text-dark-muted" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-danger hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-bold text-dark-primary hover:text-primary-500 px-3 py-2 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-500 hover:bg-primary-600 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow-sm transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-dark-primary hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border space-y-3 animate-in slide-in-from-top-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openLocationModal();
              }}
              className="w-full flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-left"
            >
              <MapPin className="w-4 h-4 text-primary-500" />
              <div className="text-xs">
                <span className="font-bold text-dark-primary block">{currentLocation.area}</span>
                <span className="text-dark-muted">{currentLocation.city}</span>
              </div>
            </button>

            <div className="flex flex-col space-y-1">
              <Link
                to="/restaurants"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-dark-primary hover:bg-gray-50 rounded-lg"
              >
                Restaurants
              </Link>
              <Link
                to="/offers"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-dark-primary hover:bg-gray-50 rounded-lg"
              >
                Special Offers
              </Link>
              <Link
                to="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-bold text-dark-primary hover:bg-gray-50 rounded-lg"
              >
                About Us
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
