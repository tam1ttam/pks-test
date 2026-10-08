import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3030/api', timeout: 15000, withCredentials: true, headers: { 'X-PKS-Portal': 'admin' } });

api.interceptors.response.use(response => {
  const method = response.config.method?.toUpperCase();
  if (method && ['POST', 'PATCH', 'DELETE'].includes(method) && !response.config.url?.startsWith('/auth/') && !response.config.url?.startsWith('/uploads/')) window.dispatchEvent(new CustomEvent('pks-admin:toast', { detail: { type: 'success', message: response.data?.message || 'Thao tác với máy chủ đã hoàn tất.' } }));
  return response;
}, error => {
  if (error.response?.status === 401 && error.config?.headers?.Authorization) {
    window.dispatchEvent(new Event('pks-admin:unauthorized'));
  }
  const message = error.response?.data?.message;
  if (!error.config?.url?.startsWith('/auth/login') && !error.config?.url?.startsWith('/uploads/')) window.dispatchEvent(new CustomEvent('pks-admin:toast', { detail: { type: 'error', message: Array.isArray(message) ? message.join(' · ') : message || 'Yêu cầu thất bại.' } }));
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

