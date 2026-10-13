import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const ConflictModal: React.FC = () => {
  const { pendingRestaurantConflict, resolveConflict, restaurantInfo } = useCart();

  if (!pendingRestaurantConflict) return null;

  return (
    <Modal
      isOpen={!!pendingRestaurantConflict}
      onClose={() => resolveConflict(false)}
      title="Replace cart items?"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 bg-amber-50 p-3.5 rounded-xl border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            Your cart contains items from <strong>{restaurantInfo?.name || 'another restaurant'}</strong>.
            CraveKart does not support multi-restaurant orders in a single delivery.
          </p>
        </div>

        <p className="text-sm text-dark-secondary">
          Would you like to discard your current cart and start a fresh order from{' '}
          <strong className="text-dark-primary">{pendingRestaurantConflict.restaurant.name}</strong>?
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={() => resolveConflict(false)}
            size="sm"
          >
            Keep Existing Cart
          </Button>
          <Button
            variant="primary"
            onClick={() => resolveConflict(true)}
            size="sm"
          >
            Discard & Add
          </Button>
        </div>
      </div>
    </Modal>
  );
};
