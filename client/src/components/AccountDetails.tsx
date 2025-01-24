import React from 'react';
import { AccountResponse } from '../types';
import { determineDeliveryStatus } from '../utils/calculations';

interface Props {
  account: AccountResponse;
}

export const AccountDetails: React.FC<Props> = ({ account }) => {
  return (
    <div className="account-details">
      <div className="account-header">
        <h3>{account.accountName}</h3>
        <div className="account-meta">
          <span className="business-unit">{account.businessUnit}</span>
          <span className="status">{account.delivery}</span>
        </div>
      </div>
      <div className="account-body">
        <div className="metrics">
          <div className="metric">
            <label>MRR</label>
            <span>${account.mrr.toLocaleString()}</span>
          </div>
          <div className="metric">
            <label>Points</label>
            <span>{account.pointsDelivered}/{account.pointsPurchased}</span>
          </div>
          <div className="metric">
            <label>Delivery</label>
            <span>{determineDeliveryStatus(account.pointsStrikingDistance)}</span>
          </div>
        </div>
        <div className="services">
          {account.services.map(service => (
            <span key={service} className="service-tag">{service}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
