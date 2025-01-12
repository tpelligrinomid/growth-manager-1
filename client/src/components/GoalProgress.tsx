import React from 'react';
import './GoalProgress.css';

interface GoalProgressProps {
  goals: Array<{
    progress: number;
  }>;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goals }) => {
  if (!goals || goals.length === 0) return <div>No goals</div>;

  const averageProgress = Math.round(
    goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
  );

  return (
    <div className="goal-progress">
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${averageProgress}%` }}
        />
      </div>
      <span className="progress-text">{averageProgress}%</span>
    </div>
  );
}; 