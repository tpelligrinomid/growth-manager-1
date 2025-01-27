import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  fetchPointsForAccount, 
  fetchGrowthTasksForAccount,
  fetchGrowthTasksForAccountWithDateRange,
  fetchGoalsForAccount,
  fetchClientListData 
} from '../services/bigQueryService';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { Account } from '@prisma/client';

const router = Router();

// Protect all BigQuery routes
router.use(authenticateToken);

// Add a test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'BigQuery routes are connected!' });
});

router.get('/points', async (req, res) => {
  try {
    const data = await fetchPointsForAccount('all');
    res.json({ data });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch points data', details: error.message });
  }
});

// Define parameter interface with strict type
interface AccountParams {
  clientFolderId: string;  // Can be empty string
}

// Define response interface
interface BigQueryResponse {
  points: any[];
  growthTasks: any[];
  goals: any[];
  clientData: any | null;
}

// Define error response interface
interface ErrorResponse {
  error: string;
  details?: string;
}

// Fetch all BigQuery data for a specific account
router.get<AccountParams>('/account/:clientFolderId', async (
  req: Request<AccountParams>, 
  res: Response<BigQueryResponse | ErrorResponse>
) => {
  const { clientFolderId } = req.params;
  const { clientListTaskId } = req.query;
  
  // Both IDs get the same validation
  if (!clientFolderId || !clientListTaskId) {
    return res.status(400).json({ error: 'Both Client Folder ID and Client List Task ID are required' });
  }
  
  try {
    // Add more detailed logging
    console.log('Attempting to fetch BigQuery data for folder:', clientFolderId);
    console.log('Using Client List Task ID:', clientListTaskId);
    
    const pointsData = await fetchPointsForAccount(clientFolderId);
    console.log('Points data:', pointsData);
    
    // Use the new date-filtered function for growth tasks
    const growthTasks = await fetchGrowthTasksForAccountWithDateRange(clientFolderId);
    const goals = await fetchGoalsForAccount(clientFolderId);
    
    // Fetch client list data directly using the provided clientListTaskId
    const clientData = await fetchClientListData(clientListTaskId as string);

    res.json({
      points: pointsData,
      growthTasks,
      goals,
      clientData
    });
  } catch (error: unknown) {
    console.error('Detailed BigQuery error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch BigQuery data', details: errorMessage });
  }
});

export default router; 