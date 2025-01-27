import React, { useState } from 'react';
import { API_URL } from '../config/api';
import './UpdateNameModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentName: string;
  onNameUpdate: (newName: string, newToken: string) => void;
}

export const UpdateNameModal: React.FC<Props> = ({ isOpen, onClose, userId, currentName, onNameUpdate }) => {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users/${userId}/name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: name.trim() })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update name');
      }

      // Update token and name in parent component
      onNameUpdate(data.data.name, data.token);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Update Name</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="form-actions">
              <button type="button" onClick={onClose} className="button-secondary">
                Cancel
              </button>
              <button type="submit" className="button-primary" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Name'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 