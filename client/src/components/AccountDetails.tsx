import React from 'react';
import { AccountResponse } from '../types';

interface Props {
  account: AccountResponse;
}

export const AccountDetails: React.FC<Props> = ({ account }) => {
  return (
    <div className="account-card">
      <h2>{account.accountName}</h2>
      <div className="account-info">
        <p>Business Unit: {account.businessUnit}</p>
        <p>Engagement Type: {account.engagementType}</p>
        <p>Priority: {account.priority}</p>
        <p>Client Tenure: {account.clientTenure} months</p>
        <p>Points Balance: {account.pointsBalance}</p>
      </div>
    </div>
  );
};
