import React, { useState } from 'react';
import InviteUserModal from './InviteUserModal';
import { API_URL } from '../config/api';

interface SettingsProps {
  userRole?: 'ADMINISTRATOR' | 'GROWTH_MANAGER' | 'GROWTH_ADVISOR';
}

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteUser = async (data: { email: string; role: string }) => {
    try {
      console.log('Sending invitation request to:', `${API_URL}/api/invitations`);
      console.log('Request data:', data);
      
      const response = await fetch(`${API_URL}/api/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send invitation');
      }

      setIsInviteModalOpen(false);
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    }
  };

  return (
    <div className="settings-section">
      <h2>Settings</h2>
      {userRole === 'ADMINISTRATOR' ? (
        <div className="settings-content">
          <div className="settings-card">
            <h3>User Management</h3>
            <p>Manage users and their roles.</p>
            <button 
              className="primary-button"
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite User
            </button>
          </div>
        </div>
      ) : (
        <p>You do not have permission to access settings. Please contact an administrator.</p>
      )}

      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSubmit={handleInviteUser}
      />
    </div>
  );
};

export default Settings; 