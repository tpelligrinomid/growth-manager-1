import { BigQuery } from '@google-cloud/bigquery';

// Helper function to execute queries
async function executeQuery(query: string, params: any = {}) {
  try {
    console.log('BigQuery params:', params);
    console.log('BigQuery query:', query);
    
    // Use credentials from environment variable
    const rawCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}';
    console.log('Raw credentials length:', rawCredentials.length);
    
    try {
      const credentials = JSON.parse(rawCredentials);
      console.log('Parsed credentials keys:', Object.keys(credentials));
      
      if (!credentials.client_email) {
        throw new Error('Missing client_email in credentials');
      }
      
      const bigquery = new BigQuery({
        credentials,
        projectId: credentials.project_id
      });
      
      const [rows] = await bigquery.query({ 
        query,
        params
      });
      return rows;
    } catch (parseError) {
      console.error('Error parsing or using credentials:', parseError);
      throw parseError;
    }
  } catch (error) {
    console.error('BigQuery execution error:', error);
    throw error;
  }
}

export async function fetchPointsForAccount(clientFolderId: string) {
  if (clientFolderId === '') {
    throw new Error('Client folder ID is required');
  }
  const query = `
    SELECT 
      client_folder_id,
      client_name,
      points_purchased,
      points_delivered
    FROM \`clickup-data-448517.ClickupData.points\`
    WHERE client_folder_id = @clientFolderId
  `;
  return executeQuery(query, { clientFolderId });
}

export async function fetchGrowthTasksForAccount(clientFolderId: string) {
  const query = `
    SELECT 
      id,
      client_folder_id,
      task_name,
      task_description,
      status,
      assignee,
      created_date,
      due_date,
      date_done,
      created_by
    FROM \`clickup-data-448517.ClickupData.growth_tasks\`
    WHERE client_folder_id = @clientFolderId
  `;
  return executeQuery(query, { clientFolderId });
}

export async function fetchGoalsForAccount(clientFolderId: string) {
  const query = `
    SELECT 
      id,
      client_folder_id,
      task_name,
      task_description,
      status,
      progress,
      assignee,
      created_date,
      due_date,
      date_done,
      created_by
    FROM \`clickup-data-448517.ClickupData.goals\`
    WHERE client_folder_id = @clientFolderId
  `;
  return executeQuery(query, { clientFolderId });
}

export async function fetchClientListData(clientListTaskId: string) {
  if (clientListTaskId === '') {
    throw new Error('Client list task ID is required');
  }
  const query = `
    SELECT 
      id,
      client_name,
      assignee,
      team_lead,
      status,
      mrr,
      original_contract_start_date,
      points_mrr_start_date,
      contract_renewal_end,
      next_strategy_approval,
      recurring_points_allotment,
      business_unit
    FROM \`clickup-data-448517.ClickupData.clients_list\`
    WHERE id = @clientListTaskId
  `;
  return executeQuery(query, { clientListTaskId });
} 