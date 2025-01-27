import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

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
  userId: string;
}

const Settings: React.FC<SettingsProps> = ({ userRole, userId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'GROWTH_MANAGER' as Role });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get<{ data: User[] }>('/api/users');
      console.log('Users response:', response);
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
      setUsers([]);
    }
  };

  const fetchInvitations = async () => {
    try {
      const response = await apiClient.get<{ data: Invitation[] }>('/api/invitations');
      console.log('Invitations response:', response);
      setInvitations((response.data.data || []).filter(inv => !inv.accepted));
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Failed to fetch invitations');
      setInvitations([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchInvitations();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/invitations', { email: newInvite.email, role: newInvite.role });
      setSuccess('Invitation sent successfully');
      setNewInvite({ email: '', role: 'GROWTH_MANAGER' });
      fetchInvitations();
    } catch (err) {
      setError('Failed to send invitation');
    }
  };

  const handleResendInvite = async (invitationId: string) => {
    try {
      await apiClient.post(`/api/invitations/${invitationId}/resend`);
      setSuccess('Invitation resent successfully');
      fetchInvitations();
    } catch (err) {
      setError('Failed to resend invitation');
    }
  };

  const handleDeleteInvite = async (invitationId: string) => {
    try {
      await apiClient.delete(`/api/invitations/${invitationId}`);
      setSuccess('Invitation deleted successfully');
      fetchInvitations();
    } catch (err) {
      setError('Failed to delete invitation');
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await apiClient.post(`/api/users/${userId}/reset-password`);
      setSuccess('Password reset email sent');
    } catch (err) {
      setError('Failed to send password reset email');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      await apiClient.put(`/api/users/${userId}/role`, { role: newRole });
      setSuccess('Role updated successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (userToDelete.id === userId) {
      setError('You cannot delete your own account');
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to delete ${userToDelete.name || userToDelete.email}?`);
    if (!confirmDelete) return;

    try {
      await apiClient.delete(`/api/users/${userToDelete.id}`);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  if (userRole !== 'ADMINISTRATOR') {
    return <div className="settings-container">You do not have permission to access this page.</div>;
  }

  return (
    <div className="settings-container">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-section">
        <h2>Send Invitation</h2>
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
          </div>
          <button type="submit" className="button-primary">Send Invitation</button>
        </form>
      </div>

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
        <h2>Users</h2>
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
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name || '-'}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value as Role)}
                    className="role-select"
                  >
                    <option value="GROWTH_MANAGER">Growth Manager</option>
                    <option value="GROWTH_ADVISOR">Growth Advisor</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="button-secondary"
                    >
                      Reset Password
                    </button>
                    {user.id !== userId && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="button-secondary delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
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