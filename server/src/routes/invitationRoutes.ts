import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import { 
  createInvitation, 
  verifyInvitation, 
  acceptInvitation,
  resendInvitation,
  deleteInvitation
} from '../controllers/invitationController';
import { PrismaClient } from '@prisma/client';

const router = Router();

// Protected routes
router.use(authenticateToken);

// Create invitation (admin only)
router.post('/', requireRole([Role.ADMINISTRATOR]), createInvitation);

// Get all invitations (admin only)
router.get('/', requireRole([Role.ADMINISTRATOR]), async (req, res) => {
  const prisma = new PrismaClient();
  try {
    const invitations = await prisma.invitation.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: invitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Failed to fetch invitations' });
  }
});

// Public routes for handling invitations
router.use('/:token/verify', verifyInvitation);
router.post('/:token/accept', acceptInvitation);

// Admin routes for managing invitations
router.post('/:id/resend', requireRole([Role.ADMINISTRATOR]), resendInvitation);
router.delete('/:id', requireRole([Role.ADMINISTRATOR]), deleteInvitation);

export default router; 