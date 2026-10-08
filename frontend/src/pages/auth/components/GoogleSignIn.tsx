import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../services/auth.service';
import { errorMessage } from '../../../services/api';

export default function GoogleSignIn({ busy, setBusy, setError }: { busy: boolean; setBusy: (value: boolean) => void; setError: (value: string) => void }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const signIn = useAuth(state => state.signIn);
  const navigate = useNavigate();
  if (!clientId) return null;
  return <GoogleOAuthProvider clientId={clientId}>
    <div className="divider"><span>hoặc tiếp tục với</span></div>
    <div className="google-button" aria-busy={busy} style={busy ? { pointerEvents: 'none', opacity: .55 } : undefined}>
      <GoogleLogin theme="outline" shape="rectangular" size="large" useOneTap={false}
        onSuccess={async response => {
          if (busy) return;
          setBusy(true); setError('');
          try {
            if (!response.credential) throw new Error('Không nhận được xác thực Google.');
            signIn(await authService.google(response.credential));
            navigate('/', { replace: true });
          } catch (error) { setError(errorMessage(error)); }
          finally { setBusy(false); }
        }} onError={() => setError('Không đăng nhập được bằng Google. Vui lòng thử lại.')} />
    </div>
  </GoogleOAuthProvider>;
}
