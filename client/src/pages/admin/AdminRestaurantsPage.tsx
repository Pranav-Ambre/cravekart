import React, { useState, useEffect } from 'react';
import { adminService } from '../../services';
import { Restaurant } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Store, Plus, Star, Edit, Power, Eye } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Link } from 'react-router-dom';

export const AdminRestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { success, error } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [cuisineTypes, setCuisineTypes] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [deliveryFee, setDeliveryFee] = useState(40);
  const [minOrderAmount, setMinOrderAmount] = useState(99);
  const [imageUrl, setImageUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadList = async () => {
    try {
      const res = await adminService.getRestaurants();
      if (res.success && res.data) {
        setRestaurants(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    );
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await adminService.createRestaurant({
        name,
        slug,
        description,
        cuisineTypes,
        address,
        city,
        deliveryFee: Number(deliveryFee),
        minOrderAmount: Number(minOrderAmount),
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        bannerUrl:
          bannerUrl ||
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
        isOpen: true,
        isActive: true,
      });

      if (res.success) {
        success('Restaurant created successfully!');
        setIsModalOpen(false);
        // Reset form
        setName('');
        setSlug('');
        setDescription('');
        setCuisineTypes('');
        setAddress('');
        setImageUrl('');
        setBannerUrl('');
        loadList();
      }
    } catch (err: any) {
      error(err.message || 'Failed to create restaurant');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (restaurant: Restaurant) => {
    try {
      const res = await adminService.updateRestaurant(restaurant.id, {
        isActive: !restaurant.isActive,
      });
      if (res.success) {
        success(
          `Restaurant ${!restaurant.isActive ? 'activated' : 'deactivated'} successfully`
        );
        loadList();
      }
    } catch (err: any) {
      error(err.message || 'Failed to update restaurant status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-primary tracking-tight">
            Restaurant Catalog
          </h1>
          <p className="text-xs text-dark-secondary mt-1">
            Manage partner food establishments, opening status, and delivery configurations.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Restaurant
        </Button>
      </div>

      {/* Restaurant List Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-dark-secondary font-bold uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Cuisine</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Delivery Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-dark-muted">
                    Loading restaurant catalog...
                  </td>
                </tr>
              ) : (
                restaurants.map((r: any) => (
                  <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.imageUrl}
                          alt={r.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-bold text-dark-primary">{r.name}</p>
                          <p className="text-[11px] text-dark-muted">{r.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[150px] truncate">{r.cuisineTypes}</td>
                    <td className="py-3 px-4 max-w-[150px] truncate">{r.address}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        ★ {r.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">₹{r.deliveryFee}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          r.isActive ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
                        }`}
                      >
                        {r.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/restaurants/${r.slug || r.id}`}
                          target="_blank"
                          className="p-1.5 text-dark-secondary hover:text-primary-600 rounded-lg hover:bg-gray-100"
                          title="View on site"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleActive(r)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            r.isActive
                              ? 'text-danger hover:bg-red-50'
                              : 'text-success hover:bg-green-50'
                          }`}
                          title={r.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Restaurant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Partner Restaurant"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRestaurant} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Restaurant Name"
              required
              placeholder="e.g. Spice Symphony"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            <Input
              label="Slug"
              required
              placeholder="e.g. spice-symphony"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>

          <Input
            label="Description"
            required
            placeholder="A short appetizing tagline about specialties..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Input
            label="Cuisine Types (Comma-separated)"
            required
            placeholder="North Indian, Biryani, Mughlai"
            value={cuisineTypes}
            onChange={(e) => setCuisineTypes(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Street Address"
              required
              placeholder="45 100ft Road, Indiranagar"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Input
              label="City"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Delivery Fee (₹)"
              type="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(Number(e.target.value))}
            />
            <Input
              label="Minimum Order (₹)"
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(Number(e.target.value))}
            />
          </div>

          <Input
            label="Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSaving}>
              Create Restaurant
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
