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
    if (!goal.due_date || !goal.status) return true;
    
    try {
      const dueDate = new Date(goal.due_date.replace(/\//g, '-'));
      const now = new Date();
      
      return isNaN(dueDate.getTime()) || 
             dueDate > now || 
             goal.status.toLowerCase() !== 'closed';
    } catch (e) {
      return true;
    }
  });

  if (activeGoals.length === 0) return <div>No active goals</div>;

  // Calculate average progress of active goals
  const totalProgress = activeGoals.reduce((sum, goal) => {
    const progress = goal.progress !== null && goal.progress !== undefined ? Number(goal.progress) : 0;
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