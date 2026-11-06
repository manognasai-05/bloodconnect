import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bloodconnect_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clean token
      if (window.location.pathname.startsWith('/dashboard')) {
        localStorage.removeItem('bloodconnect_token');
        localStorage.removeItem('bloodconnect_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
