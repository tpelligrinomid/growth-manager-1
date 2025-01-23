import { BigQuery } from '@google-cloud/bigquery';

export async function fetchPointsData() {
  try {
    const bigquery = new BigQuery();
    
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