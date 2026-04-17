import React, { useState, useEffect } from 'react';
import { useAudioAnalyzer } from './hooks/useAudioAnalyzer';
import { useSpeechSynthesizer } from './hooks/useSpeechSynthesizer';
import VolumeControl from './components/VolumeControl';
import { AppStatus } from './types';

const App: React.FC = () => {
  const [threshold, setThreshold] = useState(50);
  const [message, setMessage] = useState('Please keep quiet');
  const [isLoud, setIsLoud] = useState(false);
  
  const { volume, status, error, startListening, stopListening } = useAudioAnalyzer();

  const { speak, cancel } = useSpeechSynthesizer();
  const isListening = status === AppStatus.Listening;

  useEffect(() => {
    if (isListening) {
      if (volume > threshold && !isLoud) {
        setIsLoud(true);
        speak(message);
      } else if (volume <= threshold && isLoud) {
        setIsLoud(false);
      }
    } else {
      if (isLoud) {
        setIsLoud(false);
      }
    }
  }, [volume, threshold, isListening, isLoud, message, speak]);

  const handleStop = () => {
    stopListening();
    cancel();
  };
  
  const statusText = () => {
      if (error) return <p className="text-rose-500 font-medium text-center text-sm">{error}</p>;
      switch (status) {
          case AppStatus.Listening:
              return (
                <div className="flex items-center justify-center space-x-2 text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-full">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <p>Monitoring in action</p>
                </div>
              );
          case AppStatus.PermissionDenied:
              return <p className="text-amber-600 font-medium bg-amber-50 px-4 py-2 rounded-full">Microphone permission denied.</p>;
          default:
              return null;
      }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans text-slate-800">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-10 space-y-10 relative">
        <header className="text-center space-y-3 pt-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Noise Monitor
          </h1>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Adjust the slider for noise sensitivity.
          </p>
        </header>
        
        <main className="space-y-8">
          <div className="space-y-8">
            <VolumeControl
              volume={volume}
              threshold={threshold}
              onThresholdChange={setThreshold}
              isLoud={isLoud}
              disabled={false}
            />
            
            <div className="w-full space-y-3 pt-2">
              <label htmlFor="message" className="block text-[15px] font-semibold text-slate-700 px-1">
                Personalised Message
              </label>
              <input
                id="message"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 text-slate-800 placeholder-slate-400 text-lg transition-all"
                placeholder="e.g. Quiet time, please"
              />
            </div>
          </div>
        </main>
        
        <footer className="pt-4 pb-2 space-y-6">
          <button
            onClick={isListening ? handleStop : startListening}
            className={`w-full text-xl font-bold text-white rounded-[2rem] px-6 py-5 text-center transition-all duration-200 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] active:scale-[0.98] ${
              isListening 
                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
            }`}
          >
            {isListening ? 'Stop' : 'Start'}
          </button>
          
          <div className="h-10 flex items-center justify-center text-sm">
            {statusText()}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
