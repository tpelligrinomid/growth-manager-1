import React from 'react';
import './GoalProgress.css';
import { Goal } from '../types';

interface GoalProgressProps {
  goals: Array<Goal>;
  detailed?: boolean;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goals, detailed = false }) => {
  if (!goals || goals.length === 0) return <div>No goals</div>;

  // Filter goals to show:
  // 1. Hide goals if Complete/Closed regardless of progress
  // 2. Hide if 100% complete and past due
  const activeGoals = goals.filter(goal => {
    // 1. Status check
    const upperStatus = goal.status?.toUpperCase();
    if (upperStatus === 'COMPLETE' || upperStatus === 'CLOSED') return false;
    
    // 2. Past due and complete check
    const isDueInPast = new Date(goal.due_date) < new Date();
    if (isDueInPast && (goal.progress ?? 0) === 100) return false;
    
    return true;
  });

  if (activeGoals.length === 0) return <div>No active goals</div>;

  // Calculate average progress of active goals
  const totalProgress = activeGoals.reduce((sum, goal) => {
    return sum + (goal.progress ?? 0);
  }, 0);
  
  const averageProgress = Math.round(totalProgress / activeGoals.length);

  if (!detailed) {
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
  }

  return (
    <table className="goals-table">
      <tbody>
        {goals.map((goal, index) => {
          const isOverdue = new Date(goal.due_date) < new Date() && (goal.progress ?? 0) < 100;
          return (
            <tr key={index}>
              <td>{goal.task_name}</td>
              <td>{new Date(goal.due_date).toLocaleDateString()}</td>
              <td className="progress-cell">
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${isOverdue ? 'overdue' : ''}`}
                      style={{ width: `${goal.progress ?? 0}%` }}
                    />
                  </div>
                  <span className="progress-text">{goal.progress || 0}%</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}; 