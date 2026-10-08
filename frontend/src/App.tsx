import AppRoutes from './routes';
import { useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import Button from './components/common/Button';

export default function App() {
  const { initialize, clear, ready, error } = useAuth();
  useEffect(() => {
    void initialize();
    window.addEventListener('pks:unauthorized', clear);
    return () => window.removeEventListener('pks:unauthorized', clear);
  }, [initialize, clear]);
  if (!ready) return <main className="session-state" role="status">Đang tải tài khoản…</main>;
  if (error) return <main className="session-state"><p role="alert">{error}</p><Button onClick={() => void initialize()}>Thử lại</Button></main>;
  return <AppRoutes />;
}
