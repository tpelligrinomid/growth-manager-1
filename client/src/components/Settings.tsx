import React from 'react';

interface SettingsProps {
  userRole?: 'ADMINISTRATOR' | 'GROWTH_MANAGER' | 'GROWTH_ADVISOR';
}

const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  return (
    <div className="settings-section">
      <h2>Settings</h2>
      {userRole === 'ADMINISTRATOR' ? (
        <div className="settings-content">
          <div className="settings-card">
            <h3>User Management</h3>
            <p>Manage users and their roles.</p>
            <button className="primary-button">
              Invite User
            </button>
          </div>
        </div>
      ) : (
        <p>You do not have permission to access settings. Please contact an administrator.</p>
      )}
    </div>
  );
};

export default Settings; 