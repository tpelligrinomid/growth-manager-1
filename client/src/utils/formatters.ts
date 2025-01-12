export const formatBusinessUnit = (unit: string): string => {
  // Split by underscore and convert each word to title case
  return unit.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
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