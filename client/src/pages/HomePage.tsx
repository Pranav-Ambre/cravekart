import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  Utensils,
  Clock,
  ShieldCheck,
  Tag,
  Copy,
  Check,
  Star,
  Quote,
} from 'lucide-react';
import { restaurantService, foodService, couponService } from '../services';
import { Restaurant, FoodItem, FoodCategory, Coupon } from '../types';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { FoodCard } from '../components/food/FoodCard';
import { RestaurantCardSkeleton, FoodCardSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { useLocation } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation, openLocationModal } = useLocation();
  const { success } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [popularDishes, setPopularDishes] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [restRes, dishRes, catRes, couponRes] = await Promise.all([
          restaurantService.getFeatured(),
          foodService.getPopular(),
          foodService.getCategories(),
          couponService.getActive(),
        ]);

        if (restRes.success) setFeaturedRestaurants(restRes.data);
        if (dishRes.success) setPopularDishes(dishRes.data);
        if (catRes.success) setCategories(catRes.data);
        if (couponRes.success) setCoupons(couponRes.data);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    success(`Copied coupon code ${code}!`);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-background to-background pt-10 pb-16 md:py-20 border-b border-orange-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-600 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                <span>Over 100+ Authentic Local Restaurants</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-primary tracking-tight leading-[1.15]">
                Your Favorite Food,{' '}
                <span className="text-primary-500 underline decoration-primary-300 decoration-wavy decoration-2">
                  Delivered
                </span>{' '}
                to Your Door.
              </h1>

              <p className="text-base sm:text-lg text-dark-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover steaming Hyderabadi biryanis, artisan woodfired pizzas, juicy burgers, and
                scrumptious sweets from top chefs near you. Fast, reliable, and freshly prepared.
              </p>

              {/* Location Selector & Search Box */}
              <div className="bg-surface p-2.5 sm:p-3 rounded-2xl shadow-dropdown border border-border max-w-xl mx-auto lg:mx-0">
                <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={openLocationModal}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-orange-50 border border-gray-200 text-left transition-colors flex-shrink-0"
                  >
                    <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <div className="text-xs">
                      <span className="font-bold text-dark-primary block truncate max-w-[130px]">
                        {currentLocation.area}
                      </span>
                    </div>
                  </button>

                  <div className="relative flex-1 flex items-center">
                    <Search className="w-4 h-4 text-dark-muted absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search for restaurants or dishes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-border rounded-xl py-2.5 pl-9 pr-3 text-sm text-dark-primary placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>

                  <Button type="submit" size="md" className="flex-shrink-0">
                    Find Food
                  </Button>
                </form>
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs text-dark-secondary">
                <span className="font-semibold text-dark-primary">Trending:</span>
                {['Biryani', 'Pizza', 'Burger', 'Dosa', 'Cake'].map((item) => (
                  <Link
                    key={item}
                    to={`/restaurants?search=${encodeURIComponent(item)}`}
                    className="bg-white hover:bg-orange-50 hover:text-primary-600 border border-border px-2.5 py-1 rounded-lg transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column: Hero Visual Food Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="w-full h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80"
                    alt="Delicious fresh food assortment"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Floating card 1 */}
                <div className="absolute -bottom-6 -left-6 bg-surface p-3.5 rounded-2xl shadow-modal border border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-success flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-primary">Fast Delivery</p>
                    <p className="text-[11px] text-dark-muted">Under 30 mins average</p>
                  </div>
                </div>

                {/* Floating card 2 */}
                <div className="absolute -top-4 -right-4 bg-surface p-3 rounded-2xl shadow-modal border border-border flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 text-primary-500 flex items-center justify-center">
                    <Utensils className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-dark-primary">Authentic Taste</p>
                    <p className="text-[11px] text-dark-muted">100% Chef Verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Food Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-1">
              What are you craving?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-primary tracking-tight">
              Popular Categories
            </h2>
          </div>
          <Link
            to="/restaurants"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/restaurants?cuisine=${encodeURIComponent(cat.name.split(' ')[0])}`}
              className="group flex flex-col items-center bg-white hover:bg-orange-50/60 p-3 rounded-2xl border border-border hover:border-orange-200 shadow-sm transition-all duration-200 hover:-translate-y-1 text-center"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-2 bg-gray-100 border border-gray-200 group-hover:scale-105 transition-transform">
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-dark-primary group-hover:text-primary-600 transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Special Promotional Offers */}
      {coupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-5 h-5 text-white" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-orange-100">
                Exclusive Deals
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 tracking-tight">
              Delicious Offers Crafted Just For You
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col justify-between hover:bg-white/15 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-black tracking-wider bg-white text-primary-600 px-2.5 py-0.5 rounded-lg">
                        {coupon.code}
                      </span>
                      <span className="text-[11px] font-semibold text-orange-100">
                        Min ₹{coupon.minOrderValue}
                      </span>
                    </div>
                    <p className="text-xs text-white/90 font-medium leading-relaxed mb-3">
                      {coupon.description}
                    </p>
                  </div>

                  <button
                    onClick={() => copyCouponCode(coupon.code)}
                    className="w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white text-white hover:text-primary-600 text-xs font-bold py-2 rounded-xl transition-all"
                  >
                    {copiedCoupon === coupon.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-300" />
                        <span>Code Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Featured Restaurants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-1">
              Top Rated in {currentLocation.area}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-primary tracking-tight">
              Featured Restaurants
            </h2>
          </div>
          <Link
            to="/restaurants"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span>See All Restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <RestaurantCardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Popular Dishes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-1">
              Chef Specials
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-primary tracking-tight">
              Trending Dishes Near You
            </h2>
          </div>
          <Link
            to="/restaurants"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <FoodCardSkeleton key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {popularDishes.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                restaurant={{
                  id: food.restaurant?.id || food.restaurantId,
                  name: food.restaurant?.name || 'Restaurant',
                  deliveryFee: food.restaurant?.deliveryFee || 40,
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* 6. How CraveKart Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-3xl border border-border p-8 md:p-12 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-1">
            Easy Ordering
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-primary tracking-tight mb-12">
            How CraveKart Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-primary-500 font-extrabold text-xl flex items-center justify-center mb-4 shadow-sm">
                1
              </div>
              <h3 className="text-base font-bold text-dark-primary mb-2">
                Choose Your Favorite Food
              </h3>
              <p className="text-xs text-dark-secondary max-w-xs leading-relaxed">
                Browse hand-picked top restaurants and customize your meals with authentic options.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-primary-500 font-extrabold text-xl flex items-center justify-center mb-4 shadow-sm">
                2
              </div>
              <h3 className="text-base font-bold text-dark-primary mb-2">
                Place Order Securely
              </h3>
              <p className="text-xs text-dark-secondary max-w-xs leading-relaxed">
                Pay safely using Razorpay, UPI, or select Cash on Delivery at your convenience.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-primary-500 font-extrabold text-xl flex items-center justify-center mb-4 shadow-sm">
                3
              </div>
              <h3 className="text-base font-bold text-dark-primary mb-2">
                Enjoy Fresh Delivery
              </h3>
              <p className="text-xs text-dark-secondary max-w-xs leading-relaxed">
                Follow your delivery progress and savor hot, restaurant-quality meals at home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Realistic Demonstration Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600 block mb-1">
            Customer Love
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-primary tracking-tight">
            What Food Lovers Say About Us
          </h2>
          <p className="text-xs text-dark-muted mt-1 italic">
            (Demonstration testimonials reflecting real user satisfaction patterns)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Ananya Deshmukh',
              location: 'Koramangala, Bengaluru',
              rating: 5,
              comment:
                'The Royal Biryani House dum biryani was delivered piping hot in 25 minutes! Packaging was stellar and the Mirchi Ka Salan was authentic.',
            },
            {
              name: 'Karthik Raman',
              location: 'Indiranagar, Bengaluru',
              rating: 5,
              comment:
                'Crust & Flame sourdough margherita is easily the best pizza in town. Smooth checkout with Razorpay and real-time order tracking.',
            },
            {
              name: 'Sneha Patel',
              location: 'Whitefield, Bengaluru',
              rating: 5,
              comment:
                'Super clean website design, easy coupon application with CRAVE50, and delivery was right on time. CraveKart is now our go-to food app!',
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="bg-surface rounded-2xl border border-border p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <Quote className="w-6 h-6 text-primary-200 mb-3" />
                <p className="text-xs text-dark-secondary leading-relaxed mb-4">
                  "{t.comment}"
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <h4 className="text-xs font-bold text-dark-primary">{t.name}</h4>
                  <p className="text-[11px] text-dark-muted">{t.location}</p>
                </div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
