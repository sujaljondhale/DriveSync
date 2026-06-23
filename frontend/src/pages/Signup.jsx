import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { useAuth } from '../context/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/api';

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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/auth/google/verify', { credential: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Google signup failed on backend.');
    }
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
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    setFormError('Google Signup Failed');
                  }}
                  shape="rectangular"
                  theme="outline"
                  text="signup_with"
                  size="large"
                />
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
