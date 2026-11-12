import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '/api';

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = window.sessionStorage.getItem('sgb-access-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.sessionStorage.removeItem('sgb-access-token');
      window.dispatchEvent(new Event('sgb:unauthorized'));
    }
    return Promise.reject(error);
  },
);