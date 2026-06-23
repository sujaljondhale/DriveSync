import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

const BACKEND_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'https://drivesync-3lkp.onrender.com';

export default function Signup() {
  const navigate = useNavigate();
  const { signup, loading, setUser } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError('Fill in every field to create your account.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    if (!agreed) {
      setFormError('Accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    try {
      // AuthContext.signup reads newAccount.name — pass fullName as 'name'
      await signup({ name: fullName.trim(), email: email.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.message);
    }
  }

  const handleGoogleSignup = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  return (
    <div className="signup-page">
      <header className="signup-topbar">
        <span className="brand-name-sm">DriveSync</span>
        <nav className="signup-nav">
          <span className="status-pill"><span className="dot" /> System online</span>
          <Link to="/pricing">Pricing</Link>
          <Link to="/security">Security</Link>
          <Link to="/login" className="nav-cta">Sign in</Link>
        </nav>
      </header>

      <div className="signup-body">
        <div className="signup-pitch">
          <h1>
            Secure your digital <span className="accent">roots</span> in the cloud.
          </h1>
          <p className="pitch-copy">
            DriveSync bridges powerful cloud storage infrastructure with a calm,
            organic interface — built for people who want their files kept safely
            and simply.
          </p>

          <div className="pitch-grid">
            <div className="pitch-photo" role="img" aria-label="Brand photography placeholder" />
            <div className="pitch-stat">
              <Icon name="cloud" size={26} />
              <div>
                <strong>99.9% uptime</strong>
                <span>Enterprise-grade storage stability.</span>
              </div>
            </div>
          </div>

          <div className="pitch-banner pitch-banner-gradient">
            <h3>Cloud-native, heart-focused.</h3>
            <p>Simple storage for human lives.</p>
          </div>
        </div>

        <div className="auth-card signup-card">
          <h2>Create account</h2>
          <p className="card-subtitle">Begin your journey with DriveSync today.</p>

          <form onSubmit={handleSubmit} noValidate>
            {formError && (
              <div className="banner banner-error">
                <Icon name="alert" size={16} />
                <span>{formError}</span>
              </div>
            )}

            <div className="field">
              <label htmlFor="fullName">Full name</label>
              <div className="input-wrap">
                <Icon name="user" />
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="signupEmail">Email address</label>
              <div className="input-wrap">
                <Icon name="mail" />
                <input
                  id="signupEmail"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="signupPassword">Password</label>
              <div className="input-wrap">
                <Icon name="lock" />
                <input
                  id="signupPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Create a password"
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

            <div className="field">
              <label htmlFor="confirmPassword">Verify password</label>
              <div className="input-wrap">
                <Icon name="shield" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              <span>
                I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>.
              </span>
            </label>

            <button
              id="signup-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create account'}
              {!loading && <Icon name="arrowRight" size={18} />}
            </button>

            <div className="auth-switch">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>

            <div className="divider-row">or join with</div>

            <div className="oauth-row">
              <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
                <button
                  type="button"
                  className="btn-google-custom"
                  onClick={handleGoogleSignup}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                  Sign up with Google
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <footer className="signup-footer">
        <p>Data encrypted at rest and in transit.</p>
      </footer>
    </div>
  );
}
