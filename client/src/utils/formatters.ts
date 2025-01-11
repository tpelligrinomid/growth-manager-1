export const formatBusinessUnit = (unit: string): string => {
  const formatted = unit.replace('_', ' ').toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const formatEngagementType = (type: string): string => {
  return type.charAt(0) + type.slice(1).toLowerCase();
};

export const formatPriority = (priority: string): string => {
  return priority.replace('TIER_', 'Tier ');
};

export const formatDelivery = (delivery: string): string => {
  return delivery === 'ON_TRACK' ? 'On Track' : 'Off Track';
};

export const getDeliveryValue = (display: string): string => {
  return display === 'On Track' ? 'ON_TRACK' : 'OFF_TRACK';
}; 