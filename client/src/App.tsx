import { useEffect, useState } from 'react';
import { AccountResponse } from './types';
import { AccountModal } from './components/AccountModal';
import './App.css';

function App() {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponse | null>(null);

  useEffect(() => {
    fetch('http://localhost:3002/api/accounts')
      .then(res => res.json())
      .then(data => setAccounts(data.data));
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Growth Manager</h1>
      </header>
      <main className="app-content">
        <div className="accounts-section">
          <h2>Accounts</h2>
          <table className="accounts-table">
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Business Unit</th>
                <th>Engagement Type</th>
                <th>Priority</th>
                <th>Account Manager</th>
                <th>MRR</th>
                <th>Recurring Points</th>
                <th>Points Purchased</th>
                <th>Points Delivered</th>
                <th>Striking Distance</th>
                <th>Delivery</th>
                <th>Goals</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr 
                  key={account.id} 
                  onClick={() => setSelectedAccount(account)}
                >
                  <td>{account.accountName}</td>
                  <td>{account.businessUnit}</td>
                  <td>{account.engagementType}</td>
                  <td>{account.priority}</td>
                  <td>{account.accountManager}</td>
                  <td>${account.mrr.toLocaleString()}</td>
                  <td>{account.recurringPointsAllotment}</td>
                  <td>{account.pointsPurchased}</td>
                  <td>{account.pointsDelivered}</td>
                  <td>{account.pointsStrikingDistance}</td>
                  <td>{account.delivery}</td>
                  <td>{account.goals?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      
      {selectedAccount && (
        <AccountModal
          account={selectedAccount}
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  );
}

export default App;
