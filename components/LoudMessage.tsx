import React from 'react';

interface LoudMessageProps {
  message: string;
}

const LoudMessage: React.FC<LoudMessageProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 h-48">
      <div className="w-20 h-20 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-orange-500 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      </div>
      <p className="text-2xl font-medium text-slate-800 dark:text-slate-100">{message}</p>
    </div>
  );
};

export default LoudMessage;
