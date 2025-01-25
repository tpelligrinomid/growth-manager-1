import './AccountsView.css';
import { useState } from 'react';
import { DocumentIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { AccountResponse } from '../types';

interface Props {
  accounts: AccountResponse[];
}

export const AccountsView: React.FC<Props> = ({ accounts }) => {
  const [currentView, setCurrentView] = useState('manager');
  
  // Calculate total and average MRR
  const totalMRR = accounts.reduce((sum: number, account: AccountResponse) => sum + account.mrr, 0);
  const averageMRR = Math.round(totalMRR / accounts.length);

  return (
    <div className="accounts-view">
      <div className="view-toggle-container">
        <button 
          className={currentView === 'manager' ? 'active' : ''} 
          onClick={() => setCurrentView('manager')}
        >
          <DocumentIcon className="h-5 w-5 inline-block mr-2" />
          Manager
        </button>
        <button 
          className={currentView === 'finance' ? 'active' : ''} 
          onClick={() => setCurrentView('finance')}
        >
          <CurrencyDollarIcon className="h-5 w-5 inline-block mr-2" />
          Finance
        </button>
      </div>

      <div className="metrics-container">
        <div className="metric-card">
          <h3>Total MRR</h3>
          <p>${totalMRR.toLocaleString()}</p>
        </div>
        
        <div className="metric-card">
          <h3>Average MRR</h3>
          <p>${averageMRR.toLocaleString()}</p>
        </div>
      </div>
      
      {/* ... rest of the component ... */}
    </div>
  );
}; 