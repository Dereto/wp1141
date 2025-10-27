import axios from 'axios';

const GOOGLE_MAPS_BASE_URL = 'https://maps.googleapis.com/maps/api';

// Get API key dynamically each time it's needed
const getApiKey = () => {
  return process.env.GOOGLE_MAPS_SERVER_KEY;
};

// Check if API key is properly configured
const isApiKeyConfigured = () => {
  const apiKey = getApiKey();
  return apiKey &&
         apiKey !== 'YOUR_SERVER_KEY' &&
         apiKey !== 'YOUR_SERVER_KEY_PLACEHOLDER';
};

export interface GeocodingResult {
  address: string;
  lat: number;
  lng: number;
  formatted_address: string;
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

export class GoogleMapsService {
  // Geocoding: Convert address to coordinates
  static async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      // Check if API key is configured
      if (!isApiKeyConfigured()) {
        throw new Error('Google Maps API key is not configured. Please set GOOGLE_MAPS_SERVER_KEY in your .env file');
      }

      const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/geocode/json`, {
        params: {
          address,
          key: getApiKey()
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return {
        address: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  // Directions: Get route between two points
  static async getDirections(
    origin: string,
    destination: string,
    mode: string = 'driving'
  ): Promise<DirectionsResult> {
    try {
      // Check if API key is configured
      if (!isApiKeyConfigured()) {
        throw new Error('Google Maps API key is not configured. Please set GOOGLE_MAPS_SERVER_KEY in your .env file');
      }

      const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/directions/json`, {
        params: {
          origin,
          destination,
          mode,
          key: getApiKey()
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Directions failed: ${response.data.status}`);
      }

      const route = response.data.routes[0].legs[0];
      
      return {
        distance: route.distance,
        duration: route.duration,
        steps: route.steps.map((step: any) => ({
          instruction: step.html_instructions.replace(/<[^>]*>/g, ''), // Remove HTML tags
          distance: step.distance,
          duration: step.duration
        }))
      };
    } catch (error) {
      console.error('Directions error:', error);
      throw new Error('Failed to get directions');
    }
  }

  // Places: Search for places near a location
  static async searchPlaces(
    query: string,
    location?: { lat: number; lng: number },
    radius: number = 5000
  ): Promise<PlaceResult[]> {
    try {
      // Check if API key is configured
      if (!isApiKeyConfigured()) {
        throw new Error('Google Maps API key is not configured. Please set GOOGLE_MAPS_SERVER_KEY in your .env file');
      }

      const params: any = {
        query,
        key: getApiKey()
      };

      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = radius;
      }

      const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/textsearch/json`, {
        params
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Places search failed: ${response.data.status}`);
      }

      return response.data.results.map((place: any) => ({
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.formatted_address,
        geometry: place.geometry,
        rating: place.rating,
        types: place.types
      }));
    } catch (error) {
      console.error('Places search error:', error);
      throw new Error('Failed to search places');
    }
  }

  // Get place details
  static async getPlaceDetails(placeId: string): Promise<PlaceResult> {
    try {
      const response = await axios.get(`${GOOGLE_MAPS_BASE_URL}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'place_id,name,formatted_address,geometry,rating,types',
          key: getApiKey()
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Place details failed: ${response.data.status}`);
      }

      const place = response.data.result;
      return {
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.formatted_address,
        geometry: place.geometry,
        rating: place.rating,
        types: place.types
      };
    } catch (error) {
      console.error('Place details error:', error);
      throw new Error('Failed to get place details');
    }
  }
}
