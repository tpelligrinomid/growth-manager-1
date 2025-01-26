import React, { useState } from 'react';
import InviteUserModal from './InviteUserModal';

interface SettingsProps {
  userRole?: 'ADMINISTRATOR' | 'GROWTH_MANAGER' | 'GROWTH_ADVISOR';
}

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteUser = async (data: { email: string; role: string }) => {
    try {
      // TODO: Implement the API call to send invitation
      console.log('Sending invitation to:', data);
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