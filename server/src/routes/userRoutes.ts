import { Router } from 'express';
import { getUsers } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);
router.get('/', getUsers);

export default router; 