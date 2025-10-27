import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const commuteService = {
  async getRoutes(): Promise<CommuteRoute[]> {
    try {
      const response = await api.get('/api/commute');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch routes');
    }
  },

  async getRoute(id: number): Promise<CommuteRoute> {
    try {
      const response = await api.get(`/api/commute/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch route');
    }
  },

  async createRoute(data: CreateRouteData): Promise<CommuteRoute> {
    try {
      const response = await api.post('/api/commute', data);
      return response.data.route;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create route');
    }
  },

  async updateRoute(id: number, data: UpdateRouteData): Promise<void> {
    try {
      await api.put(`/api/commute/${id}`, data);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update route');
    }
  },

  async deleteRoute(id: number): Promise<void> {
    try {
      await api.delete(`/api/commute/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete route');
    }
  },

  async searchPlaces(query: string, lat?: number, lng?: number, radius?: number): Promise<PlaceResult[]> {
    try {
      const params: any = { query };
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      }
      if (radius) {
        params.radius = radius;
      }

      const response = await api.get('/api/commute/search/places', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to search places');
    }
  },

  async getDirections(origin: string, destination: string, mode?: string): Promise<DirectionsResult> {
    try {
      const params: any = { origin, destination };
      if (mode) {
        params.mode = mode;
      }

      const response = await api.get('/api/commute/directions', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get directions');
    }
  }
};
