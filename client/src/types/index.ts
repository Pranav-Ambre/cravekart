export type Role = 'CUSTOMER' | 'ADMIN' | 'RESTAURANT_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string; // 'Home' | 'Work' | 'Other'
  street: string;
  landmark?: string | null;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  cuisineTypes: string; // Comma-separated
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  minOrderAmount: number;
  priceRange: string;
  imageUrl: string;
  bannerUrl: string;
  isOpen: boolean;
  isFeatured: boolean;
  isActive: boolean;
  categories?: FoodCategory[];
  foodCategories?: FoodCategory[];
  items?: FoodItem[];
  foodItems?: FoodItem[];
}

export interface FoodCategory {
  id: string;
  restaurantId?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  foodItems?: FoodItem[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface FoodCustomization {
  id: string;
  foodItemId: string;
  title: string;
  type: 'SINGLE' | 'MULTIPLE';
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  optionsJson: string; // parsed to CustomizationOption[]
  options?: CustomizationOption[];
}

export interface FoodItem {
  id: string;
  restaurantId: string;
  restaurant?: Restaurant;
  categoryId: string;
  category?: FoodCategory;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  imageUrl: string;
  isAvailable: boolean;
  isRecommended: boolean;
  preparationTimeMin: number;
  allergens?: string | null;
  rating: number;
  reviewCount: number;
  customizations?: FoodCustomization[];
}

export interface CartItemOption {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart item id (e.g. foodItemId + options hash)
  foodItemId: string;
  restaurantId: string;
  foodItem: FoodItem;
  quantity: number;
  selectedOptions: CartItemOption[];
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'RAZORPAY' | 'COD';

export interface OrderItem {
  id: string;
  orderId: string;
  foodItemId: string;
  foodNameSnapshot: string;
  foodPriceSnapshot: number;
  quantity: number;
  selectedOptionsJson?: string | null;
  itemTotal: number;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  note?: string | null;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  restaurantId: string;
  restaurant: Restaurant;
  status: OrderStatus;
  deliveryAddressJson: string;
  deliveryInstructions?: string | null;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  estimatedDeliveryTime?: string | null;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
