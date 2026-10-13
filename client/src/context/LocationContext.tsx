import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Location {
  area: string;
  city: string;
  pincode: string;
  isPopular?: boolean;
}

export const POPULAR_LOCATIONS: Location[] = [
  { area: 'Koramangala 4th Block', city: 'Bengaluru', pincode: '560034', isPopular: true },
  { area: 'Indiranagar 100ft Rd', city: 'Bengaluru', pincode: '560038', isPopular: true },
  { area: 'HSR Layout Sector 2', city: 'Bengaluru', pincode: '560102', isPopular: true },
  { area: 'Whitefield Main Rd', city: 'Bengaluru', pincode: '560066', isPopular: true },
  { area: 'MG Road / Brigade Rd', city: 'Bengaluru', pincode: '560001', isPopular: true },
  { area: 'Jayanagar 4th Block', city: 'Bengaluru', pincode: '560011', isPopular: true },
];

interface LocationContextType {
  currentLocation: Location;
  setLocation: (loc: Location) => void;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location>(() => {
    const saved = localStorage.getItem('cravekart_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return POPULAR_LOCATIONS[0];
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cravekart_location', JSON.stringify(currentLocation));
  }, [currentLocation]);

  const setLocation = (loc: Location) => {
    setCurrentLocation(loc);
    setIsLocationModalOpen(false);
  };

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        setLocation,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
