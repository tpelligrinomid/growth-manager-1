import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; role: string }) => Promise<void>;
}

export const InviteUserModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'GROWTH_ADVISOR'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Invite User</h2>
          <button onClick={onClose} className="close-button">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="add-account-form">
            <div className="form-section">
              <h3>User Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                    placeholder="user@example.com"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="GROWTH_ADVISOR">Growth Advisor</option>
                    <option value="GROWTH_MANAGER">Growth Manager</option>
                    <option value="ADMINISTRATOR">Administrator</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="secondary-button">
                Cancel
              </button>
              <button type="submit" className="primary-button">
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InviteUserModal; 