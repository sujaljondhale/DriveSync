import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'https://drivesync-3lkp.onrender.com';

// ── Passkey helpers ──────────────────────────────────────────────────────────

function base64urlToBuffer(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(pad);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64url(buf) {
  const bytes = new Uint8Array(buf);
  let str = '';
  bytes.forEach(b => str += String.fromCharCode(b));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// ── Login Page ───────────────────────────────────────────────────────────────

export default function Login() {
  const navigate = useNavigate();
  const { login, setUser, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // ── Handle Google OAuth redirect ────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');
    const error = params.get('error');

    if (error) {
      setFormError(decodeURIComponent(error));
      window.history.replaceState({}, '', '/login');
      return;
    }

    if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        navigate('/dashboard');
      } catch (e) {
        setFormError('Google sign-in failed. Please try again.');
      }
      window.history.replaceState({}, '', '/login');
    }
  }, [navigate, setUser]);

  // ── Email/password login ────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Enter your email and password to sign in.');
      return;
    }
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message);
    }
  }

  // ── Google login — redirect to backend OAuth flow ──────────────────────
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  // ── Passkey login ───────────────────────────────────────────────────────
  async function handlePasskeyLogin() {
    if (!window.PublicKeyCredential) {
      setFormError('Your browser does not support passkeys.');
      return;
    }
    setPasskeyLoading(true);
    setFormError('');
    try {
      // 1. Get challenge from server
      const { data: options } = await api.post('/auth/passkey/auth-options', { email });

      // 2. Build PublicKeyCredentialRequestOptions
      const publicKey = {
        challenge: base64urlToBuffer(options.challenge),
        timeout: options.timeout || 60000,
        rpId: options.rpId,
        userVerification: options.userVerification || 'preferred',
        allowCredentials: (options.allowCredentials || []).map(c => ({
          id: base64urlToBuffer(c.id),
          type: c.type,
        })),
      };

      // 3. Prompt browser for passkey
      const credential = await navigator.credentials.get({ publicKey });

      // 4. Send response to server
      const res = await api.post('/auth/passkey/auth', {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        response: {
          clientDataJSON: bufferToBase64url(credential.response.clientDataJSON),
          authenticatorData: bufferToBase64url(credential.response.authenticatorData),
          signature: bufferToBase64url(credential.response.signature),
          userHandle: credential.response.userHandle
            ? bufferToBase64url(credential.response.userHandle)
            : null,
        },
        type: credential.type,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setFormError('Passkey authentication was cancelled.');
      } else if (err.name === 'InvalidStateError') {
        setFormError('No passkey registered. Please sign in with password and register a passkey in Settings.');
      } else {
        setFormError(err.response?.data?.message || err.message || 'Passkey authentication failed.');
      }
    } finally {
      setPasskeyLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-mark">
          <Icon name="cloud" size={26} />
        </div>
        <h1 className="brand-name">DriveSync</h1>
        <p className="brand-tagline">Grounded, secure storage for your digital world.</p>
      </div>

      <div className="auth-card">
        <form onSubmit={handleSubmit}>
          {formError && (
            <div className="banner banner-error">
              <Icon name="alert" size={16} />
              <span>{formError}</span>
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email address</label>
            <div className="input-wrap">
              <Icon name="mail" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <div className="field-label-row">
              <label htmlFor="password">Password</label>
              <Link to="/forgot-password" className="link-sm">Forgot password?</Link>
            </div>
            <div className="input-wrap">
              <Icon name="lock" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
            {!loading && <Icon name="arrowRight" size={18} />}
          </button>

          <div className="auth-switch">
            New to DriveSync? <Link to="/signup">Create account</Link>
          </div>

          <div className="divider-row">or continue with</div>

          <div className="oauth-row">
            {/* Google — server-side redirect flow */}
            <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
              <button
                type="button"
                className="btn-google-custom"
                onClick={handleGoogleLogin}
              >
                <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                Sign in with Google
              </button>
            </div>

            {/* Passkey */}
            <button
              type="button"
              className="btn btn-oauth btn-passkey"
              onClick={handlePasskeyLogin}
              disabled={passkeyLoading}
            >
              <Icon name="key" size={18} />
              {passkeyLoading ? 'Authenticating…' : 'Passkey'}
            </button>
          </div>
        </form>
      </div>

      <div className="auth-footer">
        <span className="tls-pill">
          <span className="dot" /> Secure connection
        </span>
        <div className="footer-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
