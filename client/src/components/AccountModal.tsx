import React, { useState } from 'react';
import { AccountResponse } from '../types';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  PencilIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { formatEngagementType, formatPriority } from '../utils/formatters';
import { API_URL } from '../config/api';
import { determineDeliveryStatus } from '../utils/calculations';

interface Goal {
  description: string;
  dueDate: string;
  progress: number;
}

interface Props {
  account: AccountResponse & {
    goals?: Goal[];
  };
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const AccountModal: React.FC<Props> = ({ account, isOpen, onClose, onEdit }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSync = async () => {
    const folderId = account.clientFolderId;
    if (!folderId) {
      setSyncError('No ClickUp Folder ID available');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    
    try {
      console.log('Fetching BigQuery data for folder:', folderId);
      const response = await fetch(`${API_URL}/api/bigquery/account/${folderId}`);
      
      if (!response.ok) throw new Error(response.statusText);
      
      const data = await response.json();
      console.log('BigQuery data received:', data);
      
      // Update account with BigQuery data
      const updatedAccount = {
        ...account,
        accountName: data.clientData?.[0]?.client_name || account.accountName,
        businessUnit: data.clientData?.[0]?.business_unit || account.businessUnit,
        accountManager: data.clientData?.[0]?.assignee || account.accountManager,
        teamManager: data.clientData?.[0]?.team_lead || account.teamManager,
        status: data.clientData?.[0]?.status || account.status,
        relationshipStartDate: data.clientData?.[0]?.original_contract_start_date || account.relationshipStartDate,
        contractStartDate: data.clientData?.[0]?.points_mrr_start_date || account.contractStartDate,
        contractRenewalEnd: data.clientData?.[0]?.contract_renewal_end || account.contractRenewalEnd,
        pointsPurchased: data.points?.[0]?.points_purchased || account.pointsPurchased,
        pointsDelivered: data.points?.[0]?.points_delivered || account.pointsDelivered,
        recurringPointsAllotment: data.clientData?.[0]?.recurring_points_allotment || account.recurringPointsAllotment,
        mrr: data.clientData?.[0]?.mrr || account.mrr,
      };

      console.log('Updating account with:', updatedAccount);

      const updateResponse = await fetch(`${API_URL}/api/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAccount)
      });

      if (!updateResponse.ok) throw new Error('Failed to update account');

      window.location.reload(); // Refresh to show updated data
    } catch (error) {
      console.error('Error syncing:', error);
      setSyncError(error instanceof Error ? error.message : 'Failed to sync');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{account.accountName}</h2>
          <div className="modal-actions">
            <button 
              onClick={handleSync} 
              className={`sync-button ${isSyncing ? 'syncing' : ''}`} 
              disabled={isSyncing}
              title="Sync with ClickUp"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            {syncError && <div className="error-message">{syncError}</div>}
            <button onClick={onEdit} className="edit-button" title="Edit Account">
              <PencilIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button onClick={onClose} className="close-button" title="Close">
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="modal-body">
          <div className="detail-section">
            <div className="section-header">
              <BuildingOfficeIcon className="section-icon" />
              <h3>Basic Information</h3>
            </div>
            <div className="section-content">
              <p><strong>Business Unit:</strong> {account.businessUnit}</p>
              <p><strong>Engagement Type:</strong> {formatEngagementType(account.engagementType)}</p>
              <p><strong>Priority:</strong> {formatPriority(account.priority)}</p>
              <p><strong>Account Manager:</strong> {account.accountManager}</p>
              <p><strong>Team Manager:</strong> {account.teamManager}</p>
              <p><strong>Services:</strong> {account.services.join(', ')}</p>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <DocumentTextIcon className="section-icon" />
              <h3>Contract Details</h3>
            </div>
            <div className="section-content">
              <p><strong>Relationship Start:</strong> {new Date(account.relationshipStartDate).toLocaleDateString()}</p>
              <p><strong>Contract Start:</strong> {new Date(account.contractStartDate).toLocaleDateString()}</p>
              <p><strong>Contract Renewal:</strong> {new Date(account.contractRenewalEnd).toLocaleDateString()}</p>
              <p><strong>Client Tenure:</strong> {account.clientTenure} months</p>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <CurrencyDollarIcon className="section-icon" />
              <h3>Financial Information</h3>
            </div>
            <div className="section-content">
              <p><strong>MRR:</strong> ${account.mrr.toLocaleString()}</p>
              <p><strong>Growth in MRR:</strong> ${account.growthInMrr.toLocaleString()}</p>
              <p><strong>Potential MRR:</strong> ${account.potentialMrr.toLocaleString()}</p>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <ChartBarIcon className="section-icon" />
              <h3>Points & Delivery</h3>
            </div>
            <div className="section-content">
              <p><strong>Points Purchased:</strong> {account.pointsPurchased}</p>
              <p><strong>Points Delivered:</strong> {account.pointsDelivered}</p>
              <p><strong>Recurring Points:</strong> {account.recurringPointsAllotment}</p>
              <p><strong>Points Striking Distance:</strong> {account.pointsStrikingDistance}</p>
              <p><strong>Delivery Status:</strong> {determineDeliveryStatus(account.pointsStrikingDistance)}</p>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <ChartBarIcon className="section-icon" />
              <h3>Goals</h3>
            </div>
            <div className="section-content">
              {account.goals && account.goals.length > 0 ? (
                <table className="goals-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Due Date</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.goals.map((goal: Goal, index: number) => (
                      <tr key={index}>
                        <td>{goal.description}</td>
                        <td>{new Date(goal.dueDate).toLocaleDateString()}</td>
                        <td className="progress-cell">
                          <div className="goal-progress">
                            <div className="progress-bar">
                              <div 
                                className="progress-fill"
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                            <span className="progress-text">{goal.progress}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No goals set</p>
              )}
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <BuildingLibraryIcon className="section-icon" />
              <h3>Company Information</h3>
            </div>
            <div className="section-content">
              <p><strong>Industry:</strong> {account.industry}</p>
              <p><strong>Annual Revenue:</strong> ${account.annualRevenue.toLocaleString()}</p>
              <p><strong>Employees:</strong> {account.employees}</p>
              {account.website && <p><strong>Website:</strong> <a href={account.website} target="_blank" rel="noopener noreferrer">{account.website}</a></p>}
              {account.linkedinProfile && <p><strong>LinkedIn:</strong> <a href={account.linkedinProfile} target="_blank" rel="noopener noreferrer">View Profile</a></p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AccountModal }; 