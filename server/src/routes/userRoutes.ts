import { Router } from 'express';
import { getUsers, updateRole } from '../controllers/userController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);
router.get('/', getUsers);
router.put('/:id/role', requireRole([Role.ADMINISTRATOR]), updateRole);

export default router; 