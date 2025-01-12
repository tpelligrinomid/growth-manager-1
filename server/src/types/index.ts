import { Prisma } from '@prisma/client';

// Base Account type matching Prisma schema
export type Account = {
  id: string;
  accountName: string;
  businessUnit: 'NEW_NORTH' | 'IDEOMETRY' | 'MOTION' | 'SPOKE';
  engagementType: 'STRATEGIC' | 'TACTICAL';
  priority: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
  accountManager: string;
  teamManager: string;
  relationshipStartDate: Date;
  contractStartDate: Date;
  contractRenewalEnd: Date;
  services: ('ABM' | 'PAID' | 'CONTENT' | 'SEO' | 'REPORTING' | 'SOCIAL' | 'WEBSITE')[];
  pointsPurchased: number;
  pointsDelivered: number;
  delivery: string;
  recurringPointsAllotment: number;
  mrr: number;
  growthInMrr: number;
  potentialMrr: number;
  website: string | null;
  linkedinProfile: string | null;
  industry: string;
  annualRevenue: number;
  employees: number;
};

// Account with its relations
export interface AccountWithRelations extends Account {
  goals: Array<{
    id: string;
    clientId: string;
    description: string;
    status: string;
    dueDate: Date;
    progress: number;
  }>;
  notes: Array<{
    id: string;
    clientId: string;
    description: string;
    createdBy: string;
    createdAt: Date;
  }>;
  clientContacts: Array<{
    id: string;
    clientId: string;
    firstName: string;
    lastName: string;
    title: string;
    email: string;
  }>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AccountResponse extends AccountWithRelations {
  clientTenure: number;
  pointsBalance: number;
  pointsStrikingDistance: number;
}

export type CreateAccountDto = Omit<Account, 'id'>;
export type UpdateAccountDto = Partial<CreateAccountDto>;

export enum Role {
  GROWTH_MANAGER = 'GROWTH_MANAGER',
  ADMINISTRATOR = 'ADMINISTRATOR',
  GROWTH_ADVISOR = 'GROWTH_ADVISOR'
}