import React from 'react';

interface Props {
  message?: string;
}

export const LoadingSpinner: React.FC<Props> = ({ message = 'Loading accounts...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}; 