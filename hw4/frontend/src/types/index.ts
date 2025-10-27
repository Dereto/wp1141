export interface User {
  id: number;
  email: string;
  username: string;
}

export interface CommuteRoute {
  id: number;
  name: string;
  description?: string;
  start_address: string;
  end_address: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  transport_mode: string;
  duration_seconds: number;
  distance_meters: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface PlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: { lat: number; lng: number };
  };
  rating?: number;
  types: string[];
}

export interface DirectionsResult {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  steps: Array<{
    instruction: string;
    distance: { text: string; value: number };
    duration: { text: string; value: number };
  }>;
}

export interface CreateRouteData {
  name: string;
  description?: string;
  startAddress: string;
  endAddress: string;
  transportMode?: string;
}

export interface UpdateRouteData {
  name?: string;
  description?: string;
  startAddress?: string;
  endAddress?: string;
  transportMode?: string;
  isFavorite?: boolean;
}
