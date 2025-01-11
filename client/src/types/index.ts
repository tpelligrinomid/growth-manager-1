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
  goals: Goal[];
};

export interface Goal {
  id: string;
  description: string;
  status: string;
  dueDate: Date;
  progress: number;
}

export interface AccountResponse extends Account {
  clientTenure: number;
  pointsBalance: number;
  pointsStrikingDistance: number;
} 