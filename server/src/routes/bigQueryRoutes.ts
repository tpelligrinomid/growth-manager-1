import { Router } from 'express';
import { fetchPointsData } from '../services/bigQueryService';

const router = Router();

// Add a test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'BigQuery routes are connected!' });
});

router.get('/points', async (req, res) => {
  try {
    const data = await fetchPointsData();
    res.json({ data });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch points data', details: error.message });
  }
});

export default router; 