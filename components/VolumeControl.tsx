import React from 'react';

interface VolumeControlProps {
  volume: number;
  threshold: number;
  onThresholdChange: (value: number) => void;
  isLoud: boolean;
  disabled: boolean;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ 
  volume, 
  threshold, 
  onThresholdChange, 
  isLoud,
  disabled
}) => {
  const barColor = isLoud ? 'bg-rose-500' : 'bg-emerald-400';

  // Handle both mouse and touch events for better mobile support
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onThresholdChange(Number(e.target.value));
  };

  return (
    <div className="flex items-center space-x-4 w-full" title={`Threshold: ${threshold}`}>
      <span className="text-2xl flex-shrink-0" role="img" aria-label="Quiet">🤫</span>
      <div className="relative w-full h-12 flex items-center">
        {/* Background Track - Thicker for mobile */}
        <div className="w-full h-3 bg-slate-100 rounded-full inset-shadow-sm" />

        {/* Volume Fill */}
        <div 
          className={`absolute left-0 h-3 rounded-full transition-all duration-300 ease-out shadow-sm ${barColor}`}
          style={{ width: `${volume}%` }}
        />
        
        {/* Threshold Slider Input - Enhanced for mobile touch */}
        <input
          type="range"
          min="0"
          max="100"
          value={threshold}
          onChange={handleSliderChange}
          disabled={disabled}
          className="volume-slider"
          aria-label="Volume Threshold"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        />
      </div>
      <span className="text-2xl flex-shrink-0" role="img" aria-label="Loud">📢</span>
    </div>
  );
};

export default VolumeControl;
