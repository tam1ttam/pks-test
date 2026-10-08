import axios from 'axios';
import { ADMIN_TOKEN_KEY } from '../constants/storage';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3030/api', timeout: 15000 });

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && error.config?.headers?.Authorization) {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    window.dispatchEvent(new Event('pks-admin:unauthorized'));
  }
  return Promise.reject(error);
});

export function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(' · ');
    if (typeof message === 'string') return message;
    if (!error.response) return 'Không kết nối được backend tại cổng 3030.';
  }
  return error instanceof Error ? error.message : 'Đã có lỗi xảy ra.';
}

