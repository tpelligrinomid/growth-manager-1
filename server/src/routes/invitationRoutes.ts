import { Router } from 'express';
import { createInvitation, verifyInvitation, acceptInvitation } from '../controllers/invitationController';

const router = Router();

// Create a new invitation
router.post('/', createInvitation);

// Verify an invitation token
router.get('/verify/:token', verifyInvitation);

// Accept an invitation
router.post('/accept/:token', acceptInvitation);

export default router; 