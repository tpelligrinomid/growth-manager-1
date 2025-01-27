import * as React from 'react';
import { useState, useEffect } from 'react';

type Role = 'ADMINISTRATOR' | 'GROWTH_MANAGER' | 'GROWTH_ADVISOR';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: Role;
  accepted: boolean;
  expires: string;
  createdAt: string;
}

interface SettingsProps {
  userRole: string;
}

export const Settings: React.FC<SettingsProps> = ({ userRole }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'GROWTH_MANAGER' as Role });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://growth-manager-1.onrender.com/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const { data } = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await fetch('https://growth-manager-1.onrender.com/api/invitations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch invitations');
      const { data } = await response.json();
      setInvitations(data);
    } catch (err) {
      setError('Failed to load invitations');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchInvitations();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://growth-manager-1.onrender.com/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newInvite)
      });
      if (!response.ok) throw new Error('Failed to send invitation');
      setSuccess('Invitation sent successfully');
      setNewInvite({ email: '', role: 'GROWTH_MANAGER' });
      fetchInvitations();
    } catch (err) {
      setError('Failed to send invitation');
    }
  };

  const handleResendInvite = async (invitationId: string) => {
    try {
      const response = await fetch(`https://growth-manager-1.onrender.com/api/invitations/${invitationId}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to resend invitation');
      setSuccess('Invitation resent successfully');
      await fetchInvitations();
    } catch (err) {
      setError('Failed to resend invitation');
    }
  };

  const handleDeleteInvite = async (invitationId: string) => {
    try {
      const response = await fetch(`https://growth-manager-1.onrender.com/api/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to delete invitation');
      setSuccess('Invitation deleted successfully');
      fetchInvitations();
    } catch (err) {
      setError('Failed to delete invitation');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await fetch(`https://growth-manager-1.onrender.com/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to reset password');
      setSuccess('Password reset email sent');
    } catch (err) {
      setError('Failed to reset password');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      const response = await fetch(`https://growth-manager-1.onrender.com/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
      });
      if (!response.ok) throw new Error('Failed to update role');
      setSuccess('Role updated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to update role');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-section">
        <h2>Invite New User</h2>
        <form onSubmit={handleInvite} className="invite-form">
          <div className="form-group">
            <input
              type="email"
              value={newInvite.email}
              onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
              placeholder="Email"
              required
              className="form-input"
            />
            <select
              value={newInvite.role}
              onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value as Role })}
              className="form-select"
            >
              <option value="GROWTH_MANAGER">Growth Manager</option>
              <option value="GROWTH_ADVISOR">Growth Advisor</option>
              <option value="ADMINISTRATOR">Administrator</option>
            </select>
            <button type="submit" className="button-primary">Send Invitation</button>
          </div>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-section">
        <h2>Pending Invitations</h2>
        <table className="settings-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Sent</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invitations.map(invitation => {
              const isExpired = new Date(invitation.expires) < new Date();
              const status = invitation.accepted ? 'Accepted' : 
                           isExpired ? 'Expired' : 'Pending';
              
              return (
                <tr key={invitation.id}>
                  <td>{invitation.email}</td>
                  <td>{invitation.role.replace('_', ' ')}</td>
                  <td>{status}</td>
                  <td>{new Date(invitation.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(invitation.expires).toLocaleDateString()}</td>
                  <td>
                    {!invitation.accepted && !isExpired && (
                      <>
                        <button
                          onClick={() => handleResendInvite(invitation.id)}
                          className="button-secondary"
                        >
                          Resend
                        </button>
                        <button
                          onClick={() => handleDeleteInvite(invitation.id)}
                          className="button-secondary delete"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {(invitation.accepted || isExpired) && (
                      <button
                        onClick={() => handleDeleteInvite(invitation.id)}
                        className="button-secondary delete"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="settings-section">
        <h2>Existing Users</h2>
        <table className="settings-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value as Role)}
                    className="role-select"
                    disabled={userRole !== 'ADMINISTRATOR'}
                  >
                    <option value="GROWTH_MANAGER">Growth Manager</option>
                    <option value="GROWTH_ADVISOR">Growth Advisor</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => handleResetPassword(user.id)}
                    className="button-secondary"
                  >
                    Reset Password
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings; 