import React from 'react';

interface FiltersProps {
  businessUnit: string;
  engagementType: string;
  priority: string;
  delivery: string;
  onFilterChange: (filterName: string, value: string) => void;
  currentView: 'manager' | 'finance';
}

export const Filters: React.FC<FiltersProps> = ({
  businessUnit,
  engagementType,
  priority,
  delivery,
  onFilterChange,
  currentView
}) => {
  return (
    <div className="filters-group">
      <div className="filter-group">
        <label>Business Unit</label>
        <select
          value={businessUnit}
          onChange={(e) => onFilterChange('businessUnit', e.target.value)}
        >
          <option value="">All</option>
          <option value="NEW_NORTH">New North</option>
          <option value="IDEOMETRY">Ideometry</option>
          <option value="MOTION">Motion</option>
          <option value="SPOKE">Spoke</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Engagement Type</label>
        <select
          value={engagementType}
          onChange={(e) => onFilterChange('engagementType', e.target.value)}
        >
          <option value="">All</option>
          <option value="STRATEGIC">Strategic</option>
          <option value="TACTICAL">Tactical</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Priority</label>
        <select
          value={priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
        >
          <option value="">All</option>
          <option value="TIER_1">Tier 1</option>
          <option value="TIER_2">Tier 2</option>
          <option value="TIER_3">Tier 3</option>
          <option value="TIER_4">Tier 4</option>
        </select>
      </div>

      {currentView === 'manager' && (
        <div className="filter-group">
          <label>Delivery Status</label>
          <select
            value={delivery}
            onChange={(e) => onFilterChange('delivery', e.target.value)}
          >
            <option value="">All</option>
            <option value="ON_TRACK">On Track</option>
            <option value="OFF_TRACK">Off Track</option>
          </select>
        </div>
      )}
    </div>
  );
}; 