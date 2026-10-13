import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for CraveKart...');

  // Clean existing tables (in reverse relation order)
  await prisma.auditLog.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.couponRedemption.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.foodCustomization.deleteMany();
  await prisma.foodItem.deleteMany();
  await prisma.restaurantOperatingHour.deleteMany();
  await prisma.foodCategory.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing records.');

  // 1. Create Users
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const userPasswordHash = await bcrypt.hash('Password123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin CraveKart',
      email: 'admin@cravekart.com',
      passwordHash: adminPasswordHash,
      phone: '+91 9876543210',
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
    },
  });

  const demoCustomer = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      passwordHash: userPasswordHash,
      phone: '+91 9876543211',
      role: 'CUSTOMER',
      isActive: true,
      isEmailVerified: true,
    },
  });

  const ownerUser = await prisma.user.create({
    data: {
      name: 'Priya Nair',
      email: 'owner@spicetrail.com',
      passwordHash: userPasswordHash,
      phone: '+91 9876543212',
      role: 'RESTAURANT_OWNER',
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log('👤 Users seeded (Admin, Demo Customer, Restaurant Owner).');

  // 2. Saved Addresses for Demo Customer
  const homeAddress = await prisma.address.create({
    data: {
      userId: demoCustomer.id,
      label: 'Home',
      street: '#42, 3rd Cross, 7th Main, Koramangala 4th Block',
      landmark: 'Near Sony World Junction',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560034',
      isDefault: true,
    },
  });

  const workAddress = await prisma.address.create({
    data: {
      userId: demoCustomer.id,
      label: 'Work',
      street: 'Tech Park Towers, 4th Floor, 100ft Road, Indiranagar',
      landmark: 'Opposite Metro Station',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      isDefault: false,
    },
  });

  // 3. Food Categories
  const categoriesData = [
    {
      name: 'Biryani & Rice',
      slug: 'biryani-rice',
      description: 'Aromatic basmati rice cooked with authentic spices and rich marinades',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      sortOrder: 1,
    },
    {
      name: 'Pizzas & Italian',
      slug: 'pizzas-italian',
      description: 'Hand-tossed crusts with imported mozzarella and signature sauces',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
      sortOrder: 2,
    },
    {
      name: 'Burgers & Fast Food',
      slug: 'burgers-fast-food',
      description: 'Juicy patties, toasted brioche buns, and crispy golden fries',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      sortOrder: 3,
    },
    {
      name: 'North Indian',
      slug: 'north-indian',
      description: 'Rich creamy gravies, tandoori delicacies, and warm butter naans',
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
      sortOrder: 4,
    },
    {
      name: 'South Indian',
      slug: 'south-indian',
      description: 'Crisp ghee dosas, fluffy idlis, and filter kaapi brews',
      imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
      sortOrder: 5,
    },
    {
      name: 'Chinese & Asian',
      slug: 'chinese-asian',
      description: 'Wok-tossed hakka noodles, dim sums, and spicy manchurian',
      imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80',
      sortOrder: 6,
    },
    {
      name: 'Desserts & Bakes',
      slug: 'desserts-bakes',
      description: 'Decadent chocolate pastries, gulab jamuns, and gourmet gelatos',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
      sortOrder: 7,
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      description: 'Artisanal shakes, cold-pressed juices, and refreshing coolers',
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
      sortOrder: 8,
    },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.slug] = await prisma.foodCategory.create({ data: cat });
  }

  console.log('🏷️ Categories seeded.');

  // 4. Restaurants & Dishes
  // Restaurant 1: The Royal Biryani House
  const rest1 = await prisma.restaurant.create({
    data: {
      name: 'The Royal Biryani House',
      slug: 'the-royal-biryani-house',
      description: 'Authentic Hyderabadi & Lucknowi Dum Biryanis slow-cooked in copper handis.',
      cuisineTypes: 'Biryani, Mughlai, North Indian, Kebabs',
      address: '88, 80ft Road, Koramangala 4th Block',
      city: 'Bengaluru',
      rating: 4.8,
      reviewCount: 1420,
      deliveryTimeMin: 30,
      deliveryTimeMax: 40,
      deliveryFee: 40,
      minOrderAmount: 149,
      priceRange: '₹₹',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=1200&auto=format&fit=crop&q=80',
      isOpen: true,
      isFeatured: true,
      isActive: true,
    },
  });

  // Items for Rest 1
  const dish1 = await prisma.foodItem.create({
    data: {
      restaurantId: rest1.id,
      categoryId: categories['biryani-rice'].id,
      name: 'Royal Chicken Dum Biryani',
      description: 'Tender chicken marinated in secret royal spices, layered with aged basmati rice and slow-cooked in dum sealed pot. Served with Mirchi Ka Salan and Raita.',
      price: 349,
      isVeg: false,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 20,
      rating: 4.9,
      reviewCount: 890,
    },
  });

  await prisma.foodCustomization.create({
    data: {
      foodItemId: dish1.id,
      title: 'Portion Size',
      type: 'SINGLE',
      isRequired: true,
      minSelection: 1,
      maxSelection: 1,
      optionsJson: JSON.stringify([
        { id: 'reg', name: 'Regular (Serves 1)', price: 0, isDefault: true },
        { id: 'large', name: 'Large (Serves 2-3)', price: 180 },
      ]),
    },
  });

  await prisma.foodCustomization.create({
    data: {
      foodItemId: dish1.id,
      title: 'Add Extra Accompaniments',
      type: 'MULTIPLE',
      isRequired: false,
      minSelection: 0,
      maxSelection: 3,
      optionsJson: JSON.stringify([
        { id: 'extra_egg', name: 'Boiled Egg (2 pcs)', price: 40 },
        { id: 'extra_raita', name: 'Burani Garlic Raita', price: 45 },
        { id: 'salan', name: 'Extra Mirchi Ka Salan', price: 35 },
      ]),
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest1.id,
      categoryId: categories['biryani-rice'].id,
      name: 'Subz Paneer Dum Biryani',
      description: 'Fresh malai paneer cubes and garden vegetables spiced with saffron, brown onions, and fragrant mint.',
      price: 299,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e9a?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 18,
      rating: 4.7,
      reviewCount: 420,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest1.id,
      categoryId: categories['north-indian'].id,
      name: 'Murgh Malai Tikka (6 pcs)',
      description: 'Boneless chicken chunks marinated in cream, cheese, cardamom, and roasted in clay tandoor oven.',
      price: 320,
      isVeg: false,
      imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: false,
      preparationTimeMin: 15,
      rating: 4.8,
      reviewCount: 310,
    },
  });

  // Restaurant 2: Crust & Flame Pizzeria
  const rest2 = await prisma.restaurant.create({
    data: {
      name: 'Crust & Flame Pizzeria',
      slug: 'crust-and-flame-pizzeria',
      description: 'Artisan Neapolitan pizzas with 48-hour fermented sourdough crust and San Marzano tomato sauce.',
      cuisineTypes: 'Italian, Pizza, Pasta, Salads',
      address: '24, 12th Main Road, Indiranagar',
      city: 'Bengaluru',
      rating: 4.7,
      reviewCount: 980,
      deliveryTimeMin: 25,
      deliveryTimeMax: 35,
      deliveryFee: 40,
      minOrderAmount: 199,
      priceRange: '₹₹',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1200&auto=format&fit=crop&q=80',
      isOpen: true,
      isFeatured: true,
      isActive: true,
    },
  });

  const pizza1 = await prisma.foodItem.create({
    data: {
      restaurantId: rest2.id,
      categoryId: categories['pizzas-italian'].id,
      name: 'Classic Margherita con Bufala',
      description: 'San Marzano tomato base, fresh buffalo mozzarella, fragrant basil leaves, and cold-pressed extra virgin olive oil.',
      price: 389,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 20,
      rating: 4.9,
      reviewCount: 650,
    },
  });

  await prisma.foodCustomization.create({
    data: {
      foodItemId: pizza1.id,
      title: 'Crust Preference',
      type: 'SINGLE',
      isRequired: true,
      minSelection: 1,
      maxSelection: 1,
      optionsJson: JSON.stringify([
        { id: 'thin', name: 'Neapolitan Thin Crust (11 inch)', price: 0, isDefault: true },
        { id: 'cheese_burst', name: 'Cheese Stuffed Crust', price: 95 },
      ]),
    },
  });

  await prisma.foodCustomization.create({
    data: {
      foodItemId: pizza1.id,
      title: 'Extra Toppings',
      type: 'MULTIPLE',
      isRequired: false,
      minSelection: 0,
      maxSelection: 4,
      optionsJson: JSON.stringify([
        { id: 'ex_mozz', name: 'Extra Buffalo Mozzarella', price: 75 },
        { id: 'jalapeno', name: 'Spicy Jalapenos', price: 40 },
        { id: 'olives', name: 'Kalamata Olives', price: 50 },
        { id: 'truffle', name: 'Truffle Oil Drizzle', price: 65 },
      ]),
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest2.id,
      categoryId: categories['pizzas-italian'].id,
      name: 'Smoked Pepperoni & Hot Honey',
      description: 'Crispy smoked pork pepperoni, fiery hot honey drizzle, fresh mozzarella, and oregano flakes.',
      price: 529,
      isVeg: false,
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 22,
      rating: 4.8,
      reviewCount: 480,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest2.id,
      categoryId: categories['pizzas-italian'].id,
      name: 'Creamy Truffle Mushroom Fettuccine',
      description: 'Fresh handmade fettuccine pasta in rich parmigiano reggiano & black truffle cream sauce with wild porcini mushrooms.',
      price: 449,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281290?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: false,
      preparationTimeMin: 18,
      rating: 4.7,
      reviewCount: 220,
    },
  });

  // Restaurant 3: Urban Burger Co.
  const rest3 = await prisma.restaurant.create({
    data: {
      name: 'Urban Burger Co.',
      slug: 'urban-burger-co',
      description: 'Handcrafted gourmet smash burgers, loaded waffle fries, and thick American milkshakes.',
      cuisineTypes: 'Burgers, American, Fast Food, Shakes',
      address: '15, 5th Block, Koramangala',
      city: 'Bengaluru',
      rating: 4.6,
      reviewCount: 810,
      deliveryTimeMin: 20,
      deliveryTimeMax: 30,
      deliveryFee: 35,
      minOrderAmount: 149,
      priceRange: '₹',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&auto=format&fit=crop&q=80',
      isOpen: true,
      isFeatured: true,
      isActive: true,
    },
  });

  const burger1 = await prisma.foodItem.create({
    data: {
      restaurantId: rest3.id,
      categoryId: categories['burgers-fast-food'].id,
      name: 'Double Trouble Smash Burger',
      description: 'Two smashed tender beef/chicken patties, double melted cheddar, caramelized onions, pickles, and signature house sauce on a butter-toasted brioche bun.',
      price: 289,
      isVeg: false,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 15,
      rating: 4.8,
      reviewCount: 520,
    },
  });

  await prisma.foodCustomization.create({
    data: {
      foodItemId: burger1.id,
      title: 'Make it a Combo',
      type: 'SINGLE',
      isRequired: false,
      minSelection: 0,
      maxSelection: 1,
      optionsJson: JSON.stringify([
        { id: 'fries_coke', name: 'Add Peri Peri Fries + Coke', price: 99 },
        { id: 'loaded_fries', name: 'Add Cheesy Bacon Fries', price: 139 },
      ]),
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest3.id,
      categoryId: categories['burgers-fast-food'].id,
      name: 'Crispy Truffle Shroom Burger',
      description: 'Crispy panko-crusted portobello mushroom stuffed with molten cheese, arugula, and truffle mayo.',
      price: 259,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 15,
      rating: 4.7,
      reviewCount: 390,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest3.id,
      categoryId: categories['beverages'].id,
      name: 'Belgian Dark Chocolate Thickshake',
      description: 'Pure Belgian dark chocolate blended with whole dairy ice cream, topped with chocolate shavings.',
      price: 189,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: false,
      preparationTimeMin: 10,
      rating: 4.8,
      reviewCount: 290,
    },
  });

  // Restaurant 4: Madras Tiffin Room
  const rest4 = await prisma.restaurant.create({
    data: {
      name: 'Madras Tiffin Room',
      slug: 'madras-tiffin-room',
      description: 'Authentic Chennai & Udupi breakfasts: crispy ghee roast dosas, steamed idlis, and degree filter coffee.',
      cuisineTypes: 'South Indian, Dosa, Breakfast, Filter Coffee',
      address: '102, CMH Road, Indiranagar',
      city: 'Bengaluru',
      rating: 4.9,
      reviewCount: 2100,
      deliveryTimeMin: 15,
      deliveryTimeMax: 25,
      deliveryFee: 30,
      minOrderAmount: 99,
      priceRange: '₹',
      imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=1200&auto=format&fit=crop&q=80',
      isOpen: true,
      isFeatured: true,
      isActive: true,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest4.id,
      categoryId: categories['south-indian'].id,
      name: 'Neyy Roast Ghee Masala Dosa',
      description: 'Crispy golden crepe roasted in pure A2 cow ghee, stuffed with spiced potato filling. Served with 3 chutneys & drumstick sambar.',
      price: 145,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 12,
      rating: 4.9,
      reviewCount: 1240,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest4.id,
      categoryId: categories['south-indian'].id,
      name: 'Button Ghee Idlis in Sambar (14 pcs)',
      description: 'Bite-sized melt-in-mouth steamed idlis immersed in hot, piping home-style sambar with a spoonful of pure ghee.',
      price: 120,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 10,
      rating: 4.8,
      reviewCount: 860,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest4.id,
      categoryId: categories['beverages'].id,
      name: 'Kumbakonam Degree Filter Kaapi',
      description: 'Authentic strong filter coffee brewed using 80-20 chicory blend and frothy fresh whole milk.',
      price: 65,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: false,
      preparationTimeMin: 8,
      rating: 5.0,
      reviewCount: 950,
    },
  });

  // Restaurant 5: Spice Route Bistro (North Indian)
  const rest5 = await prisma.restaurant.create({
    data: {
      name: 'Spice Route Bistro',
      slug: 'spice-route-bistro',
      description: 'Rich royal North Indian delicacies, tender kebabs, slow-simmered gravies, and tandoor breads.',
      cuisineTypes: 'North Indian, Mughlai, Tandoor, Curries',
      address: '77, Outer Ring Road, Bellandur',
      city: 'Bengaluru',
      rating: 4.6,
      reviewCount: 670,
      deliveryTimeMin: 25,
      deliveryTimeMax: 35,
      deliveryFee: 40,
      minOrderAmount: 199,
      priceRange: '₹₹',
      imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
      isOpen: true,
      isFeatured: false,
      isActive: true,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest5.id,
      categoryId: categories['north-indian'].id,
      name: 'Old Delhi Butter Chicken',
      description: 'Charcoal-grilled tandoori chicken cooked in velvety, rich tomato, cashew cream gravy with fenugreek leaves.',
      price: 360,
      isVeg: false,
      imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 20,
      rating: 4.8,
      reviewCount: 420,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest5.id,
      categoryId: categories['north-indian'].id,
      name: 'Dal Makhani Slow-Simmered (24 Hrs)',
      description: 'Black lentils slow cooked overnight on charcoal with fresh cream, butter, and mild aromatic spices.',
      price: 270,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 15,
      rating: 4.9,
      reviewCount: 510,
    },
  });

  // Restaurant 6: Wok & Dragon Asian Kitchen
  const rest6 = await prisma.restaurant.create({
    data: {
      name: 'Wok & Dragon Asian Kitchen',
      slug: 'wok-and-dragon-asian-kitchen',
      description: 'Sizzling Asian delicacies: dim sums, spicy hakka noodles, kung pao chicken, and Thai curries.',
      cuisineTypes: 'Chinese, Asian, Thai, Dim Sum',
      address: '45, 1st Cross, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      rating: 4.6,
      reviewCount: 540,
      deliveryTimeMin: 25,
      deliveryTimeMax: 35,
      deliveryFee: 40,
      minOrderAmount: 149,
      priceRange: '₹₹',
      imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=800&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=1200&auto=format&fit=crop&q=80',
      isOpen: true,
      isFeatured: false,
      isActive: true,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest6.id,
      categoryId: categories['chinese-asian'].id,
      name: 'Crispy Chilli Garlic Hakka Noodles',
      description: 'Wok-tossed noodles with shredded scallions, bell peppers, crunchy cabbage, and spicy garlic oil.',
      price: 220,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 15,
      rating: 4.7,
      reviewCount: 310,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest6.id,
      categoryId: categories['chinese-asian'].id,
      name: 'Crystal Dim Sum Platter (6 pcs)',
      description: 'Steamed translucent dumplings filled with water chestnuts, edamame, and mushrooms. Served with chilli oil dip.',
      price: 280,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: false,
      preparationTimeMin: 18,
      rating: 4.6,
      reviewCount: 190,
    },
  });

  // Restaurant 7: Sweet Escapes Bakery
  const rest7 = await prisma.restaurant.create({
    data: {
      name: 'Sweet Escapes Bakery & Cafe',
      slug: 'sweet-escapes-bakery',
      description: 'Artisanal Parisian desserts, chocolate truffles, molten lava cakes, and warm cookies.',
      cuisineTypes: 'Desserts, Bakery, Cakes, Ice Cream',
      address: '19, Church Street',
      city: 'Bengaluru',
      rating: 4.8,
      reviewCount: 920,
      deliveryTimeMin: 15,
      deliveryTimeMax: 25,
      deliveryFee: 35,
      minOrderAmount: 99,
      priceRange: '₹₹',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
      isOpen: true,
      isFeatured: false,
      isActive: true,
    },
  });

  await prisma.foodItem.create({
    data: {
      restaurantId: rest7.id,
      categoryId: categories['desserts-bakes'].id,
      name: 'Molten Belgian Choco Lava Cake',
      description: 'Warm dark chocolate sponge cake with an irresistible flowing chocolate fudge center.',
      price: 159,
      isVeg: true,
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80',
      isAvailable: true,
      isRecommended: true,
      preparationTimeMin: 12,
      rating: 4.9,
      reviewCount: 680,
    },
  });

  // Operating Hours for Restaurants
  const allRestaurants = [rest1, rest2, rest3, rest4, rest5, rest6, rest7];
  for (const r of allRestaurants) {
    for (let day = 0; day <= 6; day++) {
      await prisma.restaurantOperatingHour.create({
        data: {
          restaurantId: r.id,
          dayOfWeek: day,
          openTime: '10:00',
          closeTime: '23:30',
          isClosed: false,
        },
      });
    }
  }

  console.log('🍽️ Restaurants and food menu items seeded.');

  // 5. Coupons
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3);

  const couponsData = [
    {
      code: 'CRAVE50',
      description: '50% OFF up to ₹100 on orders above ₹199',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      minOrderValue: 199,
      maxDiscountAmount: 100,
      usageLimit: 1000,
      validUntil: futureDate,
      isActive: true,
    },
    {
      code: 'WELCOME100',
      description: 'Flat ₹100 OFF on your meal order above ₹399',
      discountType: 'FIXED',
      discountValue: 100,
      minOrderValue: 399,
      maxDiscountAmount: null,
      usageLimit: 500,
      validUntil: futureDate,
      isActive: true,
    },
    {
      code: 'FREEDEL',
      description: 'Free delivery (₹40 OFF) on orders above ₹249',
      discountType: 'FIXED',
      discountValue: 40,
      minOrderValue: 249,
      maxDiscountAmount: null,
      usageLimit: 2000,
      validUntil: futureDate,
      isActive: true,
    },
    {
      code: 'TASTY20',
      description: '20% OFF up to ₹150 on orders above ₹299',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderValue: 299,
      maxDiscountAmount: 150,
      usageLimit: 1500,
      validUntil: futureDate,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.create({ data: c });
  }

  console.log('🎟️ Promotional coupons seeded.');

  // 6. Realistic Demo Orders for Demo Customer (Rahul Sharma)
  // Order 1: Ongoing active order (PREPARING)
  const activeOrderNumber = `CK-20261013-1001`;
  const order1 = await prisma.order.create({
    data: {
      orderNumber: activeOrderNumber,
      userId: demoCustomer.id,
      restaurantId: rest1.id,
      status: 'PREPARING',
      deliveryAddressJson: JSON.stringify(homeAddress),
      deliveryInstructions: 'Ring the doorbell and leave near shoe rack.',
      subtotal: 648,
      deliveryFee: 0, // Free delivery > 499
      packagingFee: 20,
      taxAmount: 32,
      discountAmount: 100, // CRAVE50 applied
      totalAmount: 600,
      paymentStatus: 'PAID',
      paymentMethod: 'RAZORPAY',
      estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000),
      items: {
        create: [
          {
            foodItemId: dish1.id,
            foodNameSnapshot: 'Royal Chicken Dum Biryani',
            foodPriceSnapshot: 349,
            quantity: 1,
            selectedOptionsJson: JSON.stringify([{ optionName: 'Regular (Serves 1)', price: 0 }]),
            itemTotal: 349,
          },
          {
            foodItemId: dish1.id,
            foodNameSnapshot: 'Subz Paneer Dum Biryani',
            foodPriceSnapshot: 299,
            quantity: 1,
            selectedOptionsJson: null,
            itemTotal: 299,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: 'CONFIRMED',
            note: 'Order confirmed and payment verified via Razorpay.',
            changedByUserId: demoCustomer.id,
            createdAt: new Date(Date.now() - 10 * 60 * 1000),
          },
          {
            status: 'PREPARING',
            note: 'Master Chef has begun preparing your fresh handi dum biryani.',
            changedByUserId: adminUser.id,
            createdAt: new Date(Date.now() - 4 * 60 * 1000),
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order1.id,
      provider: 'RAZORPAY',
      razorpayOrderId: 'order_test_demo_active_123',
      razorpayPaymentId: 'pay_test_demo_active_456',
      razorpaySignature: 'sig_test_pay_test_demo_active_456',
      amount: 600,
      currency: 'INR',
      status: 'SUCCESS',
    },
  });

  // Order 2: Past delivered order (DELIVERED)
  const pastOrderNumber = `CK-20261011-8842`;
  const order2 = await prisma.order.create({
    data: {
      orderNumber: pastOrderNumber,
      userId: demoCustomer.id,
      restaurantId: rest2.id,
      status: 'DELIVERED',
      deliveryAddressJson: JSON.stringify(homeAddress),
      deliveryInstructions: 'Call upon arrival',
      subtotal: 389,
      deliveryFee: 40,
      packagingFee: 20,
      taxAmount: 19,
      discountAmount: 0,
      totalAmount: 468,
      paymentStatus: 'PAID',
      paymentMethod: 'COD',
      estimatedDeliveryTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
      items: {
        create: [
          {
            foodItemId: pizza1.id,
            foodNameSnapshot: 'Classic Margherita con Bufala',
            foodPriceSnapshot: 389,
            quantity: 1,
            selectedOptionsJson: JSON.stringify([{ optionName: 'Neapolitan Thin Crust (11 inch)', price: 0 }]),
            itemTotal: 389,
          },
        ],
      },
      statusHistory: {
        create: [
          {
            status: 'CONFIRMED',
            note: 'Order confirmed with Cash on Delivery.',
            changedByUserId: demoCustomer.id,
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          },
          {
            status: 'PREPARING',
            note: 'Pizza is in the woodfire oven.',
            changedByUserId: adminUser.id,
            createdAt: new Date(Date.now() - (48 * 60 * 60 - 10 * 60) * 1000),
          },
          {
            status: 'OUT_FOR_DELIVERY',
            note: 'Rider is on the way to your delivery location.',
            changedByUserId: adminUser.id,
            createdAt: new Date(Date.now() - (48 * 60 * 60 - 20 * 60) * 1000),
          },
          {
            status: 'DELIVERED',
            note: 'Order delivered safely. Cash received ₹468.',
            changedByUserId: adminUser.id,
            createdAt: new Date(Date.now() - (48 * 60 * 60 - 35 * 60) * 1000),
          },
        ],
      },
    },
  });

  await prisma.payment.create({
    data: {
      orderId: order2.id,
      provider: 'CASH_ON_DELIVERY',
      amount: 468,
      currency: 'INR',
      status: 'SUCCESS',
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    },
  });

  // 7. Favorite Restaurant for Demo Customer
  await prisma.favorite.create({
    data: {
      userId: demoCustomer.id,
      restaurantId: rest1.id,
    },
  });

  // 8. Reviews
  await prisma.review.create({
    data: {
      userId: demoCustomer.id,
      restaurantId: rest1.id,
      rating: 5,
      comment: 'Absolutely heavenly Dum Biryani! The aroma, tender chicken, and perfectly balanced spices make it the best in town.',
    },
  });

  // 9. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'SYSTEM_INITIALIZED',
      entityType: 'System',
      entityId: 'cravekart-seed',
      detailsJson: JSON.stringify({ message: 'Seed data successfully loaded' }),
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('\n=============================================');
  console.log('🔑 DEMO CREDENTIALS:');
  console.log('  Customer: rahul@example.com / Password123!');
  console.log('  Admin:    admin@cravekart.com / AdminPassword123!');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
