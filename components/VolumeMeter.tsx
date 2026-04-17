
import React from 'react';

interface VolumeMeterProps {
  volume: number;
  threshold: number;
  isLoud: boolean;
}

const VolumeMeter: React.FC<VolumeMeterProps> = ({ volume, threshold, isLoud }) => {
  const barColor = isLoud 
    ? 'bg-gradient-to-r from-amber-500 via-red-500 to-red-600' 
    : 'bg-gradient-to-r from-green-400 to-blue-500';

  return (
    <div className="w-full my-6">
      <div className="relative w-full h-8 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-100 ease-linear ${barColor}`}
          style={{ width: `${volume}%` }}
        />
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white/50 dark:bg-black/50"
          style={{ left: `${threshold}%` }}
          title={`Threshold: ${threshold}`}
        >
          <div className="absolute -top-2 -ml-2.5 text-slate-500 dark:text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5a1 1 0 112 0v5.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 10.586V5z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeMeter;
