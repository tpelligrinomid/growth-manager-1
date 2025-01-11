import { AccountResponse } from '../types';

interface Props {
  account: AccountResponse;
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<Props> = ({ account, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{account.accountName}</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          <div className="detail-group">
            <h3>Basic Information</h3>
            <p><strong>Business Unit:</strong> {account.businessUnit}</p>
            <p><strong>Engagement Type:</strong> {account.engagementType}</p>
            <p><strong>Priority:</strong> {account.priority}</p>
            <p><strong>Account Manager:</strong> {account.accountManager}</p>
            <p><strong>Team Manager:</strong> {account.teamManager}</p>
          </div>
          
          <div className="detail-group">
            <h3>Contract Details</h3>
            <p><strong>Relationship Start:</strong> {new Date(account.relationshipStartDate).toLocaleDateString()}</p>
            <p><strong>Contract Start:</strong> {new Date(account.contractStartDate).toLocaleDateString()}</p>
            <p><strong>Contract Renewal:</strong> {new Date(account.contractRenewalEnd).toLocaleDateString()}</p>
            <p><strong>Client Tenure:</strong> {account.clientTenure} months</p>
          </div>

          <div className="detail-group">
            <h3>Financial Information</h3>
            <p><strong>MRR:</strong> ${account.mrr.toLocaleString()}</p>
            <p><strong>Growth in MRR:</strong> ${account.growthInMrr.toLocaleString()}</p>
            <p><strong>Potential MRR:</strong> ${account.potentialMrr.toLocaleString()}</p>
          </div>

          <div className="detail-group">
            <h3>Points & Delivery</h3>
            <p><strong>Points Purchased:</strong> {account.pointsPurchased}</p>
            <p><strong>Points Delivered:</strong> {account.pointsDelivered}</p>
            <p><strong>Points Balance:</strong> {account.pointsBalance}</p>
            <p><strong>Recurring Points:</strong> {account.recurringPointsAllotment}</p>
            <p><strong>Delivery Status:</strong> {account.delivery}</p>
          </div>

          <div className="detail-group">
            <h3>Company Information</h3>
            <p><strong>Industry:</strong> {account.industry}</p>
            <p><strong>Annual Revenue:</strong> ${account.annualRevenue.toLocaleString()}</p>
            <p><strong>Employees:</strong> {account.employees}</p>
            {account.website && <p><strong>Website:</strong> <a href={account.website} target="_blank" rel="noopener noreferrer">{account.website}</a></p>}
            {account.linkedinProfile && <p><strong>LinkedIn:</strong> <a href={account.linkedinProfile} target="_blank" rel="noopener noreferrer">View Profile</a></p>}
          </div>
        </div>
      </div>
    </div>
  );
}; 