import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';
import './Login.css';

export const AcceptInvitation = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        const response = await fetch(`${API_URL}/api/invitations/${token}/verify`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Invalid invitation');
        }
        
        setInvitation(data.data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to verify invitation');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyInvitation();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, name })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to accept invitation');
      }

      const { token: jwtToken } = await response.json();
      onLogin(jwtToken);
      navigate('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to accept invitation');
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-box">
          <img src="/logo.png" alt="Marketers in Demand" className="login-logo" />
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="login-container">
        <div className="login-box">
          <img src="/logo.png" alt="Marketers in Demand" className="login-logo" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="error-message">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="login-button"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <img src="/logo.png" alt="Marketers in Demand" className="login-logo" />
        <h2>Accept Invitation</h2>
        {invitation && (
          <div className="invitation-info">
            <p>
              You've been invited to join Growth Manager as a{' '}
              <span className="font-semibold">
                {invitation.role.replace('_', ' ')}
              </span>
            </p>
            <p className="email-info">Email: {invitation.email}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          <div className="form-field">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Create Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Enter your password"
            />
          </div>
          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Confirm your password"
            />
          </div>
          <button type="submit" className="login-button">
            Accept & Continue to Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default AcceptInvitation; 