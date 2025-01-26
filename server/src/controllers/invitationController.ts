import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Create a new invitation
export const createInvitation = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    // Validate input
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    // Check if there's an existing active invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email,
        accepted: false,
        expires: {
          gt: new Date()
        }
      }
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'An active invitation already exists for this email' });
    }

    // Create new invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role: role as Role,
        token: uuidv4(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        accepted: false
      }
    });

    res.status(201).json({ data: invitation });
  } catch (error) {
    console.error('Error creating invitation:', error);
    res.status(500).json({ 
      error: 'Failed to create invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Verify an invitation token
export const verifyInvitation = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        accepted: false,
        expires: {
          gt: new Date()
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    res.json({ data: invitation });
  } catch (error) {
    console.error('Error verifying invitation:', error);
    res.status(500).json({ 
      error: 'Failed to verify invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Accept an invitation
export const acceptInvitation = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Find and update the invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        token,
        accepted: false,
        expires: {
          gt: new Date()
        }
      }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { accepted: true }
    });

    // Here you would typically create a user account
    // This will be implemented later when we add user authentication

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ 
      error: 'Failed to accept invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 