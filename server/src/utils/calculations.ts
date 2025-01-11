import { AccountWithRelations } from '../types';

export const calculateClientTenure = (relationshipStartDate: Date): number => {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - relationshipStartDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30.44);
};

export const calculatePointsBalance = (pointsPurchased: number, pointsDelivered: number): number => {
  return pointsPurchased - pointsDelivered;
};

export const calculatePointsStrikingDistance = (
  pointsPurchased: number,
  pointsDelivered: number,
  recurringPointsAllotment: number
): number => {
  return pointsPurchased - pointsDelivered - (1.5 * recurringPointsAllotment);
};

export const getCalculatedFields = (account: AccountWithRelations) => {
  const clientTenure = calculateClientTenure(account.relationshipStartDate);
  const pointsBalance = calculatePointsBalance(account.pointsPurchased, account.pointsDelivered);
  const pointsStrikingDistance = calculatePointsStrikingDistance(
    account.pointsPurchased,
    account.pointsDelivered,
    account.recurringPointsAllotment
  );

  return {
    clientTenure,
    pointsBalance,
    pointsStrikingDistance
  };
};