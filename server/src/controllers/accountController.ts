import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  calculatePointsStrikingDistance, 
  calculatePointsBalance,
  calculatePotentialMrr,
  determineDeliveryStatus,
  calculateClientTenure
} from '../utils/calculations';

const prisma = new PrismaClient();

export const getAccounts = async (req: Request, res: Response) => {
  try {
    console.log('GET /accounts endpoint hit');
    
    // Add try/catch around the database query
    let accounts;
    try {
      accounts = await prisma.account.findMany({
        include: {
          goals: true,
          tasks: true,
          clientContacts: true,
        },
      });
      console.log('Database query successful');
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Database query failed');
    }

    if (!accounts || !Array.isArray(accounts)) {
      console.error('Invalid accounts data:', accounts);
      return res.status(500).json({ 
        error: 'Invalid data from database',
        details: 'Accounts data is not in expected format'
      });
    }

    console.log('Processing accounts data...');
    const accountsWithCalculations = accounts.map(account => {
      try {
        const pointsStrikingDistance = calculatePointsStrikingDistance({
          pointsPurchased: account.pointsPurchased,
          pointsDelivered: account.pointsDelivered,
          recurringPointsAllotment: account.recurringPointsAllotment
        });

        const pointsBalance = calculatePointsBalance({
          pointsPurchased: account.pointsPurchased,
          pointsDelivered: account.pointsDelivered
        });

        return {
          ...account,
          mrr: Number(account.mrr) || 0,
          pointsPurchased: Number(account.pointsPurchased) || 0,
          pointsDelivered: Number(account.pointsDelivered) || 0,
          pointsStrikingDistance,
          pointsBalance,
          delivery: determineDeliveryStatus(pointsStrikingDistance),
          clientTenure: calculateClientTenure(account.relationshipStartDate)
        };
      } catch (calcError) {
        console.error('Calculation error for account:', account.accountName, calcError);
        throw new Error(`Failed to process account ${account.accountName}`);
      }
    });

    console.log('Successfully processed all accounts');
    return res.json({ data: accountsWithCalculations });
  } catch (error) {
    console.error('Detailed server error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch accounts',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        goals: true,
        tasks: true,
        clientContacts: true,
      },
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ data: account });
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const account = await prisma.account.create({
      data: {
        ...req.body,
        relationshipStartDate: new Date(req.body.relationshipStartDate),
        contractStartDate: new Date(req.body.contractStartDate),
        contractRenewalEnd: new Date(req.body.contractRenewalEnd),
      },
      include: {
        goals: true,
        tasks: true,
        clientContacts: true,
      },
    });

    res.status(201).json({ data: account });
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get the existing account
    const existingAccount = await prisma.account.findUnique({
      where: { id },
      include: {
        goals: true,
        tasks: true,
        clientContacts: true,
      },
    });

    if (!existingAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Create update data
    const updateData = {
      ...existingAccount,  // Keep existing data
      ...req.body,         // Override with updates
      // Ensure dates are Date objects
      relationshipStartDate: new Date(req.body.relationshipStartDate),
      contractStartDate: new Date(req.body.contractStartDate),
      contractRenewalEnd: new Date(req.body.contractRenewalEnd),
      // Remove fields that shouldn't be updated
      id: undefined,
      goals: undefined,
      tasks: undefined,
      clientContacts: undefined,
      createdAt: undefined,
      updatedAt: undefined
    };

    // Calculate striking distance
    const pointsStrikingDistance = calculatePointsStrikingDistance({
      pointsPurchased: Number(updateData.pointsPurchased),
      pointsDelivered: Number(updateData.pointsDelivered),
      recurringPointsAllotment: Number(updateData.recurringPointsAllotment)
    });

    // Update with calculated fields
    const account = await prisma.account.update({
      where: { id },
      data: {
        ...updateData,
        pointsStrikingDistance,
        delivery: determineDeliveryStatus(pointsStrikingDistance)
      },
      include: {
        goals: true,
        tasks: true,
        clientContacts: true,
      },
    });

    res.json({ data: account });
  } catch (error) {
    console.error('Error updating account:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.account.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};