import { useEffect, useState } from 'react';
import { AccountResponse } from './types';
import { PlusIcon } from '@heroicons/react/24/outline';
import './App.css';
import { AccountModal } from './components/AccountModal';
import { AddAccountModal } from './components/AddAccountModal';
import { EditAccountModal } from './components/EditAccountModal';
import { formatBusinessUnit, formatEngagementType, formatPriority, formatDelivery } from './utils/formatters';
import { Filters } from './components/Filters';

function App() {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountResponse | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    businessUnit: '',
    engagementType: '',
    priority: '',
    delivery: '',
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AccountResponse | null;
    direction: 'asc' | 'desc' | null;
  }>({
    key: null,
    direction: null
  });

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        console.log('Fetching accounts...');
        const response = await fetch('/api/accounts');
        console.log('Response:', response);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server error:', errorData);
          throw new Error(`Failed to fetch accounts: ${errorData.error || 'Unknown error'}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        setAccounts(data.data);
        setError(null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setError(error instanceof Error ? error.message : 'Failed to load accounts');
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleAddAccount = async (accountData: any) => {
    try {
      console.log('Sending account data:', accountData);
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error('Failed to create account');
      }

      const result = await response.json();
      console.log('Server response:', result);
      setAccounts(prevAccounts => [...prevAccounts, result.data]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const handleEditAccount = async (accountData: any) => {
    try {
      const response = await fetch(`/api/accounts/${accountData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        throw new Error('Failed to update account');
      }

      const result = await response.json();
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => 
          acc.id === result.data.id ? result.data : acc
        )
      );
      setIsEditModalOpen(false);
      setSelectedAccount(null);  // Close the detail modal too
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const filteredAccounts = accounts.filter(account => {
    return (
      (!filters.businessUnit || account.businessUnit === filters.businessUnit) &&
      (!filters.engagementType || account.engagementType === filters.engagementType) &&
      (!filters.priority || account.priority === filters.priority) &&
      (!filters.delivery || account.delivery === filters.delivery)
    );
  });

  const handleSort = (key: keyof AccountResponse) => {
    setSortConfig(current => {
      if (current.key === key) {
        // Toggle direction if same key
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      // Default to ascending for new key
      return {
        key,
        direction: 'asc'
      };
    });
  };

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;

    // Handle calculated fields
    if (sortConfig.key === 'pointsBalance') {
      const aBalance = a.pointsPurchased - a.pointsDelivered;
      const bBalance = b.pointsPurchased - b.pointsDelivered;
      return sortConfig.direction === 'asc' ? aBalance - bBalance : bBalance - aBalance;
    }

    // Handle regular fields
    const aValue = a[sortConfig.key as keyof AccountResponse];
    const bValue = b[sortConfig.key as keyof AccountResponse];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    }

    return 0;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Growth Manager</h1>
        <button className="add-account-button" onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="button-icon" />
          Add Account
        </button>
      </header>
      <main className="app-content">
        {isLoading ? (
          <div>Loading accounts...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="accounts-section">
            <h2>Accounts</h2>
            <Filters
              businessUnit={filters.businessUnit}
              engagementType={filters.engagementType}
              priority={filters.priority}
              delivery={filters.delivery}
              onFilterChange={handleFilterChange}
            />
            <table className="accounts-table">
              <thead>
                <tr>
                  <th 
                    onClick={() => handleSort('accountName')} 
                    className={`sortable-header ${sortConfig.key === 'accountName' ? 'sort-active' : ''}`}
                  >
                    Account Name
                    {sortConfig.key === 'accountName' && (
                      <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('businessUnit')} className="sortable-header">
                    Business Unit
                    {sortConfig.key === 'businessUnit' && (
                      <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th>Engagement Type</th>
                  <th>Priority</th>
                  <th onClick={() => handleSort('accountManager')} className="sortable-header">
                    Account Manager
                    {sortConfig.key === 'accountManager' && (
                      <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort('mrr')} className="sortable-header">
                    MRR
                    {sortConfig.key === 'mrr' && (
                      <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th>Recurring Points</th>
                  <th>Points Purchased</th>
                  <th>Points Delivered</th>
                  <th>
                    <div className="header-with-tooltip">
                      Points Balance
                      <span className="tooltip">
                        Points Purchased - Points Delivered
                      </span>
                    </div>
                  </th>
                  <th onClick={() => handleSort('pointsStrikingDistance')} className="sortable-header">
                    Striking Distance
                    {sortConfig.key === 'pointsStrikingDistance' && (
                      <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </th>
                  <th>
                    <div className="header-with-tooltip">
                      Delivery
                      <span className="tooltip">
                        Based on Striking Distance:<br />
                        • Off Track if &gt; 0<br />
                        • On Track if ≤ 0
                      </span>
                    </div>
                  </th>
                  <th>Goals</th>
                </tr>
              </thead>
              <tbody>
                {sortedAccounts.map(account => (
                  <tr 
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                    className="account-row"
                  >
                    <td>{account.accountName}</td>
                    <td>{formatBusinessUnit(account.businessUnit)}</td>
                    <td>{formatEngagementType(account.engagementType)}</td>
                    <td className={`priority-tier${account.priority.replace('TIER_', '')}`}>
                      {formatPriority(account.priority)}
                    </td>
                    <td>{account.accountManager}</td>
                    <td>${account.mrr.toLocaleString()}</td>
                    <td>{account.recurringPointsAllotment}</td>
                    <td>{account.pointsPurchased}</td>
                    <td>{account.pointsDelivered}</td>
                    <td>{account.pointsPurchased - account.pointsDelivered}</td>
                    <td>{account.pointsStrikingDistance}</td>
                    <td className={`delivery-${account.delivery.toLowerCase().replace('_', '-')}`}>
                      {formatDelivery(account.delivery)}
                    </td>
                    <td>{account.goals?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      {selectedAccount && (
        <AccountModal
          account={selectedAccount}
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onEdit={() => setIsEditModalOpen(true)}
        />
      )}
      {isAddModalOpen && (
        <AddAccountModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddAccount}
        />
      )}
      {isEditModalOpen && selectedAccount && (
        <EditAccountModal
          account={selectedAccount}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditAccount}
        />
      )}
    </div>
  );
}

export default App;
