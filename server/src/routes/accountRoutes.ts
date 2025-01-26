import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import { getAccounts, createAccount, updateAccount } from '../controllers/accountController';

const router = Router();

// Protect all account routes
router.use(authenticateToken);

// Get all accounts - accessible by all authenticated users
router.get('/', getAccounts);

// Create new account - only ADMINISTRATOR and GROWTH_MANAGER
router.post('/', requireRole([Role.ADMINISTRATOR, Role.GROWTH_MANAGER]), createAccount);

// Update account - only ADMINISTRATOR and GROWTH_MANAGER
router.put('/:id', requireRole([Role.ADMINISTRATOR, Role.GROWTH_MANAGER]), updateAccount);

export default router; 