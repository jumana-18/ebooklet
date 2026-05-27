import axios from 'axios';

// Create configured axios API instance
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enables sending/receiving cookies automatically
});

// Configure Request Interceptor to dynamically inject JWT token from LocalStorage if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('booklet_jwt_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Configure Response Interceptor to capture token expiration or auth failures globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('⚠️ Session expired or invalid token detected. Log out user process triggered.');
      localStorage.removeItem('booklet_jwt_token');
      localStorage.removeItem('booklet_user_session');
      // Force reload or redirect to trigger AuthContext update if appropriate
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
