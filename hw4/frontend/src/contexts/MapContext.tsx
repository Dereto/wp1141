import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface MapContextType {
  map: any | null;
  setMap: (map: any | null) => void;
  selectedLocation: { lat: number; lng: number; address: string } | null;
  setSelectedLocation: (location: { lat: number; lng: number; address: string } | null) => void;
  isMapLoaded: boolean;
  setIsMapLoaded: (loaded: boolean) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export const useMap = () => {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
};

interface MapProviderProps {
  children: ReactNode;
}

export const MapProvider: React.FC<MapProviderProps> = ({ children }) => {
  const [map, setMap] = useState<any | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const value = {
    map,
    setMap,
    selectedLocation,
    setSelectedLocation,
    isMapLoaded,
    setIsMapLoaded
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};
