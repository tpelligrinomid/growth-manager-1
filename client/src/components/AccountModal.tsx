import React, { useState, useEffect } from 'react';
import { AccountResponse, Goal } from '../types';
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
import { syncAccountWithBigQuery } from '../utils/bigQuerySync';

interface Props {
  account: AccountResponse;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onUpdate?: (updatedAccount: AccountResponse) => void;
}

const AccountModal: React.FC<Props> = ({ account, isOpen, onClose, onEdit, onUpdate }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(account);

  useEffect(() => {
    setCurrentAccount(account);
  }, [account]);

  if (!isOpen) return null;

  // Helper function to safely parse dates and format as MM/DD/YYYY
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'No due date';
    try {
      // First convert YYYY/MM/DD to YYYY-MM-DD for proper Date parsing
      const cleanDateStr = dateStr.replace(/\//g, '-');
      const date = new Date(cleanDateStr);
      
      // Check if date is invalid
      if (isNaN(date.getTime())) {
        // Try parsing the date directly from YYYY/MM/DD format
        const [year, month, day] = dateStr.split('/').map(Number);
        if (!year || !month || !day) return 'Invalid date';
        
        return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}/${year}`;
      }
      
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    } catch (e) {
      console.error('Error formatting date:', dateStr, e);
      return 'Invalid date';
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const updatedAccount = await syncAccountWithBigQuery(currentAccount);
      setCurrentAccount(updatedAccount);
      if (onUpdate) {
        onUpdate(updatedAccount);
      }
    } catch (error) {
      console.error('Error syncing account:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const calculateClientTenure = (relationshipStartDate: string): number => {
    try {
      const startDate = new Date(relationshipStartDate);
      const endDate = new Date();
      const tenure = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      return tenure;
    } catch (e) {
      return 0;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{currentAccount.accountName}</h2>
          <div className="modal-actions">
            <button 
              onClick={handleSync} 
              className={`sync-button ${isSyncing ? 'syncing' : ''}`} 
              disabled={isSyncing}
              title="Sync with ClickUp"
            >
              <ArrowPathIcon className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
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
              <p><strong>Business Unit:</strong> {currentAccount.businessUnit}</p>
              <p><strong>Engagement Type:</strong> {formatEngagementType(currentAccount.engagementType)}</p>
              <p><strong>Priority:</strong> {formatPriority(currentAccount.priority)}</p>
              <p><strong>Account Manager:</strong> {currentAccount.accountManager}</p>
              <p><strong>Team Manager:</strong> {currentAccount.teamManager}</p>
              <p><strong>Services:</strong> {currentAccount.services.join(', ')}</p>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <DocumentTextIcon className="section-icon" />
              <h3>Contract Details</h3>
            </div>
            <div className="section-content">
              <p><strong>Relationship Start:</strong> {formatDate(currentAccount.relationshipStartDate)}</p>
              <p><strong>Contract Start:</strong> {formatDate(currentAccount.contractStartDate)}</p>
              <p><strong>Contract Renewal:</strong> {formatDate(currentAccount.contractRenewalEnd)}</p>
              <p><strong>Client Tenure:</strong> {calculateClientTenure(currentAccount.relationshipStartDate)} months</p>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <CurrencyDollarIcon className="section-icon" />
              <h3>Financial Information</h3>
            </div>
            <div className="section-content">
              <p><strong>MRR:</strong> ${currentAccount.mrr.toLocaleString()}</p>
              <p><strong>Growth in MRR:</strong> ${currentAccount.growthInMrr.toLocaleString()}</p>
              <p><strong>Potential MRR:</strong> ${currentAccount.potentialMrr.toLocaleString()}</p>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <ChartBarIcon className="section-icon" />
              <h3>Points & Delivery</h3>
            </div>
            <div className="section-content">
              <p><strong>Points Purchased:</strong> {currentAccount.pointsPurchased}</p>
              <p><strong>Points Delivered:</strong> {currentAccount.pointsDelivered}</p>
              <p><strong>Recurring Points:</strong> {currentAccount.recurringPointsAllotment}</p>
              <p><strong>Points Striking Distance:</strong> {currentAccount.pointsStrikingDistance}</p>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <ChartBarIcon className="section-icon" />
              <h3>Goals</h3>
            </div>
            <div className="section-content">
              <table className="goals-table">
                <thead>
                  <tr>
                    <th>Description (Task Name)</th>
                    <th>Due Date</th>
                    <th>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAccount.goals
                    ?.filter(goal => {
                      // Show goal if:
                      // 1. Due date is in the future, OR
                      // 2. Progress is less than 100%
                      return new Date(goal.due_date) > new Date() || (goal.progress ?? 0) < 100;
                    })
                    .map((goal: Goal) => (
                    <tr key={goal.id}>
                      <td>{goal.task_name}</td>
                      <td>{formatDate(goal.due_date)}</td>
                      <td className="progress-cell">
                        <div className="goal-progress">
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${new Date(goal.due_date) < new Date() && (goal.progress ?? 0) < 100 ? 'overdue' : ''}`}
                              style={{ width: `${goal.progress ?? 0}%` }}
                            />
                          </div>
                          <span className="progress-text">{(goal.progress ?? 0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!currentAccount.goals || currentAccount.goals.length === 0) && (
                    <tr>
                      <td colSpan={3}>No goals found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <BuildingLibraryIcon className="section-icon" />
              <h3>Company Information</h3>
            </div>
            <div className="section-content">
              <p><strong>Industry:</strong> {currentAccount.industry}</p>
              <p><strong>Annual Revenue:</strong> ${currentAccount.annualRevenue.toLocaleString()}</p>
              <p><strong>Employees:</strong> {currentAccount.employees}</p>
              {currentAccount.website && <p><strong>Website:</strong> <a href={currentAccount.website} target="_blank" rel="noopener noreferrer">{currentAccount.website}</a></p>}
              {currentAccount.linkedinProfile && <p><strong>LinkedIn:</strong> <a href={currentAccount.linkedinProfile} target="_blank" rel="noopener noreferrer">View Profile</a></p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountModal; 