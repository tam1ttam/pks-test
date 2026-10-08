import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { useAuth } from './store/auth.store';
import './styles/global.css';

function Root() {
  const initialize = useAuth(state => state.initialize); const ready = useAuth(state => state.ready); const clear = useAuth(state => state.clear);
  useEffect(() => { void initialize(); }, [initialize]);
  useEffect(() => { const handler = () => clear(); window.addEventListener('pks-admin:unauthorized', handler); return () => window.removeEventListener('pks-admin:unauthorized', handler); }, [clear]);
  return ready ? <BrowserRouter><App /></BrowserRouter> : <div className="boot">Đang kiểm tra phiên quản trị…</div>;
}

createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>);
