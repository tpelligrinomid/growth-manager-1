import React, { useEffect, useState } from 'react';
import { Account } from '../types/Account';
import { syncAccountWithBigQuery } from '../services/bigQueryService';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    if (!accounts) return;
    
    const filteredAccounts = accounts.filter((account) => {
      if (!searchTerm) return true;
      return account.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    setFilteredAccounts(filteredAccounts);
  }, [accounts, searchTerm]);

  // Add auto-sync when visiting Accounts page
  useEffect(() => {
    const syncAllAccounts = async () => {
      if (!accounts.length) return;
      
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

    // Sync when component mounts
    syncAllAccounts();
  }, []); // Only run once when component mounts

  const handleSync = async (account: Account) => {
    // Implementation of handleSync function
  };

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default Accounts; 
