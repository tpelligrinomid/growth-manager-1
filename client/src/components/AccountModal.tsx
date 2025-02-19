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
  TrashIcon,
} from '@heroicons/react/24/outline';
import { formatEngagementType, formatPriority } from '../utils/formatters';
import { syncAccountWithBigQuery } from '../utils/bigQuerySync';
import { API_URL } from '../config/api';

interface Props {
  account: AccountResponse;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onUpdate?: (updatedAccount: AccountResponse) => void;
  onDelete?: () => void;
}

const AccountModal: React.FC<Props> = ({ account, isOpen, onClose, onEdit, onUpdate, onDelete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(account);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = localStorage.getItem('token');
  const userRole = token ? JSON.parse(atob(token.split('.')[1])).role : null;
  
  console.log('Current user role:', userRole); // Debug log

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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/accounts/${currentAccount.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setShowDeleteConfirmation(false);
      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
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
              {userRole === 'ADMINISTRATOR' && (
                <button 
                  onClick={() => setShowDeleteConfirmation(true)} 
                  className="delete-button" 
                  title="Delete Account"
                >
                  <TrashIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              )}
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
                        // More detailed debug logging
                        console.log('Goal Details:', {
                          name: goal.task_name,
                          status: goal.status,
                          statusLength: goal.status?.length,
                          statusCharCodes: [...(goal.status || '')].map(c => c.charCodeAt(0)),
                          progress: goal.progress
                        });
                        
                        // Hide goals if:
                        // 1. Status is Complete/Closed regardless of progress
                        const upperStatus = goal.status?.toUpperCase();
                        if (upperStatus === 'COMPLETE' || upperStatus === 'CLOSED') {
                          console.log('Filtering out goal due to status:', goal.status);
                          return false;
                        }
                        
                        // 2. Hide if 100% complete and past due
                        const isDueInPast = new Date(goal.due_date) < new Date();
                        if (isDueInPast && (goal.progress ?? 0) === 100) {
                          console.log('Filtering out goal due to completion and due date');
                          return false;
                        }
                        
                        // 3. Show all other goals
                        return true;
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="modal-overlay confirmation-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Delete Account</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this account and its data from Growth Manager?</p>
              <div className="confirmation-actions">
                <button 
                  onClick={() => setShowDeleteConfirmation(false)} 
                  className="button-secondary"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete} 
                  className="button-danger"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountModal; 