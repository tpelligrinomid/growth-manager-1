import { Request, Response } from 'express';
import { PrismaClient, EngagementType, Priority, Service, BusinessUnit } from '@prisma/client';
import { 
  calculatePointsStrikingDistance, 
  calculatePointsBalance,
  calculatePotentialMrr,
  determineDeliveryStatus,
  calculateClientTenure,
  formatNumber
} from '../utils/calculations';

const prisma = new PrismaClient();

interface AccountCreateBody {
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

interface AccountUpdateBody {
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
  goals?: any[];
  tasks?: any[];
  clientContacts?: any[];
}

export const getAccounts = async (req: Request, res: Response) => {
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
      return sum + Number(account.mrr);
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

      // Calculate potential MRR
      const potentialMrr = calculatePotentialMrr({
        mrr: Number(account.mrr),
        growthInMrr: Number(account.growthInMrr)
      });

      return {
        ...account,
        mrr: formatNumber(account.mrr),
        growthInMrr: formatNumber(account.growthInMrr),
        potentialMrr: formatNumber(potentialMrr),
        pointsPurchased: formatNumber(account.pointsPurchased),
        pointsDelivered: formatNumber(account.pointsDelivered),
        recurringPointsAllotment: formatNumber(account.recurringPointsAllotment),
        pointsStrikingDistance: formatNumber(pointsStrikingDistance),
        pointsBalance: formatNumber(pointsBalance),
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

export const createAccount = async (req: Request<{}, {}, AccountCreateBody>, res: Response) => {
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
};

export const updateAccount = async (req: Request<{id: string}, {}, AccountUpdateBody>, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('=== Account Update Request ===');
    console.log('Account ID:', id);
    console.log('Raw update data:', updateData);

    const currentAccount = await prisma.account.findUnique({
      where: { id },
      include: {
        goals: true,
        tasks: true,
        clientContacts: true,
      }
    });

    if (!currentAccount) {
      console.log('Account not found:', id);
      return res.status(404).json({ error: 'Account not found' });
    }

    console.log('Current account data:', currentAccount);

    const sanitizedData: Record<string, any> = {
      engagementType: updateData.engagementType,
      priority: updateData.priority,
      industry: updateData.industry,
      annualRevenue: updateData.annualRevenue ? Number(updateData.annualRevenue) : undefined,
      employees: updateData.employees ? Number(updateData.employees) : undefined,
      website: updateData.website,
      linkedinProfile: updateData.linkedinProfile,
      clientFolderId: updateData.clientFolderId,
      clientListTaskId: updateData.clientListTaskId,
      growthInMrr: updateData.growthInMrr ? Number(updateData.growthInMrr) : undefined,
      services: updateData.services,
      accountName: updateData.accountName,
      businessUnit: updateData.businessUnit,
      accountManager: updateData.accountManager,
      teamManager: updateData.teamManager,
      relationshipStartDate: updateData.relationshipStartDate,
      contractStartDate: updateData.contractStartDate,
      contractRenewalEnd: updateData.contractRenewalEnd,
      pointsPurchased: typeof updateData.pointsPurchased === 'number' ? updateData.pointsPurchased : undefined,
      pointsDelivered: typeof updateData.pointsDelivered === 'number' ? updateData.pointsDelivered : undefined,
      recurringPointsAllotment: typeof updateData.recurringPointsAllotment === 'number' ? updateData.recurringPointsAllotment : undefined,
      mrr: typeof updateData.mrr === 'number' ? updateData.mrr : undefined
    };

    if (sanitizedData.mrr !== undefined || sanitizedData.growthInMrr !== undefined) {
      const newMrr = sanitizedData.mrr !== undefined ? sanitizedData.mrr : currentAccount.mrr;
      const newGrowthInMrr = sanitizedData.growthInMrr !== undefined ? sanitizedData.growthInMrr : currentAccount.growthInMrr;
      sanitizedData.potentialMrr = calculatePotentialMrr({
        mrr: Number(newMrr),
        growthInMrr: Number(newGrowthInMrr)
      });
    }

    if (updateData.goals) {
      sanitizedData.goals = {
        deleteMany: {},
        create: updateData.goals?.map((goal: any) => ({
          id: goal.id,
          task_name: goal.task_name,
          task_description: goal.task_description,
          status: goal.status?.toUpperCase().replace(' ', '_') || '',
          progress: parseInt(String(goal.progress).replace('%', '')) || 0,
          assignee: goal.assignee,
          created_date: new Date(goal.created_date.replace('/', '-')),
          due_date: new Date(goal.due_date.replace('/', '-')),
          date_done: goal.date_done ? new Date(goal.date_done.replace('/', '-')) : null,
          created_by: goal.created_by
        })) || []
      };
    }

    Object.keys(sanitizedData).forEach(key => {
      if (sanitizedData[key] === undefined) {
        delete sanitizedData[key];
      }
    });

    console.log('Sanitized data before update:', sanitizedData);

    const account = await prisma.account.update({
      where: { id },
      data: sanitizedData,
      include: {
        goals: true,
        tasks: true,
        clientContacts: true
      }
    });

    console.log('Account after update:', account);

    const pointsStrikingDistance = calculatePointsStrikingDistance({
      pointsPurchased: Number(account.pointsPurchased),
      pointsDelivered: Number(account.pointsDelivered),
      recurringPointsAllotment: Number(account.recurringPointsAllotment)
    });

    console.log('Calculated points striking distance:', pointsStrikingDistance);

    const formattedAccount = {
      ...account,
      mrr: formatNumber(account.mrr),
      growthInMrr: formatNumber(account.growthInMrr),
      potentialMrr: formatNumber(account.potentialMrr),
      pointsPurchased: formatNumber(account.pointsPurchased),
      pointsDelivered: formatNumber(account.pointsDelivered),
      recurringPointsAllotment: formatNumber(account.recurringPointsAllotment),
      pointsStrikingDistance: formatNumber(pointsStrikingDistance),
      annualRevenue: formatNumber(account.annualRevenue),
      employees: formatNumber(account.employees),
      delivery: determineDeliveryStatus(pointsStrikingDistance)
    };

    const response = {
      data: formattedAccount
    };

    console.log('Final response:', response);
    res.json(response);

  } catch (error) {
    console.error('=== Update Error ===');
    console.error('Detailed error:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ 
      error: 'Error updating account',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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