import axios from 'axios';

let base = import.meta.env.VITE_API_URL || '/api';
if (base && !base.endsWith('/api') && base.startsWith('http')) {
  base = base.replace(/\/$/, '') + '/api';
}

const api = axios.create({
  baseURL: base,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
