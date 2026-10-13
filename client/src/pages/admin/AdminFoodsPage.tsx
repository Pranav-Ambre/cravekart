import React, { useState, useEffect } from 'react';
import { adminService, restaurantService } from '../../services';
import { FoodItem, Restaurant } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Plus, Power, Eye } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { VegBadge } from '../../components/food/VegBadge';

export const AdminFoodsPage: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useToast();

  // Create Food state
  const [foodName, setFoodName] = useState('');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodPrice, setFoodPrice] = useState(199);
  const [foodIsVeg, setFoodIsVeg] = useState(true);
  const [foodImageUrl, setFoodImageUrl] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadFoods = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getFoods(selectedRestaurantId || undefined);
      if (res.success && res.data) {
        setFoods(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    adminService.getRestaurants().then((res) => {
      if (res.success && res.data) {
        setRestaurants(res.data);
        if (res.data[0]) {
          setRestaurantId(res.data[0].id);
        }
      }
    });
  }, []);

  useEffect(() => {
    loadFoods();
  }, [selectedRestaurantId]);

  const handleToggleAvailable = async (food: FoodItem) => {
    try {
      const res = await adminService.updateFood(food.id, {
        isAvailable: !food.isAvailable,
      });
      if (res.success) {
        success(`"${food.name}" availability updated`);
        loadFoods();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update item');
    }
  };

  const handleCreateFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !restaurantId) return;

    setIsSaving(true);
    try {
      // Find category from restaurant or default
      const res = await adminService.createFood({
        restaurantId,
        categoryId: categoryId || 'cat_default', // server will link or validate
        name: foodName,
        description: foodDesc || 'Freshly prepared specialty dish.',
        price: Number(foodPrice),
        isVeg: foodIsVeg,
        imageUrl:
          foodImageUrl ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        isAvailable: true,
      });

      if (res.success) {
        success('Food item added to menu!');
        setIsModalOpen(false);
        setFoodName('');
        setFoodDesc('');
        loadFoods();
      }
    } catch (err: any) {
      error(err.message || 'Failed to add food item');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-primary tracking-tight">
            Menu Item Catalog
          </h1>
          <p className="text-xs text-dark-secondary mt-1">
            Configure dishes, prices, vegetarian flags, and daily stock availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="bg-white border border-border rounded-xl px-3 py-2 text-xs font-bold text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Restaurants</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Food Item
          </Button>
        </div>
      </div>

      {/* Foods Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-dark-secondary font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Diet</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-dark-muted">
                    Loading dishes...
                  </td>
                </tr>
              ) : (
                foods.map((food: any) => (
                  <tr key={food.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={food.imageUrl}
                          alt={food.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-dark-primary">{food.name}</p>
                          <p className="text-[11px] text-dark-muted line-clamp-1 max-w-[200px]">
                            {food.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{food.restaurant?.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <VegBadge isVeg={food.isVeg} />
                        <span>{food.isVeg ? 'Veg' : 'Non-Veg'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-dark-primary">₹{food.price}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                        ★ {food.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          food.isAvailable ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
                        }`}
                      >
                        {food.isAvailable ? 'Available' : 'Sold Out'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleAvailable(food)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          food.isAvailable
                            ? 'text-danger hover:bg-red-50'
                            : 'text-success hover:bg-green-50'
                        }`}
                        title={food.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Food Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Food Item to Menu"
        maxWidth="md"
      >
        <form onSubmit={handleCreateFood} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-primary mb-1">
              Select Restaurant
            </label>
            <select
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full bg-white border border-border rounded-xl p-2.5 text-xs font-semibold text-dark-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              required
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Dish Name"
            required
            placeholder="e.g. Paneer Butter Masala"
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
          />

          <Input
            label="Description"
            placeholder="Tender paneer cubes simmered in rich tomato gravy..."
            value={foodDesc}
            onChange={(e) => setFoodDesc(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3 items-center">
            <Input
              label="Price (₹)"
              type="number"
              required
              value={foodPrice}
              onChange={(e) => setFoodPrice(Number(e.target.value))}
            />

            <div className="pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={foodIsVeg}
                  onChange={(e) => setFoodIsVeg(e.target.checked)}
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-xs font-bold text-dark-primary">Vegetarian Dish</span>
              </label>
            </div>
          </div>

          <Input
            label="Image URL"
            placeholder="https://images.unsplash.com/..."
            value={foodImageUrl}
            onChange={(e) => setFoodImageUrl(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSaving}>
              Add Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
