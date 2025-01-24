import React from 'react';
import { BusinessUnit, EngagementType, Priority } from '../types';
import { formatBusinessUnit, formatEngagementType, formatPriority } from '../utils/formatters';

interface FiltersProps {
  filters: {
    businessUnit: string;
    engagementType: string;
    priority: string;
    delivery: string;
    accountManager: string;
    teamManager: string;
  };
  onFilterChange: (filterName: string, value: string) => void;
  view: 'manager' | 'finance';
}

export const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange, view }) => {
  const businessUnits = Object.values(BusinessUnit);
  const engagementTypes = Object.values(EngagementType);
  const priorities = Object.values(Priority);
  
  // Get unique account managers and team managers from the data
  const accountManagers = ['Spencer Hertle', 'Nathalie Mintjens', 'Gracie Diamond', 'Mia Mixan'];
  const teamManagers = ['Colin Costigan'];

  return (
    <div className="filters-group">
      <select
        value={filters.businessUnit}
        onChange={(e) => onFilterChange('businessUnit', e.target.value)}
      >
        <option value="">All Business Units</option>
        {businessUnits.map((unit) => (
          <option key={unit} value={unit}>
            {formatBusinessUnit(unit)}
          </option>
        ))}
      </select>
      
      <select
        value={filters.engagementType}
        onChange={(e) => onFilterChange('engagementType', e.target.value)}
      >
        <option value="">All Engagement Types</option>
        {engagementTypes.map((type) => (
          <option key={type} value={type}>
            {formatEngagementType(type)}
          </option>
        ))}
      </select>
      
      <select
        value={filters.priority}
        onChange={(e) => onFilterChange('priority', e.target.value)}
      >
        <option value="">All Priorities</option>
        {priorities.map((priority) => (
          <option key={priority} value={priority}>
            {formatPriority(priority)}
          </option>
        ))}
      </select>
      
      <select
        value={filters.delivery}
        onChange={(e) => onFilterChange('delivery', e.target.value)}
      >
        <option value="">All Delivery Status</option>
        <option value="ON_TRACK">On Track</option>
        <option value="OFF_TRACK">Off Track</option>
      </select>
      
      {view === 'manager' && (
        <>
          <select
            value={filters.accountManager}
            onChange={(e) => onFilterChange('accountManager', e.target.value)}
          >
            <option value="">All Account Managers</option>
            {accountManagers.map((manager) => (
              <option key={manager} value={manager}>
                {manager}
              </option>
            ))}
          </select>
          
          <select
            value={filters.teamManager}
            onChange={(e) => onFilterChange('teamManager', e.target.value)}
          >
            <option value="">All Team Managers</option>
            {teamManagers.map((manager) => (
              <option key={manager} value={manager}>
                {manager}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}; 