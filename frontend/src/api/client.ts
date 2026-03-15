import axios from 'axios';

// Use env var if provided, otherwise derive from current host (assuming backend is on same IP, port 8000)
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  // Fallback: If we are on http://13.247.185.213:3000, backend is likely http://13.247.185.213:8000
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000`;
};

export const API_URL = getApiUrl();

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the token if it exists
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally (optional but good practice)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (e.g., redirect to login)
    if (error.response && error.response.status === 401) {
      // You might want to clear local storage and redirect here
      // localStorage.removeItem('token');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default client;
