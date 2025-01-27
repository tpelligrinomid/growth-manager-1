import { useState, useEffect } from 'react';
import {
  AccountResponse,
  AddAccountForm
} from './types';
import {
  PlusIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import './App.css';
import AccountModal from './components/AccountModal';
import { AddAccountModal } from './components/AddAccountModal';
import { EditAccountModal } from './components/EditAccountModal';
import { formatBusinessUnit, formatEngagementType, formatPriority, formatDelivery } from './utils/formatters';
import { Filters } from './components/Filters';
import { PieChart } from './components/PieChart';
import { GoalProgress } from './components/GoalProgress';
import { API_URL } from './config/api';
import { calculateClientTenure } from './utils/calculations';
import LoadingSpinner from './components/LoadingSpinner';
import { syncAccountWithBigQuery } from './utils/bigQuerySync';
import { Routes, Route } from 'react-router-dom';
import AcceptInvitation from './components/AcceptInvitation';
import Tasks from './components/Tasks';
import Settings from './components/Settings';
import Login from './components/Login';
import { jwtDecode } from 'jwt-decode';

// Fix the type definition
type ViewType = 'manager' | 'finance';
type UserRole = 'ADMINISTRATOR' | 'GROWTH_MANAGER' | 'GROWTH_ADVISOR';

interface SortConfig {
  key: keyof AccountResponse | 'pointsBalance' | 'clientTenure' | null;
  direction: 'asc' | 'desc' | null;
}

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('GROWTH_ADVISOR');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'tasks' | 'settings'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userId, setUserId] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        setUserRole(decoded.role);
        setToken(storedToken);
        setIsAuthenticated(true);
        setUserId(decoded.userId);
        setUserName(decoded.name || '');
      } catch (error) {
        console.error('Invalid token:', error);
        handleLogout();
      }
    }
  }, []);

  // Add new effect for auto-syncing accounts
  useEffect(() => {
    const syncAllAccounts = async () => {
      if (!isAuthenticated || !token || !accounts.length) return;
      
      setIsSyncing(true);
      try {
        const syncPromises = accounts.map(async (account) => {
          if (account.clientFolderId && account.clientListTaskId) {
            const updatedAccount = await syncAccountWithBigQuery(account, () => {});
            return updatedAccount;
          }
          return account;
        });

        const updatedAccounts = await Promise.all(syncPromises);
        setAccounts(updatedAccounts);
      } catch (error) {
        console.error('Error syncing accounts:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    // Sync when first authenticated or when returning to dashboard
    if (isAuthenticated && (currentPage === 'dashboard' || accounts.length === 0)) {
      syncAllAccounts();
    }
  }, [isAuthenticated, currentPage, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAccounts();
    }
  }, [isAuthenticated, token]);

  const handleLogin = (newToken: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(newToken);
      setUserRole(decoded.role);
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setIsAuthenticated(true);
      setUserId(decoded.userId);
      setUserName(decoded.name || '');
    } catch (error) {
      console.error('Invalid token:', error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setAccounts([]);
  };

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const { data } = await response.json();
      setAccounts(data);
    } catch (err) {
      setError(`Error fetching accounts: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async (formData: AddAccountForm) => {
    try {
      // Check if both required IDs are present
      if (!formData.clientFolderId || !formData.clientListTaskId) {
        throw new Error('Both Client Folder ID and Client List Task ID are required to create an account');
      }

      setIsSyncing(true);  // Start loading
      // First create the account
      const response = await fetch(`${API_URL}/api/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
      
      // Sync with BigQuery since we know we have both IDs
      try {
        const updatedAccount = await syncAccountWithBigQuery(newAccount, setIsSyncing);
        setAccounts(prevAccounts => [...prevAccounts, updatedAccount]);
      } catch (error) {
        console.error('Error syncing with BigQuery:', error);
        throw new Error('Failed to sync account with BigQuery');
      }

      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding account:', error);
      alert(error instanceof Error ? error.message : 'Failed to add account');
    } finally {
      setIsSyncing(false);  // End loading regardless of success or failure
    }
  };

  const handleEditAccount = async (accountData: AccountResponse) => {
    try {
      setIsSyncing(true);
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
          'Authorization': `Bearer ${token}`
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

      // Step 2: Sync with BigQuery if we have both required IDs
      console.log('Step 2: Syncing with BigQuery...');
      if (accountData.clientFolderId && accountData.clientListTaskId) {
        updatedAccount = await syncAccountWithBigQuery(updatedAccount, setIsSyncing);
      } else {
        console.log('Skipping BigQuery sync - missing required IDs');
      }
      
      // Step 3: Update UI
      console.log('Step 3: Updating UI with final data:', updatedAccount);
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => 
          acc.id === updatedAccount.id ? updatedAccount : acc
        )
      );
      setSelectedAccount(updatedAccount);
      setIsEditModalOpen(false);
      console.log('=== EDIT ACCOUNT COMPLETE ===');

    } catch (error) {
      console.error('Error updating account:', error);
      alert(error instanceof Error ? error.message : 'Failed to update account');
    } finally {
      setIsSyncing(false);
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

  // Filter accounts before sorting
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
      {isSyncing && <LoadingSpinner />}
      <Routes>
        <Route path="/accept-invitation/:token" element={<AcceptInvitation onLogin={handleLogin} />} />
        <Route path="/" element={
          !isAuthenticated ? (
            <Login onLogin={handleLogin} />
          ) : (
            <>
              <header className="app-header">
                <div className="header-content">
                  <img 
                    src="/logo.png"
                    alt="Marketers in Demand" 
                    className="header-logo" 
                  />
                  <div className="title-container">
                    <h1>Growth Manager</h1>
                    <div className="role-badge">{userRole}</div>
                  </div>
                </div>
                <div className="header-actions">
                  <button className="add-account-button" onClick={() => setIsAddModalOpen(true)}>
                    <PlusIcon className="button-icon" />
                    Add Account
                  </button>
                  <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
              </header>
              <div className="main-content-wrapper">
                <nav className="sidebar">
                  <div>
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
                    {userRole === 'ADMINISTRATOR' && (
                      <button 
                        className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('settings')}
                      >
                        <Cog6ToothIcon className="nav-icon" />
                        <span className="nav-tooltip">Settings</span>
                      </button>
                    )}
                    <div className="profile-separator" />
                    <div className="profile-icon">
                      <UserCircleIcon className="nav-icon" />
                      <span className="nav-tooltip">{userName || 'User Profile'}</span>
                    </div>
                  </div>
                </nav>
                <main className="app-content">
                  {isLoading ? (
                    <LoadingSpinner />
                  ) : error ? (
                    <div className="error-message">{error}</div>
                  ) : currentPage === 'dashboard' ? (
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
                              accounts={accounts}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="accounts-table-wrapper">
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
                    </div>
                  ) : currentPage === 'tasks' ? (
                    <Tasks accounts={accounts} />
                  ) : (
                    <Settings userRole={userRole} userId={userId} />
                  )}
                </main>
              </div>
            </>
          )
        } />
      </Routes>
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
