import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AccountResponse, EngagementType, Priority, Service, BusinessUnit } from '../types';
import { formatEngagementType, formatPriority } from '../utils/formatters';

interface Props {
  account: AccountResponse;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: AccountResponse) => Promise<void>;
}

interface EditAccountForm {
  engagementType: EngagementType;
  priority: Priority;
  industry: string;
  annualRevenue: number;
  employees: number;
  website?: string;
  linkedinProfile?: string;
  clientFolderId: string;
  clientListTaskId: string;
  growthInMrr: number;
  services: Service[];
  accountName: string;
  businessUnit: BusinessUnit;
  accountManager: string;
  teamManager: string;
  relationshipStartDate: string;
  contractStartDate: string;
  contractRenewalEnd: string;
  pointsPurchased: number;
  pointsDelivered: number;
  recurringPointsAllotment: number;
  mrr: number;
  pointsStrikingDistance: number;
  potentialMrr: number;
  delivery: string;
}

const MultiSelectDropdown = ({ 
  selected, 
  onChange 
}: { 
  selected: Service[], 
  onChange: (services: Service[]) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleService = (service: Service) => {
    if (selected.includes(service)) {
      onChange(selected.filter(s => s !== service));
    } else {
      onChange([...selected, service]);
    }
  };

  return (
    <div className="multi-select-dropdown">
      <div 
        className="selected-services" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length ? selected.join(', ') : 'Select Services'}
      </div>
      {isOpen && (
        <div className="services-dropdown">
          {Object.values(Service).map(service => (
            <label key={service} className="service-option">
              <input
                type="checkbox"
                checked={selected.includes(service)}
                onChange={() => toggleService(service)}
              />
              {service.replace(/_/g, ' ')}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export const EditAccountModal: React.FC<Props> = ({ account, isOpen, onClose, onSubmit }) => {
  console.log('Initial account data:', account);

  // Clean the numeric values by removing commas and converting to numbers
  const cleanNumber = (value: any) => {
    if (typeof value === 'string') {
      return Number(value.replace(/,/g, ''));
    }
    return Number(value);
  };

  const defaultValues = () => ({
    // Manual fields
    engagementType: account.engagementType,
    priority: account.priority,
    industry: account.industry,
    annualRevenue: cleanNumber(account.annualRevenue),
    employees: cleanNumber(account.employees),
    website: account.website,
    linkedinProfile: account.linkedinProfile,
    clientFolderId: account.clientFolderId,
    clientListTaskId: account.clientListTaskId,
    growthInMrr: cleanNumber(account.growthInMrr),
    services: account.services as Service[],
    
    // BigQuery fields
    accountName: account.accountName,
    businessUnit: account.businessUnit as BusinessUnit,
    accountManager: account.accountManager,
    teamManager: account.teamManager,
    relationshipStartDate: account.relationshipStartDate,
    contractStartDate: account.contractStartDate,
    contractRenewalEnd: account.contractRenewalEnd,
    pointsPurchased: cleanNumber(account.pointsPurchased),
    pointsDelivered: cleanNumber(account.pointsDelivered),
    recurringPointsAllotment: cleanNumber(account.recurringPointsAllotment),
    mrr: cleanNumber(account.mrr),
    pointsStrikingDistance: cleanNumber(account.pointsStrikingDistance),
    potentialMrr: cleanNumber(account.potentialMrr),
    delivery: account.delivery
  });

  const [formData, setFormData] = useState<EditAccountForm>(defaultValues());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData); // Debug log

    const updateData: AccountResponse = {
      ...account,
      ...formData,
      services: formData.services
    };

    console.log('Sending update data:', updateData); // Debug log
    await onSubmit(updateData);
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
                <div className="form-field">
                  <label htmlFor="services">Services</label>
                  <MultiSelectDropdown
                    selected={formData.services}
                    onChange={services => setFormData({...formData, services})}
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3>Additional Information</h3>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="growthInMrr">Growth in MRR</label>
                  <input
                    type="number"
                    id="growthInMrr"
                    value={formData.growthInMrr}
                    onChange={e => setFormData({...formData, growthInMrr: Number(e.target.value)})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="clientFolderId">Client Folder ID</label>
                  <input
                    type="text"
                    id="clientFolderId"
                    value={formData.clientFolderId}
                    onChange={e => setFormData({...formData, clientFolderId: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="clientListTaskId">Client List Task ID</label>
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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 