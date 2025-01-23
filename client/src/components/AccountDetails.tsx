import React from 'react';
import { AccountResponse } from '../types';
import { determineDeliveryStatus } from '../utils/calculations';

interface Props {
  account: AccountResponse;
}

export const AccountDetails: React.FC<Props> = ({ account }) => {
  const calculateClientTenure = (startDate: string): number => {
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30.44); // Average days in a month
  };

  const clientTenure = calculateClientTenure(account.relationshipStartDate);

  return (
    <div className="account-details">
      <div className="account-header">
        <h3>{account.accountName}</h3>
        <div className="account-meta">
          <span className="business-unit">{account.businessUnit}</span>
          <span className="status">{account.status}</span>
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
