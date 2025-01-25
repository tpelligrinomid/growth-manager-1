import { AccountResponse } from '../types';
import { API_URL } from '../config/api';

export const syncAccountWithBigQuery = async (account: AccountResponse): Promise<AccountResponse> => {
  if (!account.clientFolderId) {
    return account;
  }

  try {
    console.log(`Fetching BigQuery data for ${account.accountName}...`);
    const bigQueryResponse = await fetch(`${API_URL}/api/bigquery/account/${account.clientFolderId}`);
    
    if (!bigQueryResponse.ok) {
      console.error(`Failed to fetch BigQuery data for ${account.accountName}`);
      return account;
    }

    const bigQueryData = await bigQueryResponse.json();
    console.log(`BigQuery data received for ${account.accountName}:`, bigQueryData);

    // Prepare update data with consistent transformation logic
    const updateData = {
      ...account,
      accountName: bigQueryData.clientData?.[0]?.client_name || account.accountName,
      pointsPurchased: bigQueryData.points?.[0]?.points_purchased ? 
        Number(String(bigQueryData.points[0].points_purchased).replace(/,/g, '')) : account.pointsPurchased,
      pointsDelivered: bigQueryData.points?.[0]?.points_delivered ? 
        Number(String(bigQueryData.points[0].points_delivered).replace(/,/g, '')) : account.pointsDelivered,
      recurringPointsAllotment: bigQueryData.clientData?.[0]?.recurring_points_allotment ? 
        Number(String(bigQueryData.clientData[0].recurring_points_allotment).replace(/,/g, '')) : account.recurringPointsAllotment,
      mrr: bigQueryData.clientData?.[0]?.mrr ?
        Number(String(bigQueryData.clientData[0].mrr).replace(/,/g, '')) : account.mrr,
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
      })) || account.goals || []
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
    console.error(`Error syncing BigQuery data for ${account.accountName}:`, error);
    return account;
  }
}; 