import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useLocation, POPULAR_LOCATIONS } from '../../context/LocationContext';
import { MapPin, Search } from 'lucide-react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

export const LocationModal: React.FC = () => {
  const { isLocationModalOpen, closeLocationModal, currentLocation, setLocation } = useLocation();
  const [customArea, setCustomArea] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customArea.trim()) {
      setLocation({
        area: customArea.trim(),
        city: 'Bengaluru',
        pincode: '560001',
      });
      setCustomArea('');
    }
  };

  return (
    <Modal
      isOpen={isLocationModalOpen}
      onClose={closeLocationModal}
      title="Select Delivery Location"
      description="Choose your area to see available restaurants and accurate delivery times."
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Custom area input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <Input
            placeholder="Enter your street or landmark..."
            value={customArea}
            onChange={(e) => setCustomArea(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
          <Button type="submit" size="sm">
            Set
          </Button>
        </form>

        {/* Popular delivery areas */}
        <div>
          <h4 className="text-xs font-bold text-dark-secondary uppercase tracking-wider mb-2.5">
            Popular Delivery Hubs
          </h4>
          <div className="space-y-2">
            {POPULAR_LOCATIONS.map((loc) => {
              const isSelected =
                currentLocation.area === loc.area && currentLocation.city === loc.city;

              return (
                <button
                  key={loc.area}
                  onClick={() => setLocation(loc)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-primary-50 border-primary-500 text-primary-900 font-semibold shadow-sm'
                      : 'bg-white border-border hover:bg-gray-50 text-dark-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-dark-muted'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">{loc.area}</p>
                      <p className="text-xs text-dark-muted mt-0.5">{loc.city} - {loc.pincode}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-xs font-bold text-primary-600">Selected</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
