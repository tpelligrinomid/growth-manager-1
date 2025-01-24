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
import { API_URL } from '../config/api';
import { determineDeliveryStatus } from '../utils/calculations';

interface Props {
  account: AccountResponse;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onUpdate?: (updatedAccount: AccountResponse) => void;
}

const AccountModal: React.FC<Props> = ({ account, isOpen, onClose, onEdit, onUpdate }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
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
    const folderId = currentAccount.clientFolderId;
    if (!folderId) {
      setSyncError('No ClickUp Folder ID available');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);
    
    try {
      // 1. Fetch BigQuery data
      console.log('1. Fetching BigQuery data for folder:', folderId);
      const response = await fetch(`${API_URL}/api/bigquery/account/${folderId}`);
      
      if (!response.ok) throw new Error(response.statusText);
      
      const data = await response.json();
      console.log('2. BigQuery data received:', data);
      
      // 2. Prepare update data - with validation
      const updateData = {
        accountName: data.clientData?.[0]?.client_name || currentAccount.accountName,
        businessUnit: 'NEW_NORTH' as const, // Force type as const
        accountManager: data.clientData?.[0]?.assignee || currentAccount.accountManager,
        teamManager: data.clientData?.[0]?.team_lead || currentAccount.teamManager,
        relationshipStartDate: data.clientData?.[0]?.original_contract_start_date ? 
          new Date(data.clientData[0].original_contract_start_date.replace('/', '-')) : currentAccount.relationshipStartDate,
        contractStartDate: data.clientData?.[0]?.points_mrr_start_date ? 
          new Date(data.clientData[0].points_mrr_start_date.replace('/', '-')) : currentAccount.contractStartDate,
        contractRenewalEnd: data.clientData?.[0]?.contract_renewal_end ? 
          new Date(data.clientData[0].contract_renewal_end.replace('/', '-')) : currentAccount.contractRenewalEnd,
        pointsPurchased: data.points?.[0]?.points_purchased ? 
          Number(data.points[0].points_purchased.replace(/,/g, '')) : currentAccount.pointsPurchased,
        pointsDelivered: data.points?.[0]?.points_delivered ? 
          Number(data.points[0].points_delivered.replace(/,/g, '')) : currentAccount.pointsDelivered,
        recurringPointsAllotment: data.clientData?.[0]?.recurring_points_allotment ? 
          Number(data.clientData[0].recurring_points_allotment.replace(/,/g, '')) : currentAccount.recurringPointsAllotment,
        mrr: data.clientData?.[0]?.mrr ? 
          Number(data.clientData[0].mrr.replace(/,/g, '')) : currentAccount.mrr,
        goals: data.goals?.map((goal: any) => ({
          id: goal.id,
          description: goal.task_description || '',
          task_name: goal.task_name || '',
          dueDate: goal.due_date || '',
          progress: Number(goal.progress) || 0,
          status: goal.status || ''
        }))
      };
      
      // Remove these fields as they're not in our Prisma schema
      delete (updateData as any).points;
      delete (updateData as any).growthTasks;
      delete (updateData as any).clientData;
      delete (updateData as any).pointsBalance;
      delete (updateData as any).averageMrr;
      delete (updateData as any).tasks;
      delete (updateData as any).clientContacts;
      
      console.log('3. Update data prepared:', updateData);

      // 3. Update account
      const updateResponse = await fetch(`${API_URL}/api/accounts/${currentAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Update failed:', errorData);
        throw new Error(errorData.details || 'Failed to update account');
      }

      const { data: updatedAccount } = await updateResponse.json();
      console.log('Update successful:', updatedAccount);

      // Update local state
      setCurrentAccount(updatedAccount);
      
      // Notify parent component
      if (onUpdate) {
        onUpdate(updatedAccount);
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError(error instanceof Error ? error.message : 'Failed to sync');
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

  // Filter goals to only show:
  // 1. Future goals (any status)
  // 2. Past goals that are not closed
  const filteredGoals = currentAccount.goals?.filter(goal => {
    if (!goal.dueDate || !goal.status) return true;
    
    try {
      const dueDate = new Date(goal.dueDate.replace(/\//g, '-'));
      const now = new Date();
      
      // Show if:
      // 1. Due date is invalid (can't parse the date), OR
      // 2. Due date is in the future, OR
      // 3. Goal is not closed (regardless of due date)
      return isNaN(dueDate.getTime()) || dueDate > now || goal.status.toLowerCase() !== 'closed';
    } catch (e) {
      // If there's any error parsing the date, show the goal
      return true;
    }
  }) || [];

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
              <p><strong>Delivery Status:</strong> {determineDeliveryStatus(currentAccount.pointsStrikingDistance)}</p>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <ChartBarIcon className="section-icon" />
              <h3>Goals</h3>
            </div>
            <div className="section-content">
              {filteredGoals.length > 0 ? (
                <table className="goals-table">
                  <thead>
                    <tr>
                      <th>Description (Task Name)</th>
                      <th>Due Date</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGoals.map((goal: Goal, index: number) => (
                      <tr key={index}>
                        <td>{goal.task_name}</td>
                        <td>{formatDate(goal.dueDate)}</td>
                        <td className="progress-cell">
                          <div className="goal-progress">
                            <div className="progress-bar">
                              <div 
                                className={`progress-fill ${goal.dueDate && new Date(goal.dueDate.replace(/\//g, '-')) < new Date() && goal.status.toLowerCase() !== 'closed' ? 'overdue' : ''}`}
                                style={{ width: `${goal.progress || 0}%` }}
                              />
                            </div>
                            <span className="progress-text">{goal.progress || 0}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No active goals</p>
              )}
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