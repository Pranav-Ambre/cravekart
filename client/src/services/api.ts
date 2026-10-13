import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cravekart_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: any[] }>) => {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    
    // Log in development
    if (import.meta.env.DEV) {
      console.warn(`[API Error ${error.response?.status}]:`, errorMessage, error.response?.data);
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
