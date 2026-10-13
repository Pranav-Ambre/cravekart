import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantService } from '../services';
import { Restaurant } from '../types';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { RestaurantCardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const CUISINES = [
  'Biryani',
  'Italian',
  'Pizza',
  'North Indian',
  'South Indian',
  'Chinese',
  'Asian',
  'Burgers',
  'Fast Food',
  'Desserts',
];

export const RestaurantsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search and filter parameters from URL
  const searchParam = searchParams.get('search') || '';
  const cuisineParam = searchParams.get('cuisine') || '';
  const minRatingParam = searchParams.get('minRating') || '';
  const maxDeliveryTimeParam = searchParams.get('maxDeliveryTime') || '';
  const priceRangeParam = searchParams.get('priceRange') || '';
  const vegOnlyParam = searchParams.get('vegOnly') === 'true';
  const sortParam = searchParams.get('sort') || 'popularity';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local state
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParam);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync searchInput when URL changes
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Fetch restaurants from server
  useEffect(() => {
    async function fetchList() {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          page: pageParam,
          limit: 12,
          sort: sortParam,
        };

        if (searchParam) params.search = searchParam;
        if (cuisineParam) params.cuisine = cuisineParam;
        if (minRatingParam) params.minRating = minRatingParam;
        if (maxDeliveryTimeParam) params.maxDeliveryTime = maxDeliveryTimeParam;
        if (priceRangeParam) params.priceRange = priceRangeParam;
        if (vegOnlyParam) params.vegOnly = 'true';

        const res = await restaurantService.getRestaurants(params);
        if (res.success) {
          setRestaurants(res.data);
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages);
            setTotalCount(res.pagination.total);
          }
        }
      } catch (err) {
        console.error('Failed to load restaurants:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchList();
  }, [
    searchParam,
    cuisineParam,
    minRatingParam,
    maxDeliveryTimeParam,
    priceRangeParam,
    vegOnlyParam,
    sortParam,
    pageParam,
  ]);

  const updateFilters = (newParams: Record<string, string | null>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === '') {
        updated.delete(key);
      } else {
        updated.set(key, val);
      }
    });
    // Reset page to 1 whenever filters change
    if (!newParams.page) {
      updated.set('page', '1');
    }
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() || null });
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    !!searchParam ||
    !!cuisineParam ||
    !!minRatingParam ||
    !!maxDeliveryTimeParam ||
    !!priceRangeParam ||
    vegOnlyParam;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-primary tracking-tight">
            Explore Restaurants
          </h1>
          <p className="text-xs sm:text-sm text-dark-secondary mt-1">
            {totalCount > 0
              ? `Showing ${totalCount} top-rated restaurants near you`
              : 'Discover authentic local flavors'}
          </p>
        </div>

        {/* Mobile Filter Toggle & Search Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-dark-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-border rounded-xl py-2 pl-9 pr-3 text-sm text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </form>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex-shrink-0"
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            Filters
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside
          className={`w-full md:w-64 bg-surface rounded-2xl border border-border p-5 shadow-sm space-y-6 flex-shrink-0 ${
            isMobileFilterOpen ? 'block' : 'hidden md:block'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary-500" />
              <h3 className="text-sm font-bold text-dark-primary">Filters</h3>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Sort By */}
          <div>
            <h4 className="text-xs font-bold text-dark-primary mb-2.5 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-dark-muted" />
              <span>Sort By</span>
            </h4>
            <div className="space-y-1.5 text-xs">
              {[
                { id: 'popularity', label: 'Popularity (Default)' },
                { id: 'rating', label: 'Rating: High to Low' },
                { id: 'deliveryTime', label: 'Delivery Time' },
                { id: 'priceLow', label: 'Delivery Cost: Low to High' },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 text-dark-secondary"
                >
                  <input
                    type="radio"
                    name="sort"
                    value={opt.id}
                    checked={sortParam === opt.id}
                    onChange={() => updateFilters({ sort: opt.id })}
                    className="text-primary-500 focus:ring-primary-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cuisines */}
          <div>
            <h4 className="text-xs font-bold text-dark-primary mb-2.5">Cuisine Type</h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-xs">
              {CUISINES.map((cuisine) => (
                <label
                  key={cuisine}
                  className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-gray-50 text-dark-secondary"
                >
                  <input
                    type="checkbox"
                    checked={cuisineParam === cuisine}
                    onChange={(e) =>
                      updateFilters({ cuisine: e.target.checked ? cuisine : null })
                    }
                    className="rounded text-primary-500 focus:ring-primary-500"
                  />
                  <span>{cuisine}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <h4 className="text-xs font-bold text-dark-primary mb-2.5">Rating</h4>
            <div className="flex flex-wrap gap-1.5">
              {['4.5', '4.0', '3.5'].map((r) => (
                <button
                  key={r}
                  onClick={() => updateFilters({ minRating: minRatingParam === r ? null : r })}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                    minRatingParam === r
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-dark-secondary border-border hover:bg-gray-50'
                  }`}
                >
                  ★ {r}+
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Time */}
          <div>
            <h4 className="text-xs font-bold text-dark-primary mb-2.5">Delivery Time</h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                { val: '30', label: '< 30 mins' },
                { val: '45', label: '< 45 mins' },
              ].map((d) => (
                <button
                  key={d.val}
                  onClick={() =>
                    updateFilters({ maxDeliveryTime: maxDeliveryTimeParam === d.val ? null : d.val })
                  }
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                    maxDeliveryTimeParam === d.val
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-dark-secondary border-border hover:bg-gray-50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-bold text-dark-primary mb-2.5">Price Range</h4>
            <div className="flex gap-2">
              {['₹', '₹₹', '₹₹₹'].map((p) => (
                <button
                  key={p}
                  onClick={() => updateFilters({ priceRange: priceRangeParam === p ? null : p })}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-colors ${
                    priceRangeParam === p
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-dark-secondary border-border hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Vegetarian Only */}
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={vegOnlyParam}
                onChange={(e) => updateFilters({ vegOnly: e.target.checked ? 'true' : null })}
                className="rounded text-green-600 focus:ring-green-500"
              />
              <span className="text-xs font-bold text-dark-primary">Pure Veg Options</span>
            </label>
          </div>
        </aside>

        {/* Restaurant Grid & Results */}
        <div className="flex-1 w-full space-y-6">
          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-dark-muted">Active:</span>
              {cuisineParam && (
                <span className="inline-flex items-center gap-1 text-xs bg-orange-50 text-primary-700 px-2.5 py-1 rounded-lg border border-orange-200">
                  {cuisineParam}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer"
                    onClick={() => updateFilters({ cuisine: null })}
                  />
                </span>
              )}
              {minRatingParam && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-800 px-2.5 py-1 rounded-lg border border-green-200">
                  ★ {minRatingParam}+
                  <X
                    className="w-3.5 h-3.5 cursor-pointer"
                    onClick={() => updateFilters({ minRating: null })}
                  />
                </span>
              )}
              {maxDeliveryTimeParam && (
                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-dark-primary px-2.5 py-1 rounded-lg">
                  Under {maxDeliveryTimeParam} mins
                  <X
                    className="w-3.5 h-3.5 cursor-pointer"
                    onClick={() => updateFilters({ maxDeliveryTime: null })}
                  />
                </span>
              )}
              {priceRangeParam && (
                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-dark-primary px-2.5 py-1 rounded-lg">
                  {priceRangeParam}
                  <X
                    className="w-3.5 h-3.5 cursor-pointer"
                    onClick={() => updateFilters({ priceRange: null })}
                  />
                </span>
              )}
              {vegOnlyParam && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-800 px-2.5 py-1 rounded-lg border border-green-200">
                  Pure Veg
                  <X
                    className="w-3.5 h-3.5 cursor-pointer"
                    onClick={() => updateFilters({ vegOnly: null })}
                  />
                </span>
              )}
              <button
                onClick={resetAllFilters}
                className="text-xs text-primary-600 font-bold hover:underline ml-1"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Grid content */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <RestaurantCardSkeleton key={n} />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <EmptyState
              title="No restaurants match your filters"
              description="Try adjusting your cuisine, rating, or delivery time preferences to see more food options."
              actionLabel="Reset All Filters"
              onAction={resetAllFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageParam <= 1}
                    onClick={() => updateFilters({ page: (pageParam - 1).toString() })}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Previous
                  </Button>
                  <span className="text-xs font-bold text-dark-primary px-3">
                    Page {pageParam} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageParam >= totalPages}
                    onClick={() => updateFilters({ page: (pageParam + 1).toString() })}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
