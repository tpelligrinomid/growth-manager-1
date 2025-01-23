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

// Fetch all BigQuery data for a specific account
router.get<AccountParams>('/account/:clientFolderId', async (
  req: Request<AccountParams>, 
  res: Response<BigQueryResponse | { error: string }>
) => {
  const { clientFolderId } = req.params;
  
  // Both IDs get the same validation
  if (clientFolderId === '') {
    return res.status(400).json({ error: 'Client folder ID is required' });
  }
  
  try {
    // Fetch points data
    const pointsData = await fetchPointsForAccount(clientFolderId);
    
    // Fetch growth tasks (tasks with growth_task = true)
    const growthTasks = await fetchGrowthTasksForAccount(clientFolderId);
    
    // Fetch goals from the Goals list
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
  } catch (error) {
    console.error('Error fetching BigQuery data:', error);
    res.status(500).json({ error: 'Failed to fetch BigQuery data' });
  }
});

export default router; 