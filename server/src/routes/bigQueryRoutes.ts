import { Router } from 'express';
import { fetchPointsData } from '../services/bigQueryService';

const router = Router();

router.get('/points', async (req, res) => {
  try {
    const data = await fetchPointsData();
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch points data' });
  }
});

export default router; 