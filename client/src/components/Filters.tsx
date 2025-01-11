import { BusinessUnit, EngagementType, Priority } from '../types';
import { formatBusinessUnit, formatEngagementType, formatPriority, formatDelivery } from '../utils/formatters';

interface FiltersProps {
  businessUnit: string;
  engagementType: string;
  priority: string;
  delivery: string;
  onFilterChange: (filterName: string, value: string) => void;
}

export const Filters: React.FC<FiltersProps> = ({
  businessUnit,
  engagementType,
  priority,
  delivery,
  onFilterChange,
}) => {
  return (
    <div className="filters-container">
      <div className="filter-group">
        <label htmlFor="businessUnit">Business Unit</label>
        <select
          id="businessUnit"
          value={businessUnit}
          onChange={(e) => onFilterChange('businessUnit', e.target.value)}
        >
          <option value="">All</option>
          {Object.values(BusinessUnit).map((unit) => (
            <option key={unit} value={unit}>
              {formatBusinessUnit(unit)}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="engagementType">Engagement Type</label>
        <select
          id="engagementType"
          value={engagementType}
          onChange={(e) => onFilterChange('engagementType', e.target.value)}
        >
          <option value="">All</option>
          {Object.values(EngagementType).map((type) => (
            <option key={type} value={type}>
              {formatEngagementType(type)}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
        >
          <option value="">All</option>
          {Object.values(Priority).map((p) => (
            <option key={p} value={p}>
              {formatPriority(p)}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="delivery">Delivery Status</label>
        <select
          id="delivery"
          value={delivery}
          onChange={(e) => onFilterChange('delivery', e.target.value)}
        >
          <option value="">All</option>
          <option value="ON_TRACK">{formatDelivery('ON_TRACK')}</option>
          <option value="OFF_TRACK">{formatDelivery('OFF_TRACK')}</option>
        </select>
      </div>
    </div>
  );
}; 