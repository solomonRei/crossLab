import React from 'react';

export const ScrollArea = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`
        overflow-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 
        scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}; 