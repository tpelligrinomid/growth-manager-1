import React from 'react';

interface Props {
  filters: {
    businessUnit: string;
    engagementType: string;
    priority: string;
    delivery: string;
    accountManager?: string;
    teamManager?: string;
  };
  onFilterChange: (name: string, value: string) => void;
  view: 'manager' | 'finance';
}

export const Filters: React.FC<Props> = ({ filters, onFilterChange, view }) => {
  return (
    <div className="filters-container">
      <select
        value={filters.businessUnit}
        onChange={(e) => onFilterChange('businessUnit', e.target.value)}
      >
        <option value="">All Business Units</option>
        <option value="NEW_NORTH">New North</option>
      </select>

      <select
        value={filters.engagementType}
        onChange={(e) => onFilterChange('engagementType', e.target.value)}
      >
        <option value="">All Engagement Types</option>
        <option value="STRATEGIC">Strategic</option>
        <option value="TACTICAL">Tactical</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) => onFilterChange('priority', e.target.value)}
      >
        <option value="">All Priorities</option>
        <option value="TIER_1">Tier 1</option>
        <option value="TIER_2">Tier 2</option>
        <option value="TIER_3">Tier 3</option>
        <option value="TIER_4">Tier 4</option>
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
            <option value="Spencer Hertle">Spencer Hertle</option>
            <option value="Nathalie Mintjens">Nathalie Mintjens</option>
            <option value="Gracie Diamond">Gracie Diamond</option>
            <option value="Mia Mixan">Mia Mixan</option>
          </select>

          <select
            value={filters.teamManager}
            onChange={(e) => onFilterChange('teamManager', e.target.value)}
          >
            <option value="">All Team Managers</option>
            <option value="Colin Costigan">Colin Costigan</option>
          </select>
        </>
      )}
    </div>
  );
}; 