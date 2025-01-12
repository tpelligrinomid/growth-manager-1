import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AccountResponse, BusinessUnit, EngagementType, Priority } from '../types';
import { formatBusinessUnit, formatEngagementType, formatPriority } from '../utils/formatters';

interface Props {
  account: AccountResponse;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: any) => void;
}

export const EditAccountModal: React.FC<Props> = ({ account, isOpen, onClose, onSubmit }) => {
  console.log('Initial account data:', account);

  // Clean the numeric values by removing commas and converting to numbers
  const cleanNumber = (value: any) => {
    if (typeof value === 'string') {
      return Number(value.replace(/,/g, ''));
    }
    return Number(value);
  };

  const [formData, setFormData] = useState(() => ({
    ...account,
    // Format dates
    relationshipStartDate: new Date(account.relationshipStartDate).toISOString().split('T')[0],
    contractStartDate: new Date(account.contractStartDate).toISOString().split('T')[0],
    contractRenewalEnd: new Date(account.contractRenewalEnd).toISOString().split('T')[0],
    // Clean numeric values
    mrr: cleanNumber(account.mrr),
    growthInMrr: cleanNumber(account.growthInMrr),
    pointsPurchased: cleanNumber(account.pointsPurchased),
    pointsDelivered: cleanNumber(account.pointsDelivered),
    recurringPointsAllotment: cleanNumber(account.recurringPointsAllotment),
    employees: cleanNumber(account.employees),
    annualRevenue: cleanNumber(account.annualRevenue),
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      ...account,
      ...formData,
      relationshipStartDate: new Date(formData.relationshipStartDate),
      contractStartDate: new Date(formData.contractStartDate),
      contractRenewalEnd: new Date(formData.contractRenewalEnd),
    };

    onSubmit(updateData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Account: {account.accountName}</h2>
          <div className="modal-actions">
            <button onClick={onClose} className="close-button" title="Close">
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit} className="add-account-form">
            {/* Basic Information */}
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
                    onChange={e => setFormData({...formData, businessUnit: e.target.value as BusinessUnit})}
                  >
                    <option value={BusinessUnit.NEW_NORTH}>{formatBusinessUnit(BusinessUnit.NEW_NORTH)}</option>
                    <option value={BusinessUnit.IDEOMETRY}>{formatBusinessUnit(BusinessUnit.IDEOMETRY)}</option>
                    <option value={BusinessUnit.MOTION}>{formatBusinessUnit(BusinessUnit.MOTION)}</option>
                    <option value={BusinessUnit.SPOKE}>{formatBusinessUnit(BusinessUnit.SPOKE)}</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="engagementType">Engagement Type</label>
                  <select
                    id="engagementType"
                    value={formData.engagementType}
                    onChange={e => setFormData({...formData, engagementType: e.target.value as EngagementType})}
                  >
                    <option value={EngagementType.STRATEGIC}>{formatEngagementType(EngagementType.STRATEGIC)}</option>
                    <option value={EngagementType.TACTICAL}>{formatEngagementType(EngagementType.TACTICAL)}</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
                  >
                    <option value={Priority.TIER_1}>{formatPriority(Priority.TIER_1)}</option>
                    <option value={Priority.TIER_2}>{formatPriority(Priority.TIER_2)}</option>
                    <option value={Priority.TIER_3}>{formatPriority(Priority.TIER_3)}</option>
                    <option value={Priority.TIER_4}>{formatPriority(Priority.TIER_4)}</option>
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="accountManager">Account Manager</label>
                  <input
                    type="text"
                    id="accountManager"
                    value={formData.accountManager}
                    onChange={e => setFormData({...formData, accountManager: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="teamManager">Team Manager</label>
                  <input
                    type="text"
                    id="teamManager"
                    value={formData.teamManager}
                    onChange={e => setFormData({...formData, teamManager: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Contract Details */}
            <div className="form-section">
              <h3>Contract Details</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="relationshipStartDate">Relationship Start Date</label>
                  <input
                    type="date"
                    id="relationshipStartDate"
                    value={formData.relationshipStartDate}
                    onChange={e => setFormData({...formData, relationshipStartDate: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contractStartDate">Contract Start Date</label>
                  <input
                    type="date"
                    id="contractStartDate"
                    value={formData.contractStartDate}
                    onChange={e => setFormData({...formData, contractStartDate: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="contractRenewalEnd">Contract Renewal End</label>
                  <input
                    type="date"
                    id="contractRenewalEnd"
                    value={formData.contractRenewalEnd}
                    onChange={e => setFormData({...formData, contractRenewalEnd: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Points & Delivery */}
            <div className="form-section">
              <h3>Points & Delivery</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="pointsPurchased">Points Purchased</label>
                  <input
                    type="number"
                    id="pointsPurchased"
                    value={formData.pointsPurchased}
                    onChange={e => setFormData(prev => ({
                      ...prev,
                      pointsPurchased: e.target.value === '' ? 0 : Number(e.target.value)
                    }))}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="pointsDelivered">Points Delivered</label>
                  <input
                    type="number"
                    id="pointsDelivered"
                    value={formData.pointsDelivered}
                    onChange={e => setFormData({...formData, pointsDelivered: Number(e.target.value)})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="recurringPointsAllotment">Recurring Points</label>
                  <input
                    type="number"
                    id="recurringPointsAllotment"
                    value={formData.recurringPointsAllotment}
                    onChange={e => setFormData({...formData, recurringPointsAllotment: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="form-section">
              <h3>Financial Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="mrr">MRR</label>
                  <input
                    type="number"
                    id="mrr"
                    value={formData.mrr}
                    onChange={e => setFormData({...formData, mrr: Number(e.target.value)})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="growthInMrr">Growth in MRR</label>
                  <input
                    type="number"
                    id="growthInMrr"
                    value={formData.growthInMrr}
                    onChange={e => setFormData({...formData, growthInMrr: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="form-section">
              <h3>Company Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="industry">Industry</label>
                  <input
                    type="text"
                    id="industry"
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="annualRevenue">Annual Revenue</label>
                  <input
                    type="number"
                    id="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={e => setFormData({...formData, annualRevenue: Number(e.target.value)})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="employees">Employees</label>
                  <input
                    type="number"
                    id="employees"
                    value={formData.employees}
                    onChange={e => setFormData({...formData, employees: Number(e.target.value)})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="linkedinProfile">LinkedIn Profile</label>
                  <input
                    type="url"
                    id="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={e => setFormData({...formData, linkedinProfile: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose} className="button-secondary">
                Cancel
              </button>
              <button type="submit" className="button-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 