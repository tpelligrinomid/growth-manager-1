export const calculateClientTenure = (relationshipStartDate: string): number => {
  const start = new Date(relationshipStartDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30.44); // Average days in a month
};

export const calculatePointsBalance = (pointsPurchased: number, pointsDelivered: number): number => {
  return pointsPurchased - pointsDelivered;
};

export const calculatePointsStrikingDistance = (
  pointsPurchased: number,
  pointsDelivered: number,
  recurringPointsAllotment: number
): number => {
  const pointsBalance = pointsPurchased - pointsDelivered;
  const monthlyPointsCommitment = 1.5 * recurringPointsAllotment;
  return pointsBalance - monthlyPointsCommitment;
};

export const calculatePotentialMrr = (mrr: number, growthInMrr: number): number => {
  return mrr + growthInMrr;
};

export const determineDeliveryStatus = (pointsStrikingDistance: number): string => {
  return pointsStrikingDistance <= 0 ? 'ON_TRACK' : 'OFF_TRACK';
}; 