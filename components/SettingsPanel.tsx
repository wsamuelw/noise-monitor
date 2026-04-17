
import React from 'react';

interface SettingsPanelProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
  message: string;
  onMessageChange: (value: string) => void;
  disabled: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  threshold,
  onThresholdChange,
  message,
  onMessageChange,
  disabled
}) => {
  return (
    <div className="w-full p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg shadow-md space-y-4">
      <div>
        <label htmlFor="threshold" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Volume Threshold ({threshold})
        </label>
        <input
          id="threshold"
          type="range"
          min="0"
          max="100"
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Custom Message
        </label>
        <input
          id="message"
          type="text"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          disabled={disabled}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400
            focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
            dark:disabled:bg-slate-800 dark:disabled:text-slate-400"
          placeholder="e.g., Inside voices, please!"
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
