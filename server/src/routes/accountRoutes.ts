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
    const {
      engagementType,
      priority,
      industry,
      annualRevenue,
      employees,
      website,
      linkedinProfile,
      clientFolderId,
      clientListTaskId,
      growthInMrr,
      services
    } = req.body;

    const account = await prisma.account.create({
      data: {
        // Manual fields
        engagementType,
        priority,
        industry,
        annualRevenue,
        employees,
        website,
        linkedinProfile,
        clientFolderId,
        clientListTaskId,
        growthInMrr,
        services,

        // Default values for BigQuery fields
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
        potentialMrr: 0,
        delivery: ''
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

interface AccountUpdateBody {
  // Manual fields
  engagementType?: EngagementType;
  priority?: Priority;
  industry?: string;
  annualRevenue?: number;
  employees?: number;
  website?: string;
  linkedinProfile?: string;
  clientFolderId?: string;
  clientListTaskId?: string;
  growthInMrr?: number;
  services?: Service[];

  // BigQuery fields
  accountName?: string;
  businessUnit?: BusinessUnit;
  accountManager?: string;
  teamManager?: string;
  relationshipStartDate?: Date;
  contractStartDate?: Date;
  contractRenewalEnd?: Date;
  pointsPurchased?: number;
  pointsDelivered?: number;
  recurringPointsAllotment?: number;
  mrr?: number;
}

// Update the PUT route
router.put('/:id', async (req: Request<{id: string}, {}, AccountUpdateBody>, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const account = await prisma.account.update({
      where: { id },
      data: updateData
    });

    res.json({ 
      data: { 
        ...account,
        delivery: determineDeliveryStatus(account.pointsStrikingDistance)
      } 
    });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      error: 'Error updating account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 