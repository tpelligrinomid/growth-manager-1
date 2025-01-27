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

export async function fetchGrowthTasksForAccountWithDateRange(clientFolderId: string) {
  if (!clientFolderId) {
    console.error('Missing client folder ID');
    return [];
  }

  try {
    // Simplified diagnostic query
    const diagnosticQuery = `
      SELECT 
        'SAMPLE DATES FROM BIGQUERY' as debug_header,
        COUNT(*) as total_tasks,
        MIN(due_date) as earliest_due_date,
        MAX(due_date) as latest_due_date,
        MIN(date_done) as earliest_done_date,
        MAX(date_done) as latest_done_date,
        FORMAT_TIMESTAMP('%Y-%m-%d %H:%M:%S', CURRENT_TIMESTAMP()) as current_time,
        COUNT(CASE WHEN due_date IS NOT NULL THEN 1 END) as tasks_with_due_date,
        COUNT(CASE WHEN date_done IS NOT NULL THEN 1 END) as tasks_with_done_date
      FROM \`clickup-data-448517.ClickupData.growth_tasks\`
      WHERE client_folder_id = @clientFolderId
    `;
    
    console.log('Running date format diagnostic...');
    const diagnosticRows = await executeQuery(diagnosticQuery, { clientFolderId });
    console.log('Date format check:', JSON.stringify(diagnosticRows, null, 2));

    // Now run the actual filtered query without the PARSE_TIMESTAMP for now
    const filteredQuery = `
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
      ORDER BY due_date ASC
    `;
    
    const filteredRows = await executeQuery(filteredQuery, { clientFolderId });
    console.log('Number of tasks found:', filteredRows?.length || 0);
    if (filteredRows?.length > 0) {
      console.log('Sample task dates:', {
        due_date: filteredRows[0].due_date,
        date_done: filteredRows[0].date_done
      });
    }
    return filteredRows || [];
  } catch (error) {
    console.error('Error fetching growth tasks:', error);
    return []; // Return empty array instead of throwing
  }
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