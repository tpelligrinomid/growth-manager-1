import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from './LoadingSpinner';
import './Tasks.css';

interface Task {
  id: string;
  client_folder_id: string;
  task_name: string;
  task_description: string;
  status: string;
  assignee: string;
  created_date: string;
  due_date: string;
  date_done: string | null;
  created_by: string;
  accountName?: string;
  priority?: string;
}

interface TasksProps {
  accounts: Array<{
    accountName: string;
    clientFolderId: string;
    clientListTaskId: string;
    priority: string;
  }>;
}

type TaskStatus = 'ALL' | 'WORKING' | 'DELIVERED';

const Tasks: React.FC<TasksProps> = ({ accounts }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<TaskStatus>('ALL');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        // Get the authentication token
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const tasksPromises = accounts
          .filter(account => account.clientFolderId)
          .map(async (account) => {
            const response = await fetch(
              `${API_URL}/api/bigquery/account/${account.clientFolderId}?clientListTaskId=${account.clientListTaskId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.growthTasks.map((task: Task) => ({
              ...task,
              accountName: account.accountName,
              priority: account.priority
            }));
          });

        const allTasksArrays = await Promise.all(tasksPromises);
        const allTasks = allTasksArrays.flat();
        
        setTasks(allTasks);
        setError(null);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error instanceof Error ? error.message : 'Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [accounts]);

  const filteredTasks = tasks.filter(task => {
    // Filter by status
    if (currentView !== 'ALL') {
      if (currentView === 'WORKING' && task.status !== 'In Progress') return false;
      if (currentView === 'DELIVERED' && task.status !== 'Completed') return false;
    }

    // Filter by date range
    if (startDate && endDate) {
      const taskDate = new Date(task.due_date);
      if (taskDate < startDate || taskDate > endDate) return false;
    }

    return true;
  }).sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="tasks-error">{error}</div>;
  }

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <div className="tasks-filters">
          <div className="view-toggle-container">
            <button 
              className={currentView === 'ALL' ? 'active' : ''} 
              onClick={() => setCurrentView('ALL')}
            >
              All Tasks
            </button>
            <button 
              className={currentView === 'WORKING' ? 'active' : ''} 
              onClick={() => setCurrentView('WORKING')}
            >
              Working
            </button>
            <button 
              className={currentView === 'DELIVERED' ? 'active' : ''} 
              onClick={() => setCurrentView('DELIVERED')}
            >
              Delivered
            </button>
          </div>
          <div className="date-range-picker">
            <span className="date-label">Due Date:</span>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Start Date"
              className="date-picker"
            />
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              placeholderText="End Date"
              className="date-picker"
            />
          </div>
        </div>
      </div>

      <div className="tasks-grid">
        {filteredTasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-card-header">
              <div className="task-client">{task.accountName}</div>
              <div className={`task-priority priority-${task.priority?.toLowerCase()}`}>
                {task.priority}
              </div>
            </div>
            <div className="task-name">{task.task_name}</div>
            <div className="task-details">
              <div className="task-detail">
                <span className="detail-label">Status:</span>
                <span className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`}>
                  {task.status}
                </span>
              </div>
              <div className="task-detail">
                <span className="detail-label">Assignee:</span>
                <span>{task.assignee}</span>
              </div>
              <div className="task-detail">
                <span className="detail-label">Created:</span>
                <span>{new Date(task.created_date).toLocaleDateString()}</span>
              </div>
              <div className="task-detail">
                <span className="detail-label">Due:</span>
                <span>{new Date(task.due_date).toLocaleDateString()}</span>
              </div>
              {task.date_done && (
                <div className="task-detail">
                  <span className="detail-label">Completed:</span>
                  <span>{new Date(task.date_done).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks; 