import { Router, Request, Response } from 'express';
import { 
  fetchPointsForAccount, 
  fetchGrowthTasksForAccount, 
  fetchGoalsForAccount,
  fetchClientListData 
} from '../services/bigQueryService';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { Account } from '@prisma/client';

const router = Router();

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
  
  // Both IDs get the same validation
  if (clientFolderId === '') {
    return res.status(400).json({ error: 'Client folder ID is required' });
  }
  
  try {
    // Add more detailed logging
    console.log('Attempting to fetch BigQuery data for folder:', clientFolderId);
    
    const pointsData = await fetchPointsForAccount(clientFolderId);
    console.log('Points data:', pointsData);
    
    const growthTasks = await fetchGrowthTasksForAccount(clientFolderId);
    const goals = await fetchGoalsForAccount(clientFolderId);
    
    // Fetch client list data using clientListTaskId
    const account = await prisma.account.findFirst({
      where: {
        clientFolderId: clientFolderId
      } as Prisma.AccountWhereInput
    });
    const clientData = account?.clientListTaskId 
      ? await fetchClientListData(account.clientListTaskId)
      : null;

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