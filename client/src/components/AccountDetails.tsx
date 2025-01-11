import React from 'react';
import { AccountResponse } from '../types';

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
    <div className="account-card">
      <h2>{account.accountName}</h2>
      <div className="account-info">
        <p>Business Unit: {account.businessUnit}</p>
        <p>Engagement Type: {account.engagementType}</p>
        <p>Priority: {account.priority}</p>
        <p>Client Tenure: {clientTenure} months</p>
        <p>Points Balance: {account.pointsPurchased - account.pointsDelivered}</p>
      </div>
    </div>
  );
};
