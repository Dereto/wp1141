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

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  },

  async register(email: string, username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', { email, username, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  },

  async getProfile(token: string): Promise<User> {
    try {
      const response = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.user;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get profile');
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Logout is handled client-side, so we don't need to throw errors
      console.warn('Logout request failed:', error);
    }
  }
};
