import * as React from 'react';

interface PieChartProps {
  percentage: number;
  size?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ percentage, size = 60 }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;

  // For 100%, render both background and filled circles
  if (percentage >= 100) {
    return (
      <svg width={size} height={size} className="pie-chart">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="white"
          stroke="var(--nn-primary)"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        {/* Filled circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="var(--nn-primary)"
          className="percentage-fill"
        />
      </svg>
    );
  }

  // For other percentages, use the arc path
  return (
    <svg width={size} height={size} className="pie-chart">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="white"
        stroke="var(--nn-primary)"
        strokeWidth={strokeWidth}
        opacity={0.2}
      />
      {/* Percentage arc */}
      <path
        d={`M ${size / 2} ${size / 2}
            L ${size / 2} ${strokeWidth / 2}
            A ${radius} ${radius} 0 ${percentage > 50 ? 1 : 0} 1 
            ${size / 2 + radius * Math.sin(2 * Math.PI * percentage / 100)} 
            ${size / 2 - radius * Math.cos(2 * Math.PI * percentage / 100)}
            Z`}
        fill="var(--nn-primary)"
        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        className="percentage-fill"
      />
    </svg>
  );
}; 