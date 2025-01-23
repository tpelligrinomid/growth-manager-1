import { BigQuery } from '@google-cloud/bigquery';

// Helper function to execute queries
async function executeQuery(query: string, params: any = {}) {
  try {
    console.log('BigQuery params:', params);
    console.log('BigQuery query:', query);
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}');
    const bigquery = new BigQuery({
      credentials,
      projectId: credentials.project_id
    });
    
    const [rows] = await bigquery.query({ 
      query,
      params
    });
    return rows;
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
      task_id,
      task_name,
      status,
      assignee,
      created_date,
      due_date,
      date_done
    FROM \`clickup-data-448517.ClickupData.tasks\`
    WHERE client_folder_id = @clientFolderId
    AND growth_task = true
  `;
  
  return executeQuery(query, { clientFolderId });
}

export async function fetchGoalsForAccount(clientFolderId: string) {
  const query = `
    SELECT 
      task_id,
      task_name as description,
      status,
      due_date,
      progress
    FROM \`clickup-data-448517.ClickupData.tasks\`
    WHERE client_folder_id = @clientFolderId
    AND list_name = 'Goals'
  `;
  
  return executeQuery(query, { clientFolderId });
}

export async function fetchClientListData(clientListTaskId: string) {
  if (clientListTaskId === '') {
    throw new Error('Client list task ID is required');
  }
  const query = `
    SELECT 
      assignee,
      team_lead,
      status,
      mrr,
      contract_start_date,
      contract_renewal_end,
      recurring_points_allotment,
      business_unit
    FROM \`clickup-data-448517.ClickupData.client_list\`
    WHERE task_id = @clientListTaskId
  `;
  
  return executeQuery(query, { clientListTaskId });
} 