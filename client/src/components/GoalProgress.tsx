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
    if (!goal.due_date || !goal.status) return true;
    
    try {
      // Convert YYYY/MM/DD to YYYY-MM-DD for proper Date parsing
      const dueDate = new Date(goal.due_date.replace(/\//g, '-'));
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

  // Calculate average progress, treating null/undefined as 0
  const totalProgress = filteredGoals.reduce((sum, goal) => {
    // Convert progress to a number, defaulting to 0 if null/undefined/NaN
    const progress = goal.progress !== null && goal.progress !== undefined ? Number(goal.progress) : 0;
    return sum + progress;
  }, 0);
  
  const averageProgress = filteredGoals.length > 0 ? Math.round(totalProgress / filteredGoals.length) : 0;

  // Check if any goal is overdue and not closed
  const hasOverdueGoals = filteredGoals.some(goal => {
    if (!goal.due_date || !goal.status) return false;
    
    try {
      const dueDate = new Date(goal.due_date.replace(/\//g, '-'));
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