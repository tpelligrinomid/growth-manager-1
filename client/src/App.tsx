import { useEffect, useState } from 'react';
import { AccountResponse } from './types';
import { PlusIcon } from '@heroicons/react/24/outline';
import './App.css';
import { AccountModal } from './components/AccountModal';
import { AddAccountModal } from './components/AddAccountModal';
import { EditAccountModal } from './components/EditAccountModal';
import { formatBusinessUnit, formatEngagementType, formatPriority, formatDelivery } from './utils/formatters';
import { Filters } from './components/Filters';
import { PieChart } from './components/PieChart';
import { ClipboardDocumentListIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { GoalProgress } from './components/GoalProgress';

// Fix the type definition
type ViewType = 'manager' | 'finance';

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
  const [currentView, setCurrentView] = useState<ViewType>('manager');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        console.log('Fetching accounts...');
        const response = await fetch('/api/accounts');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text(); // Get the raw response text first
        console.log('Raw response:', text);
        
        let data;
        try {
          data = JSON.parse(text); // Try to parse it
        } catch (e) {
          console.error('JSON parse error:', e);
          throw new Error('Invalid JSON response from server');
        }
        
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

  const filteredAccounts = accounts.filter(account => {
    return (
      (!filters.businessUnit || account.businessUnit === filters.businessUnit) &&
      (!filters.engagementType || account.engagementType === filters.engagementType) &&
      (!filters.priority || account.priority === filters.priority) &&
      (!filters.delivery || account.delivery === filters.delivery)
    );
  });

  useEffect(() => {
    // Add 'changed' class when filters change
    const elements = document.querySelectorAll('.metric-value');
    elements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.classList.add('changed');
        setTimeout(() => el.classList.remove('changed'), 300);
      }
    });
  }, [filters]); // Only depend on filters changes

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

  const calculatePercentage = (part: number, total: number) => {
    if (total === 0 || !total) return 0;
    return Math.round((part / total) * 100);
  };

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
            <div className="metrics-summary">
              <div className="metric-card">
                <div className="metric-label">Total Accounts</div>
                <div className="metric-value">
                  <div>{filteredAccounts.length}</div>
                </div>
              </div>
              <div className="metric-card warning">
                <div className="metric-label">Accounts Off Track</div>
                <div className="metric-value">
                  <div>{filteredAccounts.filter(account => account.delivery === 'OFF_TRACK').length}</div>
                </div>
              </div>
              <div className="metric-card warning">
                <div className="metric-label">% Off Track</div>
                <div className="metric-value">
                  <PieChart 
                    percentage={calculatePercentage(
                      filteredAccounts.filter(account => account.delivery === 'OFF_TRACK').length,
                      filteredAccounts.length
                    )} 
                  />
                  <span>
                    {calculatePercentage(
                      filteredAccounts.filter(account => account.delivery === 'OFF_TRACK').length,
                      filteredAccounts.length
                    )}%
                  </span>
                </div>
              </div>
              <div className="metric-card priority">
                <div className="metric-label">Tier 1 Accounts</div>
                <div className="metric-value">
                  <div>{filteredAccounts.filter(account => account.priority === 'TIER_1').length}</div>
                </div>
              </div>
              <div className="metric-card priority">
                <div className="metric-label">% Tier 1</div>
                <div className="metric-value">
                  <PieChart 
                    percentage={calculatePercentage(
                      filteredAccounts.filter(account => account.priority === 'TIER_1').length,
                      filteredAccounts.length
                    )} 
                  />
                  <span>
                    {calculatePercentage(
                      filteredAccounts.filter(account => account.priority === 'TIER_1').length,
                      filteredAccounts.length
                    )}%
                  </span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Average MRR</div>
                <div className="metric-value">
                  <div>
                    ${filteredAccounts.length > 0 
                      ? Math.round(
                          filteredAccounts.reduce((sum, account) => {
                            // Ensure we're working with a clean number
                            const mrrValue = parseInt(account.mrr.toString().replace(/[$,]/g, ''));
                            return sum + (isNaN(mrrValue) ? 0 : mrrValue);
                          }, 0) / filteredAccounts.length
                        ).toLocaleString()
                      : 0}
                  </div>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Average Striking Distance</div>
                <div className="metric-value">
                  <div>
                    {filteredAccounts.length > 0
                      ? Math.round(
                          filteredAccounts.reduce((sum, account) => {
                            // Ensure we're working with clean numbers
                            const strikingDistance = Number(account.pointsStrikingDistance) || 0;
                            return sum + strikingDistance;
                          }, 0) / filteredAccounts.length
                        )
                      : 0}
                  </div>
                </div>
              </div>
            </div>
            <div className="filters-container">
              <div className="filters-section">
                <div className="view-controls">
                  <button 
                    className={`view-button ${currentView === 'manager' ? 'active' : ''}`}
                    onClick={() => setCurrentView('manager')}
                  >
                    <ClipboardDocumentListIcon className="h-5 w-5" aria-hidden="true" />
                    <span>Manager</span>
                  </button>
                  <button 
                    className={`view-button ${currentView === 'finance' ? 'active' : ''}`}
                    onClick={() => setCurrentView('finance')}
                  >
                    <BanknotesIcon className="h-5 w-5" aria-hidden="true" />
                    <span>Finance</span>
                  </button>
                </div>
                <div className="filters-group">
                  <Filters
                    businessUnit={filters.businessUnit}
                    engagementType={filters.engagementType}
                    priority={filters.priority}
                    delivery={filters.delivery}
                    onFilterChange={handleFilterChange}
                    currentView={currentView}
                  />
                </div>
              </div>
            </div>
            <table className="accounts-table">
              <thead>
                <tr>
                  {currentView === 'manager' ? (
                    <>
                      <th 
                        onClick={() => handleSort('accountName')} 
                        className={`sortable-header ${sortConfig.key === 'accountName' ? 'sort-active' : ''}`}
                      >
                        Account Name
                        {sortConfig.key === 'accountName' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th 
                        onClick={() => handleSort('businessUnit')} 
                        className={`sortable-header ${sortConfig.key === 'businessUnit' ? 'sort-active' : ''}`}
                      >
                        Business Unit
                        {sortConfig.key === 'businessUnit' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th>Engagement Type</th>
                      <th>
                        <div className="header-with-tooltip">
                          Priority
                          <span className="tooltip">
                            • Tier 1 = Actively working<br/>
                            • Tier 2 = Client or delivery issues<br/>
                            • Tier 3 = Smooth<br/>
                            • Tier 4 = Low risk and low reward
                          </span>
                        </div>
                      </th>
                      <th 
                        onClick={() => handleSort('accountManager')} 
                        className={`sortable-header ${sortConfig.key === 'accountManager' ? 'sort-active' : ''}`}
                      >
                        Account Manager
                        {sortConfig.key === 'accountManager' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th 
                        onClick={() => handleSort('mrr')} 
                        className={`sortable-header ${sortConfig.key === 'mrr' ? 'sort-active' : ''}`}
                      >
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
                      <th 
                        onClick={() => handleSort('pointsStrikingDistance')} 
                        className={`sortable-header ${sortConfig.key === 'pointsStrikingDistance' ? 'sort-active' : ''}`}
                      >
                        <div className="header-with-tooltip">
                          Striking Distance
                          <span className="tooltip">
                            Points Balance - (1.5 × Recurring Points)<br/>
                            Positive = Off Track, Negative = On Track
                          </span>
                        </div>
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
                    </>
                  ) : (
                    <>
                      <th 
                        onClick={() => handleSort('accountName')} 
                        className={`sortable-header ${sortConfig.key === 'accountName' ? 'sort-active' : ''}`}
                      >
                        Account Name
                        {sortConfig.key === 'accountName' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th 
                        onClick={() => handleSort('businessUnit')}
                        className={`sortable-header ${sortConfig.key === 'businessUnit' ? 'sort-active' : ''}`}
                      >
                        Business Unit
                        {sortConfig.key === 'businessUnit' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th>Engagement Type</th>
                      <th>Priority</th>
                      <th 
                        onClick={() => handleSort('mrr')}
                        className={`sortable-header ${sortConfig.key === 'mrr' ? 'sort-active' : ''}`}
                      >
                        MRR
                        {sortConfig.key === 'mrr' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th 
                        onClick={() => handleSort('growthInMrr')}
                        className={`sortable-header ${sortConfig.key === 'growthInMrr' ? 'sort-active' : ''}`}
                      >
                        Growth in MRR
                        {sortConfig.key === 'growthInMrr' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th 
                        onClick={() => handleSort('potentialMrr')}
                        className={`sortable-header ${sortConfig.key === 'potentialMrr' ? 'sort-active' : ''}`}
                      >
                        Potential MRR
                        {sortConfig.key === 'potentialMrr' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th 
                        onClick={() => handleSort('relationshipStartDate')}
                        className={`sortable-header ${sortConfig.key === 'relationshipStartDate' ? 'sort-active' : ''}`}
                      >
                        Relationship Start
                        {sortConfig.key === 'relationshipStartDate' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th 
                        onClick={() => handleSort('clientTenure')}
                        className={`sortable-header ${sortConfig.key === 'clientTenure' ? 'sort-active' : ''}`}
                      >
                        Client Tenure
                        {sortConfig.key === 'clientTenure' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th 
                        onClick={() => handleSort('contractStartDate')}
                        className={`sortable-header ${sortConfig.key === 'contractStartDate' ? 'sort-active' : ''}`}
                      >
                        Contract Start
                        {sortConfig.key === 'contractStartDate' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th 
                        onClick={() => handleSort('contractRenewalEnd')}
                        className={`sortable-header ${sortConfig.key === 'contractRenewalEnd' ? 'sort-active' : ''}`}
                      >
                        Contract End
                        {sortConfig.key === 'contractRenewalEnd' && (
                          <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </th>
                      <th>Goals</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {sortedAccounts.map(account => (
                  <tr 
                    key={account.id}
                    onClick={() => setSelectedAccount(account)}
                    className="account-row"
                  >
                    {currentView === 'manager' ? (
                      <>
                        <td>{account.accountName}</td>
                        <td>{formatBusinessUnit(account.businessUnit)}</td>
                        <td>{formatEngagementType(account.engagementType)}</td>
                        <td className={`priority-tier${account.priority.replace('TIER_', '')}`}>
                          {formatPriority(account.priority)}
                        </td>
                        <td>{account.accountManager}</td>
                        <td className="number-cell">
                          ${parseInt(account.mrr.toString().replace(/[$,]/g, '')).toLocaleString()}
                        </td>
                        <td className="number-cell">{account.recurringPointsAllotment}</td>
                        <td className="number-cell">{account.pointsPurchased}</td>
                        <td className="number-cell">{account.pointsDelivered}</td>
                        <td className="number-cell">
                          {Number(account.pointsBalance).toLocaleString()}
                        </td>
                        <td className="number-cell">{account.pointsStrikingDistance}</td>
                        <td className={`delivery-${account.delivery.toLowerCase().replace('_', '-')}`}>
                          {formatDelivery(account.delivery)}
                        </td>
                        <td>
                          <GoalProgress goals={account.goals || []} />
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{account.accountName}</td>
                        <td>{formatBusinessUnit(account.businessUnit)}</td>
                        <td>{formatEngagementType(account.engagementType)}</td>
                        <td className={`priority-tier${account.priority.replace('TIER_', '')}`}>
                          {formatPriority(account.priority)}
                        </td>
                        <td className="number-cell">${account.mrr.toLocaleString()}</td>
                        <td className="number-cell">${account.growthInMrr.toLocaleString()}</td>
                        <td className="number-cell">${account.potentialMrr.toLocaleString()}</td>
                        <td>{new Date(account.relationshipStartDate).toLocaleDateString()}</td>
                        <td>{account.clientTenure} months</td>
                        <td>{new Date(account.contractStartDate).toLocaleDateString()}</td>
                        <td>{new Date(account.contractRenewalEnd).toLocaleDateString()}</td>
                        <td>
                          <GoalProgress goals={account.goals || []} />
                        </td>
                      </>
                    )}
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
