import React from 'react';
import './GoalProgress.css';
import { Goal } from '../types';

interface GoalProgressProps {
  goals: Array<Goal>;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goals }) => {
  if (!goals || goals.length === 0) return <div>No goals</div>;

  // Filter goals to show:
  // 1. Future goals (any status)
  // 2. Past goals that are not closed
  const activeGoals = goals.filter(goal => {
    if (!goal.status) return true;
    return goal.status.toLowerCase() !== 'closed';
  });

  if (activeGoals.length === 0) return <div>No active goals</div>;

  // Calculate average progress of active goals
  const totalProgress = activeGoals.reduce((sum, goal) => {
    // Ensure we're getting a number value for progress
    const progress = typeof goal.progress === 'number' ? goal.progress : 0;
    return sum + progress;
  }, 0);
  
  const averageProgress = Math.round(totalProgress / activeGoals.length);

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