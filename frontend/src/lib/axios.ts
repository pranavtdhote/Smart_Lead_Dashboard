import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import type { ApiErrorResponse } from '../types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Required for refresh token cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor ───────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (val?: unknown) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if the original request WAS the refresh request
      if (originalRequest.url === '/auth/refresh') {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);
        
        processQueue(null, newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        toast.error('Session expired. Please log in again.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Generic error handling formatting
    if (error.response?.data) {
      const apiError = error.response.data as ApiErrorResponse;
      // Let the specific API caller handle validation errors, otherwise show a toast
      if (!apiError.errors && apiError.message !== 'No refresh token provided') {
         toast.error(apiError.message);
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);
