import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const AcceptInvitation: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

  const handleAcceptInvitation = async () => {
    try {
      const response = await fetch(`${API_URL}/api/invitations/accept/${token}`, {
        method: 'POST'
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      // Redirect to Google sign-in
      window.location.href = `${API_URL}/auth/google`;
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
            <button
              onClick={handleAcceptInvitation}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Accept & Continue to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvitation; 