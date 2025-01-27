import React from 'react';
import { BusinessUnit, EngagementType, Priority, AccountResponse } from '../types';
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
  accounts: AccountResponse[];
}

export const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange, view, accounts }) => {
  const businessUnits = Object.values(BusinessUnit);
  const engagementTypes = Object.values(EngagementType);
  const priorities = Object.values(Priority);
  
  // Get unique account managers and team managers from the accounts data
  const accountManagers = Array.from(new Set(accounts.map(account => account.accountManager))).sort();
  const teamManagers = Array.from(new Set(accounts.map(account => account.teamManager).filter(Boolean))).sort();

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