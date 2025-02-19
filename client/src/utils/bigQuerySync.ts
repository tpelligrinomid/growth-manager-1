import { AccountResponse } from '../types';
import { API_URL } from '../config/api';

export const syncAccountWithBigQuery = async (
  account: AccountResponse,
  onLoadingChange?: (isLoading: boolean) => void
): Promise<AccountResponse> => {
  if (!account.clientFolderId || !account.clientListTaskId) {
    console.error('Missing required IDs for sync:', { 
      clientFolderId: account.clientFolderId, 
      clientListTaskId: account.clientListTaskId 
    });
    return account;
  }

  try {
    onLoadingChange?.(true);
    console.log(`Fetching BigQuery data for ${account.accountName}...`);
    
    // Get the current token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('No authentication token found');
    }

    console.log('Making BigQuery request with token:', token.substring(0, 20) + '...');
    
    const bigQueryResponse = await fetch(
      `${API_URL}/api/bigquery/account/${account.clientFolderId}?clientListTaskId=${account.clientListTaskId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!bigQueryResponse.ok) {
      const errorData = await bigQueryResponse.json().catch(() => ({}));
      console.error(`Failed to fetch BigQuery data for ${account.accountName}:`, {
        status: bigQueryResponse.status,
        statusText: bigQueryResponse.statusText,
        error: errorData
      });
      onLoadingChange?.(false);
      return account;
    }

    const bigQueryData = await bigQueryResponse.json();
    console.log(`BigQuery data received for ${account.accountName}:`, bigQueryData);

    // Get the new MRR value
    const newMrr = bigQueryData.clientData?.[0]?.mrr ?
      Number(String(bigQueryData.clientData[0].mrr).replace(/,/g, '')) : account.mrr;

    // Keep the existing growth in MRR value since it's manually set
    const growthInMrr = Number(account.growthInMrr || 0);

    // Prepare update data with consistent transformation logic
    const updateData = {
      ...account,
      accountName: bigQueryData.clientData?.[0]?.client_name || account.accountName,
      accountManager: bigQueryData.clientData?.[0]?.assignee || account.accountManager,
      teamManager: bigQueryData.clientData?.[0]?.team_lead || account.teamManager,
      pointsPurchased: bigQueryData.points?.[0]?.points_purchased ? 
        Number(String(bigQueryData.points[0].points_purchased).replace(/,/g, '')) : account.pointsPurchased,
      pointsDelivered: bigQueryData.points?.[0]?.points_delivered ? 
        Number(String(bigQueryData.points[0].points_delivered).replace(/,/g, '')) : account.pointsDelivered,
      recurringPointsAllotment: bigQueryData.clientData?.[0]?.recurring_points_allotment ? 
        Number(String(bigQueryData.clientData[0].recurring_points_allotment).replace(/,/g, '')) : account.recurringPointsAllotment,
      mrr: Number(newMrr),
      growthInMrr: growthInMrr,
      potentialMrr: Number(newMrr) + Number(growthInMrr),
      relationshipStartDate: bigQueryData.clientData?.[0]?.original_contract_start_date ? 
        new Date(bigQueryData.clientData[0].original_contract_start_date) : account.relationshipStartDate || new Date(),
      contractStartDate: bigQueryData.clientData?.[0]?.points_mrr_start_date ? 
        new Date(bigQueryData.clientData[0].points_mrr_start_date) : account.contractStartDate || new Date(),
      contractRenewalEnd: bigQueryData.clientData?.[0]?.contract_renewal_end ? 
        new Date(bigQueryData.clientData[0].contract_renewal_end) : account.contractRenewalEnd || new Date(),
      employees: typeof account.employees === 'string' ? 
        parseInt(String(account.employees).replace(/[^\d.-]/g, ''), 10) : account.employees || 0,
      annualRevenue: typeof account.annualRevenue === 'string' ? 
        parseInt(String(account.annualRevenue).replace(/[^\d.-]/g, ''), 10) : account.annualRevenue || 0,
      goals: bigQueryData.goals?.map((goal: any) => ({
        id: goal.id,
        task_name: goal.task_name || '',
        task_description: goal.task_description,
        status: goal.status || '',
        progress: parseInt(String(goal.progress || '0').replace('%', ''), 10),
        assignee: goal.assignee,
        created_date: new Date(goal.created_date),
        due_date: new Date(goal.due_date),
        date_done: goal.date_done ? new Date(goal.date_done) : null,
        created_by: goal.created_by
      })) || account.goals || []
    };

    // Update the account in the database
    const updateResponse = await fetch(`${API_URL}/api/accounts/${account.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      console.error(`Failed to update account ${account.accountName} with BigQuery data`);
      onLoadingChange?.(false);
      return account;
    }

    const { data: updatedAccount } = await updateResponse.json();
    console.log(`Successfully updated ${account.accountName} with BigQuery data:`, updatedAccount);
    onLoadingChange?.(false);
    return updatedAccount;

  } catch (error) {
    console.error(`Error syncing BigQuery data for ${account.accountName}:`, error);
    onLoadingChange?.(false);
    return account;
  }
}; 