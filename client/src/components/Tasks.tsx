import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
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
  accountName?: string; // Added from account data
}

interface TasksProps {
  accounts: Array<{
    accountName: string;
    clientFolderId: string;
    clientListTaskId: string;
  }>;
}

const Tasks: React.FC<TasksProps> = ({ accounts }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        // Fetch tasks for all accounts with clientFolderId
        const tasksPromises = accounts
          .filter(account => account.clientFolderId)
          .map(async (account) => {
            const response = await fetch(
              `${API_URL}/api/bigquery/account/${account.clientFolderId}?clientListTaskId=${account.clientListTaskId}`
            );
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Map account name to tasks
            return data.growthTasks.map((task: Task) => ({
              ...task,
              accountName: account.accountName
            }));
          });

        const allTasksArrays = await Promise.all(tasksPromises);
        const allTasks = allTasksArrays.flat();
        
        // Sort tasks by created date (newest first)
        const sortedTasks = allTasks.sort((a, b) => 
          new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
        );
        
        setTasks(sortedTasks);
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

  if (isLoading) {
    return <div className="tasks-loading">Loading tasks...</div>;
  }

  if (error) {
    return <div className="tasks-error">{error}</div>;
  }

  return (
    <div className="tasks-container">
      <h2>Growth Tasks</h2>
      <div className="tasks-table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Task Name</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Created Date</th>
              <th>Due Date</th>
              <th>Completed Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.accountName}</td>
                <td>{task.task_name}</td>
                <td>{task.status}</td>
                <td>{task.assignee}</td>
                <td>{new Date(task.created_date).toLocaleDateString()}</td>
                <td>{new Date(task.due_date).toLocaleDateString()}</td>
                <td>
                  {task.date_done 
                    ? new Date(task.date_done).toLocaleDateString() 
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tasks; 