import { BigQuery } from '@google-cloud/bigquery';

export async function fetchPointsData() {
  try {
    // Parse credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}');
    
    const bigquery = new BigQuery({
      credentials,
      projectId: credentials.project_id
    });
    
    const query = `
      SELECT 
        client_folder_id,
        client_name,
        points_purchased,
        points_delivered
      FROM \`clickup-data-448517.ClickupData.points\`
    `;
    
    const [rows] = await bigquery.query({ query });
    console.log('Fetched points data:', rows);
    return rows;
    
  } catch (error) {
    console.error('Error fetching from BigQuery:', error);
    throw error;
  }
} 