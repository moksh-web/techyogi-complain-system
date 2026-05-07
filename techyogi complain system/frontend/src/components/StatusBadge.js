import React from 'react';

const StatusBadge = ({ status, priority }) => {
  if (priority) {
    const priorityStyles = {
      High: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      Medium: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      Low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyles[priority] || priorityStyles.Low}`}>
        {priority}
      </span>
    );
  }

  const statusStyles = {
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.Pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Pending' ? 'bg-yellow-500' :
        status === 'In Progress' ? 'bg-blue-500' :
        'bg-green-500'
      }`} />
      {status}
    </span>
  );
};

export default StatusBadge;
