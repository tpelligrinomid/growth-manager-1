import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

export const AcceptInvitation = ({ onLogin }: { onLogin: (token: string) => void }) => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const verifyInvitation = async () => {
      try {
        const response = await fetch(`${API_URL}/api/invitations/verify/${token}`);
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
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/invitations/accept/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        throw new Error('Failed to accept invitation');
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Accept Invitation</h2>
        {invitation && (
          <div className="space-y-4">
            <p className="text-gray-700">
              You've been invited to join Growth Manager as a{' '}
              <span className="font-semibold">
                {invitation.role.replace('_', ' ')}
              </span>
            </p>
            <p className="text-gray-600">Email: {invitation.email}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="form-field">
            <label htmlFor="password">Create Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
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
            />
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
            Accept & Continue to Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitation; 