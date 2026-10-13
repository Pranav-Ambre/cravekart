import React, { useState } from 'react';
import { FoodItem } from '../../types';
import { VegBadge } from './VegBadge';
import { Star, Plus, Minus } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { FoodCustomizationModal } from './FoodCustomizationModal';

export interface FoodCardProps {
  food: FoodItem;
  restaurant: { id: string; name: string; deliveryFee: number };
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, restaurant }) => {
  const { items, addItem, updateQuantity } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if item is already in cart
  const cartItem = items.find((i) => i.foodItemId === food.id);
  const hasCustomizations = (food.customizations && food.customizations.length > 0);

  const handleAddClick = () => {
    if (hasCustomizations) {
      setIsModalOpen(true);
    } else {
      addItem(food, restaurant, 1);
    }
  };

  return (
    <>
      <div className="bg-surface rounded-2xl border border-border p-4 flex gap-4 transition-all duration-200 hover:shadow-card hover:border-gray-300">
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <VegBadge isVeg={food.isVeg} />
              {food.isRecommended && (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ★ Bestseller
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-dark-primary leading-snug group-hover:text-primary-600 transition-colors">
              {food.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-dark-primary">₹{food.price}</span>
              {food.rating && (
                <div className="flex items-center gap-0.5 text-xs font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                  <Star className="w-3 h-3 fill-green-600 text-green-600" />
                  <span>{food.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <p className="text-xs text-dark-secondary mt-2 line-clamp-2 leading-relaxed">
              {food.description}
            </p>
          </div>

          {hasCustomizations && (
            <p className="text-[11px] font-semibold text-primary-600 mt-2">
              Customizable
            </p>
          )}
        </div>

        {/* Image & Add Button */}
        <div className="relative flex-shrink-0 flex flex-col items-center">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 border border-border">
            <img
              src={food.imageUrl}
              alt={food.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>

          <div className="absolute -bottom-2">
            {!cartItem ? (
              <button
                onClick={handleAddClick}
                disabled={!food.isAvailable}
                className="bg-white hover:bg-primary-50 text-primary-600 border border-primary-500 hover:border-primary-600 font-bold text-xs uppercase px-5 py-1.5 rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {food.isAvailable ? 'ADD' : 'SOLD OUT'}
              </button>
            ) : (
              <div className="flex items-center bg-primary-500 text-white rounded-lg shadow-sm overflow-hidden font-bold text-xs">
                <button
                  onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                  className="px-2.5 py-1 hover:bg-primary-600 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2">{cartItem.quantity}</span>
                <button
                  onClick={() => {
                    if (hasCustomizations) {
                      setIsModalOpen(true);
                    } else {
                      updateQuantity(cartItem.id, cartItem.quantity + 1);
                    }
                  }}
                  className="px-2.5 py-1 hover:bg-primary-600 transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customization modal */}
      <FoodCustomizationModal
        food={food}
        restaurant={restaurant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
