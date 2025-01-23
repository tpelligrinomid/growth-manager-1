import { Router, Request, Response } from 'express';
import { PrismaClient, EngagementType, Priority, Service, Prisma, BusinessUnit } from '@prisma/client';
import { 
  calculatePointsStrikingDistance, 
  calculatePointsBalance,
  calculatePotentialMrr,
  determineDeliveryStatus,
  calculateClientTenure,
  formatNumber
} from '../utils/calculations';
import { handleError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

// Get all accounts
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/accounts called');
    const accounts = await prisma.account.findMany({
      include: {
        goals: true,
        tasks: true,
        clientContacts: true,
      },
    });

    // Calculate averages first
    const totalMrr = accounts.reduce((sum: number, account: any) => {
      return sum + account.mrr;
    }, 0);
    const averageMrr = accounts.length > 0 ? totalMrr / accounts.length : 0;

    const accountsWithCalculations = accounts.map((account: any) => {
      const pointsStrikingDistance = calculatePointsStrikingDistance({
        pointsPurchased: account.pointsPurchased,
        pointsDelivered: account.pointsDelivered,
        recurringPointsAllotment: account.recurringPointsAllotment
      });

      const pointsBalance = calculatePointsBalance({
        pointsPurchased: account.pointsPurchased,
        pointsDelivered: account.pointsDelivered
      });

      const potentialMrr = calculatePotentialMrr({
        mrr: account.mrr,
        growthInMrr: account.growthInMrr
      });

      return {
        ...account,
        mrr: formatNumber(account.mrr),
        pointsPurchased: formatNumber(account.pointsPurchased),
        pointsDelivered: formatNumber(account.pointsDelivered),
        recurringPointsAllotment: formatNumber(account.recurringPointsAllotment),
        pointsStrikingDistance: formatNumber(pointsStrikingDistance),
        pointsBalance: formatNumber(pointsBalance),
        potentialMrr: formatNumber(potentialMrr),
        annualRevenue: formatNumber(account.annualRevenue),
        employees: formatNumber(account.employees),
        delivery: determineDeliveryStatus(pointsStrikingDistance),
        clientTenure: calculateClientTenure(account.relationshipStartDate),
        averageMrr: formatNumber(averageMrr)
      };
    });

    res.json({ data: accountsWithCalculations });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      error: 'Error fetching accounts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

interface AccountCreateBody {
  // Only manual fields
  engagementType: EngagementType;
  priority: Priority;
  industry: string;
  annualRevenue: number;
  employees: number;
  website?: string;
  linkedinProfile?: string;
  clientFolderId: string;
  clientListTaskId: string;
  growthInMrr: number;
  services: Service[];
}

// Create new account
router.post('/', async (req: Request<{}, {}, AccountCreateBody>, res: Response) => {
  try {
    const account = await prisma.account.create({
      data: {
        ...req.body,
        accountName: '',
        businessUnit: 'NEW_NORTH' as BusinessUnit,
        accountManager: '',
        teamManager: '',
        relationshipStartDate: new Date(),
        contractStartDate: new Date(),
        contractRenewalEnd: new Date(),
        pointsPurchased: 0,
        pointsDelivered: 0,
        recurringPointsAllotment: 0,
        mrr: 0,
        pointsStrikingDistance: 0,
        potentialMrr: 0
      }
    });

    // Add calculated fields to response
    const response = {
      ...account,
      clientTenure: calculateClientTenure(account.relationshipStartDate),
      delivery: determineDeliveryStatus(account.pointsStrikingDistance)
    };

    res.status(201).json({ data: response });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      error: 'Error creating account',
      details: error instanceof Error ? error.message : 'Unknown error'
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

    res.json({ 
      data: { 
        ...account, 
        delivery: determineDeliveryStatus(pointsStrikingDistance)
      } 
    });
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