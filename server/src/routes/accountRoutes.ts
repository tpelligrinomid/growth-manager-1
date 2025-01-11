import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { 
  calculatePointsStrikingDistance, 
  calculatePointsBalance,
  calculatePotentialMrr,
  determineDeliveryStatus 
} from '../utils/calculations';

const router = Router();
const prisma = new PrismaClient();

// Get all accounts
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/accounts called');
    const accounts = await prisma.account.findMany({
      include: {
        goals: true,
        notes: true,
      },
    });

    // Calculate fields for each account
    const accountsWithCalculations = accounts.map(account => {
      const pointsStrikingDistance = calculatePointsStrikingDistance({
        pointsPurchased: account.pointsPurchased,
        pointsDelivered: account.pointsDelivered,
        recurringPointsAllotment: account.recurringPointsAllotment
      });

      return {
        ...account,
        pointsStrikingDistance,
        delivery: determineDeliveryStatus(pointsStrikingDistance)
      };
    });

    console.log('Found accounts:', accountsWithCalculations);
    res.json({ data: accountsWithCalculations });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Error fetching accounts' });
  }
});

// Create new account
router.post('/', async (req, res) => {
  try {
    console.log('Received account data:', req.body);
    const {
      accountName,
      businessUnit,
      engagementType,
      priority,
      accountManager,
      teamManager,
      relationshipStartDate,
      contractStartDate,
      contractRenewalEnd,
      services,
      pointsPurchased,
      pointsDelivered,
      recurringPointsAllotment,
      mrr,
      growthInMrr,
      website,
      linkedinProfile,
      industry,
      annualRevenue,
      employees,
    } = req.body;

    // Use the calculation function from utils
    const pointsBalance = calculatePointsBalance({ pointsPurchased, pointsDelivered });
    console.log('Account Data for Striking Distance:');
    console.log('Points Purchased:', pointsPurchased);
    console.log('Points Delivered:', pointsDelivered);
    console.log('Recurring Points:', recurringPointsAllotment);

    const pointsStrikingDistance = calculatePointsStrikingDistance({
      pointsPurchased,
      pointsDelivered,
      recurringPointsAllotment
    });

    console.log('Final Striking Distance:', pointsStrikingDistance);
    const delivery = determineDeliveryStatus(pointsStrikingDistance);
    const potentialMrr = calculatePotentialMrr({ mrr, growthInMrr });

    const account = await prisma.account.create({
      data: {
        accountName,
        businessUnit,
        engagementType,
        priority,
        accountManager,
        teamManager,
        relationshipStartDate: new Date(relationshipStartDate),
        contractStartDate: new Date(contractStartDate),
        contractRenewalEnd: new Date(contractRenewalEnd),
        services,
        pointsPurchased,
        pointsDelivered,
        pointsStrikingDistance,
        delivery,
        recurringPointsAllotment,
        mrr,
        growthInMrr,
        potentialMrr,
        website,
        linkedinProfile,
        industry,
        annualRevenue,
        employees,
      },
    });

    res.status(201).json({ data: account });
  } catch (err) {
    console.error('Detailed error:', err);
    const error = err as Error;
    res.status(500).json({ 
      error: 'Error creating account',
      details: error?.toString() || 'Unknown error occurred'
    });
  }
});

// Add this PUT route alongside the existing GET and POST routes
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      accountName,
      businessUnit,
      engagementType,
      priority,
      accountManager,
      teamManager,
      relationshipStartDate,
      contractStartDate,
      contractRenewalEnd,
      services,
      pointsPurchased,
      pointsDelivered,
      recurringPointsAllotment,
      mrr,
      growthInMrr,
      website,
      linkedinProfile,
      industry,
      annualRevenue,
      employees,
    } = req.body;

    // Calculate the fields just like in POST
    const pointsBalance = calculatePointsBalance({ pointsPurchased, pointsDelivered });
    const pointsStrikingDistance = calculatePointsStrikingDistance({
      pointsPurchased,
      pointsDelivered,
      recurringPointsAllotment
    });
    const delivery = determineDeliveryStatus(pointsStrikingDistance);
    const potentialMrr = calculatePotentialMrr({ mrr, growthInMrr });

    const account = await prisma.account.update({
      where: { id },
      data: {
        accountName,
        businessUnit,
        engagementType,
        priority,
        accountManager,
        teamManager,
        relationshipStartDate: new Date(relationshipStartDate),
        contractStartDate: new Date(contractStartDate),
        contractRenewalEnd: new Date(contractRenewalEnd),
        services,
        pointsPurchased,
        pointsDelivered,
        pointsStrikingDistance,
        delivery,
        recurringPointsAllotment,
        mrr,
        growthInMrr,
        potentialMrr,
        website,
        linkedinProfile,
        industry,
        annualRevenue,
        employees,
      },
    });

    res.json({ data: account });
  } catch (err) {
    console.error('Error updating account:', err);
    const error = err as Error;
    res.status(500).json({ 
      error: 'Error updating account',
      details: error?.toString() || 'Unknown error occurred'
    });
  }
});

export default router; 