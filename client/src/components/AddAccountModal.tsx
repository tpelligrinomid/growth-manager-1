import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Service, AddAccountForm } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddAccountForm) => Promise<void>;
}

// Initial form state
const initialFormData: AddAccountForm = {
  engagementType: 'TACTICAL',
  priority: 'TIER_4',
  industry: '',
  annualRevenue: 0,
  employees: 0,
  website: '',
  linkedinProfile: '',
  clientFolderId: '',
  clientListTaskId: '',
  growthInMrr: 0,
  services: []
};

export const AddAccountModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<AddAccountForm>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Account</h2>
          <button onClick={onClose} className="close-button">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="add-account-form">
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="engagementType">Engagement Type</label>
                  <select
                    id="engagementType"
                    value={formData.engagementType}
                    onChange={e => setFormData({...formData, engagementType: e.target.value})}
                    required
                  >
                    <option value="STRATEGIC">Strategic</option>
                    <option value="TACTICAL">Tactical</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    required
                  >
                    <option value="TIER_1">Tier 1</option>
                    <option value="TIER_2">Tier 2</option>
                    <option value="TIER_3">Tier 3</option>
                    <option value="TIER_4">Tier 4</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="industry">Industry</label>
                  <input
                    type="text"
                    id="industry"
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="annualRevenue">Annual Revenue</label>
                  <input
                    type="number"
                    id="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={e => setFormData({...formData, annualRevenue: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="employees">Number of Employees</label>
                  <input
                    type="number"
                    id="employees"
                    value={formData.employees}
                    onChange={e => setFormData({...formData, employees: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    placeholder="https://"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="linkedinProfile">LinkedIn Profile</label>
                  <input
                    type="url"
                    id="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={e => setFormData({...formData, linkedinProfile: e.target.value})}
                    placeholder="https://linkedin.com/company/"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="growthInMrr">Growth in MRR</label>
                  <input
                    type="number"
                    id="growthInMrr"
                    value={formData.growthInMrr}
                    onChange={e => setFormData({...formData, growthInMrr: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="services">Services</label>
                  <select
                    id="services"
                    multiple
                    value={formData.services}
                    onChange={e => setFormData({
                      ...formData, 
                      services: Array.from(e.target.selectedOptions, option => option.value as Service)
                    })}
                  >
                    <option value={Service.ABM}>ABM</option>
                    <option value={Service.PAID_MEDIA}>Paid Media</option>
                    <option value={Service.SEO}>SEO</option>
                    <option value={Service.CONTENT}>Content</option>
                    <option value={Service.REPORTING}>Reporting</option>
                    <option value={Service.SOCIAL}>Social</option>
                    <option value={Service.WEBSITE}>Website</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>ClickUp Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="clientFolderId">ClickUp Folder ID</label>
                  <input
                    type="text"
                    id="clientFolderId"
                    value={formData.clientFolderId}
                    onChange={e => setFormData({...formData, clientFolderId: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="clientListTaskId">ClickUp Client List Task ID</label>
                  <input
                    type="text"
                    id="clientListTaskId"
                    value={formData.clientListTaskId}
                    onChange={e => setFormData({...formData, clientListTaskId: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="button-secondary">
                Cancel
              </button>
              <button type="submit" className="button-primary">
                Create Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 