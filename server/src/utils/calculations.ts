import { AccountWithRelations } from '../types';

export const calculateClientTenure = (relationshipStartDate: Date): number => {
  const today = new Date();
  const startDate = new Date(relationshipStartDate);
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days in a month
  return diffMonths;
};

export const calculatePointsBalance = ({
  pointsPurchased,
  pointsDelivered,
}: {
  pointsPurchased: number;
  pointsDelivered: number;
}): number => {
  return pointsPurchased - pointsDelivered;
};

export const calculatePointsStrikingDistance = ({
  pointsPurchased,
  pointsDelivered,
  recurringPointsAllotment,
}: {
  pointsPurchased: number;
  pointsDelivered: number;
  recurringPointsAllotment: number;
}): number => {
  console.log('Calculating Striking Distance:');
  console.log('Points Purchased:', pointsPurchased);
  console.log('Points Delivered:', pointsDelivered);
  console.log('Recurring Points:', recurringPointsAllotment);

  const pointsBalance = pointsPurchased - pointsDelivered;
  console.log('Points Balance:', pointsBalance);

  const monthlyPointsCommitment = 1.5 * recurringPointsAllotment;
  console.log('Monthly Points Commitment:', monthlyPointsCommitment);

  const strikingDistance = pointsBalance - monthlyPointsCommitment;
  console.log('Striking Distance:', strikingDistance);

  return strikingDistance;
};

export const calculatePotentialMrr = ({
  mrr,
  growthInMrr,
}: {
  mrr: number;
  growthInMrr: number;
}): number => {
  return mrr + growthInMrr;
};

export const determineDeliveryStatus = (pointsStrikingDistance: number): string => {
  return pointsStrikingDistance <= 0 ? 'ON_TRACK' : 'OFF_TRACK';
};

export const getCalculatedFields = (account: AccountWithRelations) => {
  const clientTenure = calculateClientTenure(account.relationshipStartDate);
  
  const pointsBalance = calculatePointsBalance({
    pointsPurchased: account.pointsPurchased,
    pointsDelivered: account.pointsDelivered
  });
  
  const pointsStrikingDistance = calculatePointsStrikingDistance({
    pointsPurchased: account.pointsPurchased,
    pointsDelivered: account.pointsDelivered,
    recurringPointsAllotment: account.recurringPointsAllotment
  });

  return {
    clientTenure,
    pointsBalance,
    pointsStrikingDistance
  };
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};