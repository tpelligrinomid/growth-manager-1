import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';
import { createInvitation, verifyInvitation, acceptInvitation } from '../controllers/invitationController';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Protect all invitation routes
router.use(authenticateToken);

// Create invitation - only ADMINISTRATOR
router.post('/', requireRole([Role.ADMINISTRATOR]), createInvitation);

// Get all invitations - only ADMINISTRATOR
router.get('/', requireRole([Role.ADMINISTRATOR]), async (req, res) => {
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

// Verify invitation token
router.get('/verify/:token', verifyInvitation);

// Accept invitation
router.post('/accept/:token', acceptInvitation);

export default router; 