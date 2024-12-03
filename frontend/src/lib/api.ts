import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import type { ErrorResponse } from '../types/auth.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ErrorResponse>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    // Standardize error response
    const errorResponse: ErrorResponse = {
      code: error.response?.data?.code || error.response?.status || 500,
      message: error.response?.data?.message || error.message,
      timestamp: Date.now(),
    };

    return Promise.reject(errorResponse);
  }
);

export default api;
