import React, { useState, useEffect } from 'react';
import { userService } from '../../services';
import { Heart } from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { RestaurantCard } from '../../components/restaurant/RestaurantCard';
import { useNavigate } from 'react-router-dom';

export const CustomerFavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFavs() {
      try {
        const res = await userService.getFavorites();
        if (res.success && res.data) {
          setFavorites(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadFavs();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((n) => (
          <div key={n} className="h-44 bg-gray-100 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  const favoriteRestaurants = favorites.filter((f) => f.restaurant);

  if (favoriteRestaurants.length === 0) {
    return (
      <EmptyState
        icon={<Heart className="w-8 h-8" />}
        title="No Favorites Yet"
        description="Mark your favorite restaurants and dishes to easily access them anytime."
        actionLabel="Browse Restaurants"
        onAction={() => navigate('/restaurants')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-dark-primary">Favorite Restaurants</h2>
        <p className="text-xs text-dark-secondary mt-0.5">
          Your bookmarked kitchens and beloved dining spots.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {favoriteRestaurants.map((fav) => (
          <RestaurantCard key={fav.id} restaurant={fav.restaurant} />
        ))}
      </div>
    </div>
  );
};
