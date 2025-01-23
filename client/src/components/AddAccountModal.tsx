import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { API_URL } from '../config/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: any) => void;
}

export const AddAccountModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    businessUnit: 'NEW_NORTH',
    engagementType: 'STRATEGIC',
    priority: 'TIER_1',
    accountManager: '',
    teamManager: '',
    relationshipStartDate: '',
    contractStartDate: '',
    contractRenewalEnd: '',
    services: [] as string[],
    pointsPurchased: 0,
    pointsDelivered: 0,
    recurringPointsAllotment: 0,
    mrr: 0,
    growthInMrr: 0,
    potentialMrr: 0,
    website: '',
    linkedinProfile: '',
    industry: '',
    annualRevenue: 0,
    employees: 0,
    clientFolderId: '',
    clientListTaskId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      onSubmit(data.data);
      onClose();
    } catch (error) {
      console.error('Error creating account:', error);
    }
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
                  <label htmlFor="accountName">Account Name</label>
                  <input
                    type="text"
                    id="accountName"
                    value={formData.accountName}
                    onChange={e => setFormData({...formData, accountName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="businessUnit">Business Unit</label>
                  <select
                    id="businessUnit"
                    value={formData.businessUnit}
                    onChange={e => setFormData({...formData, businessUnit: e.target.value})}
                    required
                  >
                    <option value="NEW_NORTH">New North</option>
                    <option value="IDEOMETRY">Ideometry</option>
                    <option value="MOTION">Motion</option>
                    <option value="SPOKE">Spoke</option>
                  </select>
                </div>
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
                  <label htmlFor="accountManager">Account Manager</label>
                  <input
                    type="text"
                    id="accountManager"
                    value={formData.accountManager}
                    onChange={e => setFormData({...formData, accountManager: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="teamManager">Team Manager</label>
                  <input
                    type="text"
                    id="teamManager"
                    value={formData.teamManager}
                    onChange={e => setFormData({...formData, teamManager: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="relationshipStartDate">Relationship Start Date</label>
                  <input
                    type="date"
                    id="relationshipStartDate"
                    value={formData.relationshipStartDate}
                    onChange={e => setFormData({...formData, relationshipStartDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contractStartDate">Contract Start Date</label>
                  <input
                    type="date"
                    id="contractStartDate"
                    value={formData.contractStartDate}
                    onChange={e => setFormData({...formData, contractStartDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contractRenewalEnd">Contract Renewal End</label>
                  <input
                    type="date"
                    id="contractRenewalEnd"
                    value={formData.contractRenewalEnd}
                    onChange={e => setFormData({...formData, contractRenewalEnd: e.target.value})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="services">Services</label>
                  <select
                    id="services"
                    multiple
                    value={formData.services}
                    onChange={e => setFormData({...formData, services: Array.from(e.target.selectedOptions, option => option.value)})}
                  >
                    <option value="SOCIAL">Social</option>
                    <option value="WEBSITE">Website</option>
                    <option value="SEO">SEO</option>
                    <option value="PPC">PPC</option>
                    <option value="EMAIL">Email</option>
                    <option value="CONTENT">Content</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="pointsPurchased">Points Purchased</label>
                  <input
                    type="number"
                    id="pointsPurchased"
                    value={formData.pointsPurchased}
                    onChange={e => setFormData({...formData, pointsPurchased: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="pointsDelivered">Points Delivered</label>
                  <input
                    type="number"
                    id="pointsDelivered"
                    value={formData.pointsDelivered}
                    onChange={e => setFormData({...formData, pointsDelivered: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="recurringPointsAllotment">Recurring Points Allotment</label>
                  <input
                    type="number"
                    id="recurringPointsAllotment"
                    value={formData.recurringPointsAllotment}
                    onChange={e => setFormData({...formData, recurringPointsAllotment: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="mrr">MRR</label>
                  <input
                    type="number"
                    id="mrr"
                    value={formData.mrr}
                    onChange={e => setFormData({...formData, mrr: Number(e.target.value)})}
                    required
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
                  <label htmlFor="potentialMrr">Potential MRR</label>
                  <input
                    type="number"
                    id="potentialMrr"
                    value={formData.potentialMrr}
                    onChange={e => setFormData({...formData, potentialMrr: Number(e.target.value)})}
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