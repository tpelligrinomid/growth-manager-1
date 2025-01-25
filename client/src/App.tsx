import { useEffect, useState } from 'react';
import {
  AccountResponse,
  AddAccountForm
} from './types';
import { PlusIcon, ChartPieIcon, ClipboardDocumentListIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import './App.css';
import AccountModal from './components/AccountModal';
import { AddAccountModal } from './components/AddAccountModal';
import { EditAccountModal } from './components/EditAccountModal';
import { formatBusinessUnit, formatEngagementType, formatPriority, formatDelivery } from './utils/formatters';
import { Filters } from './components/Filters';
import { PieChart } from './components/PieChart';
import { GoalProgress } from './components/GoalProgress';
import { API_URL } from './config/api';
import { 
  calculateClientTenure
} from './utils/calculations';
import { LoadingSpinner } from './components/LoadingSpinner';

// Fix the type definition
type ViewType = 'manager' | 'finance';

interface SortConfig {
  key: keyof AccountResponse | 'pointsBalance' | 'clientTenure' | null;
  direction: 'asc' | 'desc' | null;
}

interface Filters {
  businessUnit: string;
  engagementType: string;
  priority: string;
  delivery: string;
  accountManager: string;
  teamManager: string;
}

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
    accountManager: '',
    teamManager: '',
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'priority',
    direction: 'asc'
  });
  const [currentView, setCurrentView] = useState<ViewType>('manager');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'tasks'>('dashboard');

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        console.log('Fetching accounts...');
        const response = await fetch(`${API_URL}/api/accounts`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const accountsData = await response.json();
        
        // For each account, fetch BigQuery data if we have ClickUp IDs
        const accountsWithBigQueryData = await Promise.all(
          accountsData.data.map(async (account: AccountResponse) => {
            if (account.clientFolderId) {
              try {
                console.log(`Fetching BigQuery data for ${account.accountName}...`);
                const bigQueryResponse = await fetch(`${API_URL}/api/bigquery/account/${account.clientFolderId}`);
                if (!bigQueryResponse.ok) {
                  console.error(`Failed to fetch BigQuery data for ${account.accountName}`);
                  return account;
                }
                
                const bigQueryData = await bigQueryResponse.json();
                console.log(`BigQuery data received for ${account.accountName}:`, bigQueryData);
                
                // Update account with BigQuery data
                const updateData = {
                  ...account,
                  pointsPurchased: bigQueryData.points?.[0]?.points_purchased ? 
                    parseInt(bigQueryData.points[0].points_purchased.toString(), 10) : account.pointsPurchased,
                  pointsDelivered: bigQueryData.points?.[0]?.points_delivered ? 
                    parseInt(bigQueryData.points[0].points_delivered.toString(), 10) : account.pointsDelivered,
                  recurringPointsAllotment: bigQueryData.clientData?.[0]?.recurring_points_allotment ? 
                    parseInt(bigQueryData.clientData[0].recurring_points_allotment.toString(), 10) : account.recurringPointsAllotment,
                  goals: bigQueryData.goals?.map((goal: any) => ({
                    id: goal.id,
                    task_name: goal.task_name || '',
                    task_description: goal.task_description,
                    status: goal.status || '',
                    progress: parseInt(goal.progress?.toString() || '0', 10),
                    assignee: goal.assignee,
                    created_date: goal.created_date,
                    due_date: goal.due_date,
                    date_done: goal.date_done,
                    created_by: goal.created_by
                  })) || []
                };
                
                // Update the account in the database
                const updateResponse = await fetch(`${API_URL}/api/accounts/${account.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updateData)
                });
                
                if (!updateResponse.ok) {
                  console.error(`Failed to update account ${account.accountName} with BigQuery data`);
                  return account;
                }
                
                const { data: updatedAccount } = await updateResponse.json();
                console.log(`Successfully updated ${account.accountName} with BigQuery data:`, updatedAccount);
                return updatedAccount;
              } catch (error) {
                console.error(`Error processing BigQuery data for ${account.accountName}:`, error);
                return account;
              }
            }
            return account;
          })
        );
        
        setAccounts(accountsWithBigQueryData);
        setError(null);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setError(error instanceof Error ? error.message : 'Failed to load accounts');
      } finally {
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
      (!filters.delivery || account.delivery === filters.delivery) &&
      (!filters.accountManager || account.accountManager === filters.accountManager) &&
      (!filters.teamManager || account.teamManager === filters.teamManager)
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

  const handleAddAccount = async (formData: AddAccountForm) => {
    try {
      // First create the account
      const response = await fetch(`${API_URL}/api/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Add default values for required fields
          accountName: formData.industry, // Temporary name until BigQuery sync
          businessUnit: 'NEW_NORTH',
          delivery: 'ON_TRACK',
          mrr: 0,
          pointsPurchased: 0,
          pointsDelivered: 0,
          recurringPointsAllotment: 0,
          pointsStrikingDistance: 0,
          potentialMrr: 0,
          relationshipStartDate: new Date().toISOString(),
          contractStartDate: new Date().toISOString(),
          contractRenewalEnd: new Date().toISOString(),
        })
      });

      if (!response.ok) throw new Error('Failed to create account');
      
      const { data: newAccount } = await response.json();
      
      // Add the new account to state immediately
      setAccounts(prevAccounts => [...prevAccounts, newAccount]);

      // Then immediately fetch BigQuery data if we have a folder ID
      if (formData.clientFolderId) {
        try {
          const bigQueryResponse = await fetch(`${API_URL}/api/bigquery/account/${formData.clientFolderId}`);
          if (bigQueryResponse.ok) {
            const bigQueryData = await bigQueryResponse.json();
            
            // Update the account with BigQuery data
            const updateResponse = await fetch(`${API_URL}/api/accounts/${newAccount.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...newAccount,
                accountName: bigQueryData.clientData?.[0]?.client_name || newAccount.accountName,
                points: bigQueryData.points,
                growthTasks: bigQueryData.growthTasks,
                goals: bigQueryData.goals,
                clientData: bigQueryData.clientData
              })
            });

            if (updateResponse.ok) {
              const { data: updatedAccount } = await updateResponse.json();
              // Update the account in state with the synced data
              setAccounts(prevAccounts => 
                prevAccounts.map(account => 
                  account.id === updatedAccount.id ? updatedAccount : account
                )
              );
            }
          }
        } catch (error) {
          console.error('Error fetching BigQuery data:', error);
        }
      }

      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const handleEditAccount = async (accountData: AccountResponse) => {
    try {
      console.log('=== EDIT ACCOUNT START ===');
      console.log('Account being edited:', accountData.accountName);
      console.log('Current folder ID:', selectedAccount?.clientFolderId);
      console.log('New folder ID:', accountData.clientFolderId);
      console.log('Full account data:', accountData);
      
      // Step 1: Save the manual edits
      console.log('Step 1: Saving manual edits...');
      const response = await fetch(`${API_URL}/api/accounts/${accountData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.error('Manual edit failed:', responseData);
        throw new Error(responseData.error || 'Failed to update account');
      }

      let { data: updatedAccount } = responseData;
      console.log('Manual edit successful:', updatedAccount);

      // Step 2: If folder ID changed, fetch fresh BigQuery data
      if (selectedAccount && selectedAccount.clientFolderId !== accountData.clientFolderId) {
        console.log('Step 2: Folder ID changed, fetching BigQuery data...');
        console.log('Fetching data for folder ID:', accountData.clientFolderId);

        const bigQueryResponse = await fetch(`${API_URL}/api/bigquery/account/${accountData.clientFolderId}`);
        const bigQueryResponseData = await bigQueryResponse.json();
        
        if (!bigQueryResponse.ok) {
          console.error('BigQuery fetch failed:', bigQueryResponseData);
          throw new Error('Failed to fetch BigQuery data');
        }
        
        console.log('BigQuery data received:', bigQueryResponseData);
        
        // Step 3: Update account with BigQuery data
        console.log('Step 3: Preparing BigQuery update...');
        const updateData = {
          ...updatedAccount,
          pointsPurchased: bigQueryResponseData.points?.[0]?.points_purchased ? 
            Number(String(bigQueryResponseData.points[0].points_purchased).replace(/,/g, '')) : updatedAccount.pointsPurchased,
          pointsDelivered: bigQueryResponseData.points?.[0]?.points_delivered ? 
            Number(String(bigQueryResponseData.points[0].points_delivered).replace(/,/g, '')) : updatedAccount.pointsDelivered,
          recurringPointsAllotment: bigQueryResponseData.clientData?.[0]?.recurring_points_allotment ? 
            Number(String(bigQueryResponseData.clientData[0].recurring_points_allotment).replace(/,/g, '')) : updatedAccount.recurringPointsAllotment,
          goals: bigQueryResponseData.goals || updatedAccount.goals
        };
        
        console.log('Update data prepared:', updateData);

        const bigQueryUpdateResponse = await fetch(`${API_URL}/api/accounts/${accountData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        const bigQueryUpdateResponseData = await bigQueryUpdateResponse.json();
        if (!bigQueryUpdateResponse.ok) {
          console.error('BigQuery update failed:', bigQueryUpdateResponseData);
          throw new Error('Failed to update account with BigQuery data');
        }

        const { data: finalAccount } = bigQueryUpdateResponseData;
        console.log('BigQuery update successful:', finalAccount);
        updatedAccount = finalAccount;
      }

      // Step 4: Update UI
      console.log('Step 4: Updating UI with final data:', updatedAccount);
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => 
          acc.id === updatedAccount.id ? updatedAccount : acc
        )
      );
      setSelectedAccount(updatedAccount);
      setIsEditModalOpen(false);
      console.log('=== EDIT ACCOUNT COMPLETE ===');

    } catch (error) {
      console.error('=== EDIT ACCOUNT ERROR ===');
      console.error('Error details:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      alert(error instanceof Error ? error.message : 'Failed to update account');
    }
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSort = (key: keyof AccountResponse | 'pointsBalance' | 'clientTenure') => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;

    if (sortConfig.key === 'priority') {
      // Extract tier numbers for comparison
      const getTierNumber = (priority: string) => parseInt(priority.replace('TIER_', ''));
      const aTier = getTierNumber(a.priority);
      const bTier = getTierNumber(b.priority);
      return sortConfig.direction === 'asc' ? aTier - bTier : bTier - aTier;
    }

    if (sortConfig.key === 'pointsBalance') {
      const aBalance = calculatePointsBalance(a) ?? 0;
      const bBalance = calculatePointsBalance(b) ?? 0;
      return sortConfig.direction === 'asc' ? aBalance - bBalance : bBalance - aBalance;
    }

    if (sortConfig.key === 'mrr' || sortConfig.key === 'growthInMrr' || sortConfig.key === 'potentialMrr') {
      // Convert currency strings to numbers for comparison
      const aValue = Number(String(a[sortConfig.key]).replace(/[^0-9.-]+/g, ''));
      const bValue = Number(String(b[sortConfig.key]).replace(/[^0-9.-]+/g, ''));
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

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

  // Add helper function for points balance calculation
  const calculatePointsBalance = (account: AccountResponse): number | null => {
    const purchased = Number(String(account.pointsPurchased).replace(/,/g, ''));
    const delivered = Number(String(account.pointsDelivered).replace(/,/g, ''));
    const balance = purchased - delivered;
    return isNaN(balance) ? null : balance;
  };

  const calculatePercentage = (part: number, total: number): number => {
    if (total === 0 || !total) return 0;
    return Math.round((part / total) * 100);
  };

  const handleAccountUpdate = (updatedAccount: AccountResponse) => {
    setAccounts(prevAccounts => 
      prevAccounts.map(account => 
        account.id === updatedAccount.id ? updatedAccount : account
      )
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <img 
            src="/mid-logo.png"
            alt="Marketers in Demand" 
            className="header-logo" 
          />
          <h1>Growth Manager</h1>
        </div>
        <button className="add-account-button" onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="button-icon" />
          Add Account
        </button>
      </header>
      <div className="main-content-wrapper">
        <nav className="sidebar">
          <button 
            className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <ChartPieIcon className="nav-icon" />
            <span className="nav-tooltip">Dashboard</span>
          </button>
          <button 
            className={`nav-button ${currentPage === 'tasks' ? 'active' : ''}`}
            onClick={() => setCurrentPage('tasks')}
          >
            <ClipboardDocumentListIcon className="nav-icon" />
            <span className="nav-tooltip">Tasks</span>
          </button>
        </nav>
        <main className="app-content">
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="accounts-section">
              <div className="metrics-container">
                <div className="metric-card">
                  <div className="metric-label">Total Accounts</div>
                  <div className="metric-value">{filteredAccounts.length}</div>
                </div>

                <div className="metric-card">
                  <div className="metric-label">Total MRR</div>
                  <div className="metric-value">
                    ${filteredAccounts.reduce((sum, account) => {
                      const mrrValue = String(account.mrr).replace(/[^0-9.-]+/g, '');
                      return sum + (parseFloat(mrrValue) || 0);
                    }, 0).toLocaleString()}
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-label">Average MRR</div>
                  <div className="metric-value">
                    ${filteredAccounts.length > 0 
                      ? Math.round(filteredAccounts.reduce((sum, account) => {
                          const mrrValue = String(account.mrr).replace(/[^0-9.-]+/g, '');
                          return sum + (parseFloat(mrrValue) || 0);
                        }, 0) / filteredAccounts.length).toLocaleString()
                      : 0}
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
                  <div className="metric-label">Average Points Burden</div>
                  <div className="metric-value">
                    <div>
                      {filteredAccounts.length > 0
                        ? Math.round(
                            filteredAccounts.reduce((sum, account) => {
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
                  <div className="view-toggle-container">
                    <button 
                      className={currentView === 'manager' ? 'active' : ''} 
                      onClick={() => setCurrentView('manager')}
                    >
                      <ClipboardDocumentListIcon className="h-4 w-4" />
                      Manager
                    </button>
                    <button 
                      className={currentView === 'finance' ? 'active' : ''} 
                      onClick={() => setCurrentView('finance')}
                    >
                      <BanknotesIcon className="h-4 w-4" />
                      Finance
                    </button>
                  </div>
                  <div className="filters-group">
                    <Filters
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      view={currentView}
                    />
                  </div>
                </div>
              </div>
              <table className="accounts-table">
                <thead>
                  <tr>
                    {currentView === 'manager' ? (
                      <>
                        <th className="sortable-header wide-header" onClick={() => handleSort('accountName')}>
                          Account<br/>Name
                          {sortConfig.key === 'accountName' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('businessUnit')}>
                          Business<br/>Unit
                          {sortConfig.key === 'businessUnit' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('engagementType')}>
                          Engagement<br/>Type
                          {sortConfig.key === 'engagementType' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('priority')}>
                          <div className="header-with-tooltip">
                            Priority
                            {sortConfig.key === 'priority' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                            <span className="tooltip">
                              • Tier 1 = Actively working<br/>
                              • Tier 2 = Client or delivery issues<br/>
                              • Tier 3 = Smooth<br/>
                              • Tier 4 = Low risk and low reward
                            </span>
                          </div>
                        </th>
                        <th className="sortable-header wide-header" onClick={() => handleSort('accountManager')}>
                          Account<br/>Manager
                          {sortConfig.key === 'accountManager' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('mrr')}>
                          MRR
                          {sortConfig.key === 'mrr' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th>
                          Recurring<br/>Points
                        </th>
                        <th>
                          Points<br/>Purchased
                        </th>
                        <th>
                          Points<br/>Delivered
                        </th>
                        <th>
                          Points<br/>Balance
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('pointsStrikingDistance')}>
                          <div className="header-with-tooltip">
                            Points<br/>Burden
                            <span className="tooltip">
                              Points Balance - (1.5 × Recurring Points)<br/>
                              Positive = Off Track, Negative = On Track
                            </span>
                            {sortConfig.key === 'pointsStrikingDistance' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                          </div>
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('delivery')}>
                          <div className="header-with-tooltip">
                            Delivery
                            {sortConfig.key === 'delivery' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                            <span className="tooltip">
                              Based on Points Burden:<br/>
                              • Off Track if &gt; 0<br/>
                              • On Track if ≤ 0
                            </span>
                          </div>
                        </th>
                        <th>Goals</th>
                      </>
                    ) : (
                      <>
                        <th className="sortable-header wide-header" onClick={() => handleSort('accountName')}>
                          Account<br/>Name
                          {sortConfig.key === 'accountName' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('businessUnit')}>
                          Business<br/>Unit
                          {sortConfig.key === 'businessUnit' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('engagementType')}>
                          Engagement<br/>Type
                          {sortConfig.key === 'engagementType' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('priority')}>
                          Priority
                          {sortConfig.key === 'priority' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('mrr')}>
                          MRR
                          {sortConfig.key === 'mrr' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('growthInMrr')}>
                          Growth in<br/>MRR
                          {sortConfig.key === 'growthInMrr' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('potentialMrr')}>
                          Potential<br/>MRR
                          {sortConfig.key === 'potentialMrr' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('relationshipStartDate')}>
                          Relationship<br/>Start
                          {sortConfig.key === 'relationshipStartDate' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('clientTenure')}>
                          Client<br/>Tenure
                          {sortConfig.key === 'clientTenure' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('contractStartDate')}>
                          Contract<br/>Start
                          {sortConfig.key === 'contractStartDate' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                        <th className="sortable-header" onClick={() => handleSort('contractRenewalEnd')}>
                          Contract<br/>End
                          {sortConfig.key === 'contractRenewalEnd' && <span className="sort-arrow">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>}
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sortedAccounts.map((account) => (
                    <tr key={account.id} onClick={() => setSelectedAccount(account)}>
                      {currentView === 'manager' ? (
                        <>
                          <td>{account.accountName}</td>
                          <td>{formatBusinessUnit(account.businessUnit)}</td>
                          <td>{formatEngagementType(account.engagementType)}</td>
                          <td className={`priority-tier${account.priority.replace('TIER_', '')}`}>
                            {formatPriority(account.priority)}
                          </td>
                          <td>{account.accountManager}</td>
                          <td className="number-cell">${account.mrr.toLocaleString()}</td>
                          <td className="number-cell">{account.recurringPointsAllotment}</td>
                          <td className="number-cell">{account.pointsPurchased}</td>
                          <td className="number-cell">{account.pointsDelivered}</td>
                          <td className="number-cell">
                            {calculatePointsBalance(account)}
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
                          <td>{calculateClientTenure(account.relationshipStartDate)} months</td>
                          <td>{new Date(account.contractStartDate).toLocaleDateString()}</td>
                          <td>{new Date(account.contractRenewalEnd).toLocaleDateString()}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      {selectedAccount && (
        <AccountModal
          account={selectedAccount}
          isOpen={!!selectedAccount}
          onClose={() => setSelectedAccount(null)}
          onEdit={() => setIsEditModalOpen(true)}
          onUpdate={handleAccountUpdate}
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
