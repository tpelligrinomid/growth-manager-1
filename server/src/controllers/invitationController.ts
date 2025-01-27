import { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { sendInvitationEmail } from '../services/emailService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Create a new invitation
export const createInvitation = async (req: Request, res: Response) => {
  try {
    console.log('Received invitation request:', req.body);
    const { email, role } = req.body;

    // Validate input
    if (!email || !role) {
      console.log('Validation failed - missing email or role');
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
      console.log('Found existing invitation for email:', email);
      return res.status(400).json({ error: 'An active invitation already exists for this email' });
    }

    console.log('Creating new invitation with role:', role);
    const token = uuidv4();
    
    // Create new invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role: role as Role,
        token,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        accepted: false
      }
    });

    // Send invitation email
    try {
      await sendInvitationEmail(email, role, token);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Delete the invitation if email fails
      await prisma.invitation.delete({ where: { id: invitation.id } });
      throw new Error('Failed to send invitation email');
    }

    console.log('Invitation created successfully:', invitation);
    res.status(201).json({ data: invitation });
  } catch (error) {
    console.error('Detailed error creating invitation:', error);
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
    const { password, name } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Find the invitation
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user account
    const user = await prisma.user.create({
      data: {
        email: invitation.email,
        password: hashedPassword,
        role: invitation.role,
        name: name.trim()
      }
    });

    // Delete the invitation since it's been accepted
    await prisma.invitation.delete({
      where: { id: invitation.id }
    });

    // Create JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({ 
      message: 'Invitation accepted successfully',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ 
      error: 'Failed to accept invitation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const resendInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invitation = await prisma.invitation.findUnique({
      where: { id }
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const token = uuidv4();
    
    // Update invitation with new token and expiration
    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: {
        token,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        accepted: false
      }
    });

    // Send invitation email
    try {
      await sendInvitationEmail(invitation.email, invitation.role, token);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      throw new Error('Failed to send invitation email');
    }

    res.json({ data: updatedInvitation });
  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({ error: 'Failed to resend invitation' });
  }
};

export const deleteInvitation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.invitation.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({ error: 'Failed to delete invitation' });
  }
}; 