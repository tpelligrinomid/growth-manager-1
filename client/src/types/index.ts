export enum BusinessUnit {
  NEW_NORTH = 'NEW_NORTH',
  IDEOMETRY = 'IDEOMETRY',
  MOTION = 'MOTION',
  SPOKE = 'SPOKE'
}

export enum EngagementType {
  STRATEGIC = 'STRATEGIC',
  TACTICAL = 'TACTICAL'
}

export enum Priority {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3',
  TIER_4 = 'TIER_4'
}

export enum Service {
  SOCIAL = 'SOCIAL',
  WEBSITE = 'WEBSITE',
  SEO = 'SEO',
  PPC = 'PPC',
  EMAIL = 'EMAIL',
  CONTENT = 'CONTENT'
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  assignee?: string;
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  accountId: string;
}

export interface AccountResponse {
  id: string;
  accountName: string;
  businessUnit: string;
  engagementType: string;
  priority: string;
  accountManager: string;
  teamManager: string;
  relationshipStartDate: Date;
  contractStartDate: Date;
  contractRenewalEnd: Date;
  services: string[];
  pointsPurchased: number;
  pointsDelivered: number;
  pointsStrikingDistance: number;
  delivery: string;
  recurringPointsAllotment: number;
  mrr: number;
  growthInMrr: number;
  potentialMrr: number;
  website?: string;
  linkedinProfile?: string;
  industry: string;
  annualRevenue: number;
  employees: number;
  clientFolderId: string;
  clientListTaskId: string;
  clientTenure: number;
  pointsBalance: number;
  points?: any[];
  growthTasks?: any[];
  goals?: any[];
  clientData?: any | null;
} 