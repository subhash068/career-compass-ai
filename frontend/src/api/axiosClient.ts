import axios from 'axios';

const resolveApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envBaseUrl) {
    return envBaseUrl.replace(/\/+$/, "");
  }

  // Local frontend often runs on :5000 while backend runs on :8000.
  // Use direct backend URL so chatbot works even without /api proxy.
  if (typeof window !== "undefined") {
    const { hostname, port } = window.location;
    if ((hostname === "localhost" || hostname === "127.0.0.1") && (port === "5000" || port === "5173")) {
      return "http://127.0.0.1:8000";
    }

    // Vercel static hosting has no backend proxy by default.
    if (hostname.endsWith("vercel.app")) {
      return "https://career-compass-backend-production-162c.up.railway.app";
    }
  }

  // Default for nginx/deployed setups where /api is reverse-proxied.
  return "/api";
};

const API_BASE_URL = resolveApiBaseUrl();



const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

// Debug logging removed to reduce noise

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Response interceptor for global error handling and retry
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as any;
    if (config && !config._retry && !error.response && error.code !== 'ECONNABORTED') {
      config._retry = true;
      // Retry once for network errors
      return axiosClient.request(config);
    }

    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';

    } else if (error.response?.status === 403) {
      // Forbidden - check if user is actually admin
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.error('Access forbidden. User role:', user.role);
          if (user.role !== 'admin') {
            console.error('User is not admin. Redirecting to dashboard.');
            window.location.href = '/dashboard';
          }
        } catch (e) {
          console.error('Failed to parse user data');
        }
      }

    } else if (error.response?.status === 404) {
      // Not found - let the API layer handle it
      // The skills.api.ts already catches 404 and returns null
    }
    return Promise.reject(error);


  }
);

export default axiosClient;
