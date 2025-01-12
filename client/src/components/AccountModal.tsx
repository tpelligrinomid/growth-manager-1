import { AccountResponse } from '../types';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { formatBusinessUnit, formatEngagementType, formatPriority } from '../utils/formatters';

interface Props {
  account: AccountResponse;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const AccountModal: React.FC<Props> = ({ account, isOpen, onClose, onEdit }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{account.accountName}</h2>
          <div className="modal-actions">
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
              <p><strong>Business Unit:</strong> {formatBusinessUnit(account.businessUnit)}</p>
              <p><strong>Engagement Type:</strong> {formatEngagementType(account.engagementType)}</p>
              <p><strong>Priority:</strong> {formatPriority(account.priority)}</p>
              <p><strong>Account Manager:</strong> {account.accountManager}</p>
              <p><strong>Team Manager:</strong> {account.teamManager}</p>
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
              <p><strong>Points Balance:</strong> {account.pointsPurchased - account.pointsDelivered}</p>
              <p><strong>Recurring Points:</strong> {account.recurringPointsAllotment}</p>
              <p><strong>Delivery Status:</strong> {account.delivery}</p>
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
                    {account.goals.map((goal, index) => (
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