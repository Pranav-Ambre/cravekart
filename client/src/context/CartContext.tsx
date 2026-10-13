import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { CartItem, FoodItem, CartItemOption, Coupon, Restaurant } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantInfo: Partial<Restaurant> | null;
  coupon: Coupon | null;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  addItem: (
    food: FoodItem,
    restaurant: { id: string; name: string; deliveryFee: number },
    quantity?: number,
    options?: CartItemOption[]
  ) => boolean;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  pendingRestaurantConflict: {
    food: FoodItem;
    restaurant: { id: string; name: string; deliveryFee: number };
    quantity: number;
    options: CartItemOption[];
  } | null;
  resolveConflict: (replace: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast, success, info } = useToast();

  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cravekart_cart_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [restaurantId, setRestaurantId] = useState<string | null>(() => {
    return localStorage.getItem('cravekart_cart_restaurant_id') || null;
  });

  const [restaurantInfo, setRestaurantInfo] = useState<Partial<Restaurant> | null>(() => {
    const saved = localStorage.getItem('cravekart_cart_restaurant_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('cravekart_cart_coupon');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [pendingConflict, setPendingConflict] = useState<{
    food: FoodItem;
    restaurant: { id: string; name: string; deliveryFee: number };
    quantity: number;
    options: CartItemOption[];
  } | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('cravekart_cart_items', JSON.stringify(items));
    if (restaurantId) {
      localStorage.setItem('cravekart_cart_restaurant_id', restaurantId);
    } else {
      localStorage.removeItem('cravekart_cart_restaurant_id');
    }
    if (restaurantInfo) {
      localStorage.setItem('cravekart_cart_restaurant_info', JSON.stringify(restaurantInfo));
    } else {
      localStorage.removeItem('cravekart_cart_restaurant_info');
    }
    if (coupon) {
      localStorage.setItem('cravekart_cart_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('cravekart_cart_coupon');
    }
  }, [items, restaurantId, restaurantInfo, coupon]);

  const generateCartItemId = (foodId: string, options: CartItemOption[]) => {
    const sortedOptionIds = [...options].map((o) => o.optionId).sort().join('_');
    return `${foodId}:${sortedOptionIds}`;
  };

  const addItemInternal = (
    food: FoodItem,
    restaurant: { id: string; name: string; deliveryFee: number },
    quantity = 1,
    options: CartItemOption[] = []
  ) => {
    const optionsTotal = options.reduce((sum, opt) => sum + opt.price, 0);
    const unitPrice = food.price + optionsTotal;
    const cartItemId = generateCartItemId(food.id, options);

    setRestaurantId(restaurant.id);
    setRestaurantInfo({
      id: restaurant.id,
      name: restaurant.name,
      deliveryFee: restaurant.deliveryFee,
    });

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          id: cartItemId,
          foodItemId: food.id,
          restaurantId: restaurant.id,
          foodItem: food,
          quantity,
          selectedOptions: options,
          unitPrice,
          totalPrice: quantity * unitPrice,
        };
        return [...prev, newItem];
      }
    });

    success(`Added ${food.name} to your cart`);
  };

  const addItem = (
    food: FoodItem,
    restaurant: { id: string; name: string; deliveryFee: number },
    quantity = 1,
    options: CartItemOption[] = []
  ): boolean => {
    if (items.length > 0 && restaurantId && restaurantId !== restaurant.id) {
      setPendingConflict({
        food,
        restaurant,
        quantity,
        options,
      });
      return false;
    }

    addItemInternal(food, restaurant, quantity, options);
    return true;
  };

  const resolveConflict = (replace: boolean) => {
    if (replace && pendingConflict) {
      setItems([]);
      setCoupon(null);
      addItemInternal(
        pendingConflict.food,
        pendingConflict.restaurant,
        pendingConflict.quantity,
        pendingConflict.options
      );
      info(`Cart updated with items from ${pendingConflict.restaurant.name}`);
    }
    setPendingConflict(null);
  };

  const removeItem = (cartItemId: string) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.id !== cartItemId);
      if (filtered.length === 0) {
        setRestaurantId(null);
        setRestaurantInfo(null);
        setCoupon(null);
      }
      return filtered;
    });
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(cartItemId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === cartItemId) {
          return {
            ...i,
            quantity: newQuantity,
            totalPrice: newQuantity * i.unitPrice,
          };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setRestaurantInfo(null);
    setCoupon(null);
  };

  const applyCoupon = (newCoupon: Coupon) => {
    if (subtotal < newCoupon.minOrderValue) {
      toast(`Minimum order amount of ₹${newCoupon.minOrderValue} required for this coupon`, 'error');
      return;
    }
    setCoupon(newCoupon);
    success(`Coupon "${newCoupon.code}" applied successfully!`);
  };

  const removeCoupon = () => {
    setCoupon(null);
    info('Coupon removed');
  };

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.totalPrice, 0), [items]);

  // Delivery fee: ₹40 standard, free if subtotal > ₹499
  const deliveryFee = useMemo(() => {
    if (items.length === 0) return 0;
    if (subtotal >= 499) return 0;
    return restaurantInfo?.deliveryFee ?? 40;
  }, [items.length, subtotal, restaurantInfo]);

  // Restaurant packaging and handling fee
  const packagingFee = items.length > 0 ? 20 : 0;

  // 5% GST on food subtotal
  const taxAmount = useMemo(() => Math.round(subtotal * 0.05), [subtotal]);

  // Coupon discount calculation
  const discountAmount = useMemo(() => {
    if (!coupon || items.length === 0) return 0;
    if (subtotal < coupon.minOrderValue) return 0;

    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount) {
        discount = Math.min(discount, coupon.maxDiscountAmount);
      }
    } else {
      discount = coupon.discountValue;
    }
    return Math.min(Math.round(discount), subtotal);
  }, [coupon, subtotal, items.length]);

  const totalAmount = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(0, subtotal + deliveryFee + packagingFee + taxAmount - discountAmount);
  }, [items.length, subtotal, deliveryFee, packagingFee, taxAmount, discountAmount]);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurantInfo,
        coupon,
        itemCount,
        subtotal,
        deliveryFee,
        packagingFee,
        taxAmount,
        discountAmount,
        totalAmount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        pendingRestaurantConflict: pendingConflict,
        resolveConflict,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
