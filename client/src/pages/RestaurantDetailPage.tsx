import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurantService, couponService } from '../services';
import { Restaurant, FoodItem, FoodCategory, Coupon } from '../types';
import { FoodCard } from '../components/food/FoodCard';
import { FoodCardSkeleton } from '../components/common/Skeleton';
import {
  Star,
  Clock,
  Bike,
  Search,
  Tag,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { VegBadge } from '../components/food/VegBadge';

export const RestaurantDetailPage: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    async function loadRestaurant() {
      if (!idOrSlug) return;
      setIsLoading(true);
      try {
        const [restRes, couponRes] = await Promise.all([
          restaurantService.getBySlugOrId(idOrSlug),
          couponService.getActive(),
        ]);

        if (restRes.success) setRestaurant(restRes.data);
        if (couponRes.success) setCoupons(couponRes.data);
      } catch (err) {
        console.error('Failed to load restaurant details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRestaurant();
  }, [idOrSlug]);

  // Filter food items based on category, search text, and vegOnly
  const filteredFoodItems = useMemo(() => {
    if (!restaurant?.foodItems) return [];

    return restaurant.foodItems.filter((item: FoodItem) => {
      // Veg filter
      if (vegOnly && !item.isVeg) return false;

      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) {
        return false;
      }

      // Search filter
      if (menuSearch.trim()) {
        const query = menuSearch.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [restaurant, menuSearch, selectedCategory, vegOnly]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-64 bg-gray-200 animate-pulse rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <FoodCardSkeleton key={n} />
          ))}
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
        <h2 className="text-xl font-bold text-dark-primary">Restaurant Not Found</h2>
        <p className="text-sm text-dark-secondary mt-1">
          The restaurant you requested may have moved or is temporarily unavailable.
        </p>
        <Link
          to="/restaurants"
          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-600 bg-primary-50 px-4 py-2.5 rounded-xl border border-primary-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Other Restaurants</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-dark-secondary hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurants</span>
        </Link>
      </div>

      {/* Restaurant Header Banner */}
      <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-card">
        <div className="relative h-48 sm:h-64 w-full bg-gray-100">
          <img
            src={restaurant.bannerUrl || restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Floating open/closed status */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
            {restaurant.isOpen ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span className="text-success">Open Now</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-danger" />
                <span className="text-danger">Currently Closed</span>
              </>
            )}
          </div>
        </div>

        {/* Restaurant Details Bar */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-primary tracking-tight">
                {restaurant.name}
              </h1>
              <p className="text-sm text-dark-secondary mt-1">{restaurant.cuisineTypes}</p>
              <p className="text-xs text-dark-muted mt-0.5">
                {restaurant.address}, {restaurant.city}
              </p>
            </div>

            {/* Rating Box */}
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-3 rounded-2xl flex-shrink-0">
              <div className="flex items-center gap-1 bg-success text-white px-2 py-1 rounded-lg text-sm font-extrabold shadow-sm">
                <Star className="w-4 h-4 fill-white" />
                <span>{restaurant.rating.toFixed(1)}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-dark-primary">
                  {restaurant.reviewCount}+ Ratings
                </p>
                <p className="text-[11px] text-dark-muted">Verified Orders</p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100 text-xs font-semibold text-dark-secondary">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-500" />
              <span>
                {restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} mins delivery
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bike className="w-4 h-4 text-primary-500" />
              <span>
                {restaurant.deliveryFee === 0 ? 'Free Delivery' : `₹${restaurant.deliveryFee} Delivery`}
              </span>
            </div>
            <div>
              <span>Minimum order: ₹{restaurant.minOrderAmount}</span>
            </div>
            <div>
              <span>Price range: {restaurant.priceRange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Coupon Banner */}
      {coupons.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-3 overflow-x-auto">
          <Tag className="w-5 h-5 text-primary-500 flex-shrink-0" />
          <div className="flex items-center gap-4 text-xs font-medium text-dark-primary whitespace-nowrap">
            {coupons.slice(0, 3).map((c) => (
              <span key={c.id} className="bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-sm">
                Use code <strong className="text-primary-600 font-bold">{c.code}</strong> for {c.description}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Menu Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        {/* Search inside menu */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search inside menu..."
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            className="w-full bg-white border border-border rounded-xl py-2 pl-9 pr-3 text-sm text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
        </div>

        {/* Veg Only Toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-border shadow-sm self-start sm:self-auto">
          <VegBadge isVeg={true} />
          <span className="text-xs font-bold text-dark-primary">Pure Veg Only</span>
          <input
            type="checkbox"
            checked={vegOnly}
            onChange={(e) => setVegOnly(e.target.checked)}
            className="sr-only"
          />
          <div
            className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
              vegOnly ? 'bg-green-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
                vegOnly ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </label>
      </div>

      {/* Category Navigation Pills */}
      {restaurant.foodCategories && restaurant.foodCategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white border border-border text-dark-secondary hover:bg-gray-50'
            }`}
          >
            All Items ({restaurant.foodItems?.length || 0})
          </button>
          {restaurant.foodCategories.map((cat: FoodCategory) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white border border-border text-dark-secondary hover:bg-gray-50'
              }`}
            >
              {cat.name} ({cat.foodItems?.length || 0})
            </button>
          ))}
        </div>
      )}

      {/* Food Items List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-dark-primary">
          {selectedCategory === 'all'
            ? 'Full Menu'
            : restaurant.foodCategories?.find((c: FoodCategory) => c.id === selectedCategory)?.name || 'Menu Items'}
          <span className="text-xs font-normal text-dark-muted ml-2">
            ({filteredFoodItems.length} items)
          </span>
        </h3>

        {filteredFoodItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-sm font-semibold text-dark-secondary">
              No menu items match your search or dietary filter.
            </p>
            <button
              onClick={() => {
                setMenuSearch('');
                setVegOnly(false);
                setSelectedCategory('all');
              }}
              className="mt-3 text-xs font-bold text-primary-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFoodItems.map((food: FoodItem) => (
              <FoodCard
                key={food.id}
                food={food}
                restaurant={{
                  id: restaurant.id,
                  name: restaurant.name,
                  deliveryFee: restaurant.deliveryFee,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
