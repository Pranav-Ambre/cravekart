import React from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../../types';
import { Star, Clock, Bike } from 'lucide-react';

export const RestaurantCard: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurants/${restaurant.slug || restaurant.id}`}
      className="group block bg-surface rounded-2xl border border-border p-3 transition-all duration-300 hover:shadow-card-hover hover:border-orange-200 hover:-translate-y-1"
    >
      {/* Restaurant Image */}
      <div className="relative w-full h-44 rounded-xl overflow-hidden bg-gray-100">
        <img
          src={restaurant.imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Floating badge for delivery time */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-white/95 backdrop-blur-sm text-dark-primary px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
          <Clock className="w-3.5 h-3.5 text-primary-500" />
          <span>{restaurant.deliveryTimeMin}-{restaurant.deliveryTimeMax} mins</span>
        </div>

        {/* Price range indicator */}
        <div className="absolute bottom-2.5 right-2.5 bg-secondary/80 text-white px-2 py-0.5 rounded text-[11px] font-semibold">
          {restaurant.priceRange}
        </div>
      </div>

      {/* Info Section */}
      <div className="p-2 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-dark-primary truncate group-hover:text-primary-600 transition-colors">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1 bg-green-50 text-success border border-green-200 px-2 py-0.5 rounded-lg text-xs font-bold flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-success text-success" />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-xs text-dark-secondary truncate">
          {restaurant.cuisineTypes}
        </p>

        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[11px] text-dark-secondary">
          <div className="flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-primary-500" />
            <span>
              {restaurant.deliveryFee === 0 ? 'Free Delivery' : `₹${restaurant.deliveryFee} Delivery`}
            </span>
          </div>
          <span>Min ₹{restaurant.minOrderAmount}</span>
        </div>
      </div>
    </Link>
  );
};
