import React from 'react';
import './GoalProgress.css';
import { Goal } from '../types';

interface GoalProgressProps {
  goals: Array<Goal>;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goals }) => {
  if (!goals || goals.length === 0) return <div>No goals</div>;

  // Filter goals to only show:
  // 1. Future goals (any status)
  // 2. Past goals that are not closed
  const filteredGoals = goals.filter(goal => {
    const dueDate = new Date(goal.dueDate);
    const now = new Date();
    return dueDate > now || (dueDate <= now && goal.status.toLowerCase() !== 'closed');
  });

  if (filteredGoals.length === 0) return <div>No active goals</div>;

  const averageProgress = Math.round(
    filteredGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / filteredGoals.length
  );

  // Check if any goal is overdue and not closed
  const hasOverdueGoals = filteredGoals.some(goal => {
    const dueDate = new Date(goal.dueDate);
    const now = new Date();
    return dueDate < now && goal.status.toLowerCase() !== 'closed';
  });

  return (
    <div className="goal-progress">
      <div className="progress-bar">
        <div 
          className={`progress-fill ${hasOverdueGoals ? 'overdue' : ''}`}
          style={{ width: `${averageProgress}%` }}
        />
      </div>
      <span className="progress-text">{averageProgress}%</span>
    </div>
  );
}; 