import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3030/api', timeout: 15000, withCredentials: true });
api.interceptors.response.use(response => response, error => {
  if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/login')) {
    window.dispatchEvent(new Event('pks:unauthorized'));
  }
  return Promise.reject(error);
});

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(' · ');
    if (typeof message === 'string') return message;
    return 'Không kết nối được máy chủ. Vui lòng thử lại.';
  }
  return error instanceof Error ? error.message : 'Đã có lỗi xảy ra.';
}
