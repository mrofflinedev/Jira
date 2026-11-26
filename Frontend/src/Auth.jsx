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

    const cleanUsername = username.trim();

    try {
      if (isRegister) {
        await api.post('register/', {
          username: cleanUsername,
          email: email.trim(),
          password,
        });
      }
      const res = await api.post('token/', {
        username: cleanUsername,
        password,
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('username', cleanUsername);
      onLoginSuccess(cleanUsername);
    } catch (err) {
      if (!err.response) {
        setError('Network error: Could not reach backend.');
      } else {
        const data = err.response.data;
        setError(typeof data === 'string' ? `Error ${err.response.status}` : JSON.stringify(data));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">
          <span className="brand-square"></span>
          <span>Jira</span>
        </div>

        <div className="auth-card">
          <h2>{isRegister ? 'Create your workspace' : 'Sign in to Jira'}</h2>
          <p className="auth-card-sub">
            {isRegister
              ? 'Get started with your personal Kanban board.'
              : 'Welcome back. Enter your details to continue.'}
          </p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {isRegister && (
              <>
                <label>Email</label>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" disabled={loading}>
              {loading
                ? 'Connecting...'
                : isRegister
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="auth-toggle">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
