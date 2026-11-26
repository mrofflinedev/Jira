import { useState } from 'react';
import api from './api';

function Auth({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.post('register/', { username, email, password });
      }
      const res = await api.post('token/', { username, password });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('username', username);
      onLoginSuccess(username);
    } catch (err) {
      setError(
        isRegister
          ? 'Could not create account. Try a different username.'
          : 'Invalid username or password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        {/* Friendly Left Intro Panel */}
        <div className="auth-intro">
          <div className="brand-mark">
            <span className="brand-square"></span>
            <span>Jira Workspace</span>
          </div>
          <h1>Plan, track, and ship your work without the clutter.</h1>
          <p className="auth-subtitle">
            A lightweight Kanban board built for fast-moving projects. Organize tasks by priority, track progress across columns, and keep every issue in one place.
          </p>
          <ul className="auth-highlights">
            <li>
              <strong>3-Stage Workflow</strong> — Move tasks effortlessly from To Do to Done.
            </li>
            <li>
              <strong>Priority Triage</strong> — Spot high-priority blockers at a glance.
            </li>
            <li>
              <strong>Instant Search & Edit</strong> — Click any card to update details anytime.
            </li>
          </ul>
        </div>

        {/* Clean Right Login/Register Card */}
        <div className="auth-card">
          <h2>{isRegister ? 'Create your account' : 'Welcome back'}</h2>
          <p className="auth-card-sub">
            {isRegister
              ? 'Sign up in seconds to start managing your board.'
              : 'Enter your credentials to open your workspace.'}
          </p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Username</label>
            <input
              type="text"
              placeholder="e.g. collins"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {isRegister && (
              <>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </>
            )}

            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading
                ? 'Connecting to server...'
                : isRegister
                ? 'Create Account'
                : 'Sign In to Board'}
            </button>
          </form>

          <p className="auth-toggle">
            {isRegister ? 'Already have an account?' : 'New to Jira Workspace?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
            >
              {isRegister ? 'Sign in here' : 'Create an account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
