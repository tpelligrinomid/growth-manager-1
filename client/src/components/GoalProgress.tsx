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
    if (!goal.dueDate || !goal.status) return true;
    
    try {
      // Convert YYYY/MM/DD to YYYY-MM-DD for proper Date parsing
      const dueDate = new Date(goal.dueDate.replace(/\//g, '-'));
      const now = new Date();
      
      // If the goal is closed and the due date is in the past, filter it out
      if (goal.status.toLowerCase() === 'closed' && dueDate < now) {
        return false;
      }
      
      // Keep all other goals (future due dates or not closed)
      return true;
    } catch (e) {
      // If there's any error parsing the date, show the goal
      return true;
    }
  });

  if (filteredGoals.length === 0) return <div>No active goals</div>;

  const averageProgress = Math.round(
    filteredGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / filteredGoals.length
  );

  // Check if any goal is overdue and not closed
  const hasOverdueGoals = filteredGoals.some(goal => {
    if (!goal.dueDate || !goal.status) return false;
    
    try {
      const dueDate = new Date(goal.dueDate.replace(/\//g, '-'));
      const now = new Date();
      return !isNaN(dueDate.getTime()) && dueDate < now && goal.status.toLowerCase() !== 'closed';
    } catch (e) {
      return false;
    }
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