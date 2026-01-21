
import React, { useState, useEffect, useCallback } from 'react';
import { TimerMode } from '../types';
import { POMODORO_TIMES } from '../constants';

interface PomodoroTimerProps {
  onFocusChange?: (isFocus: boolean) => void;
  currentTask?: string;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onFocusChange, currentTask }) => {
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIMES.WORK);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>(TimerMode.WORK);
  const [autoFocus, setAutoFocus] = useState(true);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(POMODORO_TIMES[newMode]);
    setIsActive(false);
    if (onFocusChange) onFocusChange(false);
  }, [onFocusChange]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      setIsActive(false);
      if (onFocusChange) onFocusChange(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onFocusChange]);

  const toggleTimer = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    if (autoFocus && mode === TimerMode.WORK && onFocusChange) {
      onFocusChange(nextState);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-white relative overflow-hidden group">
      <div className="absolute top-[-20px] left-[-20px] text-6xl opacity-[0.03] rotate-12 pointer-events-none">⏰</div>
      <h3 className="text-[11px] font-black text-gray-700 uppercase tracking-[0.4em] mb-6 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span> Focus Flow
      </h3>
      
      <div className="flex justify-center space-x-2 mb-8">
        {[
          { label: 'Work', mode: TimerMode.WORK, icon: '✍️' },
          { label: 'Short', mode: TimerMode.SHORT_BREAK, icon: '🍵' },
          { label: 'Long', mode: TimerMode.LONG_BREAK, icon: '🌸' },
        ].map((btn) => (
          <button
            key={btn.mode}
            onClick={() => switchMode(btn.mode)}
            className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex flex-col items-center gap-1 ${
              mode === btn.mode 
                ? 'bg-orange-400 text-white shadow-lg shadow-orange-100 scale-105' 
                : 'bg-gray-50 text-gray-400 hover:bg-orange-50 hover:text-orange-300'
            }`}
          >
            <span className="text-sm">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>
      
      <div className="text-7xl font-black text-gray-800 mb-8 font-mono tracking-tighter tabular-nums drop-shadow-sm">
        {formatTime(timeLeft)}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-center space-x-3">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-5 rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-xl ${
              isActive 
                ? 'bg-gray-800 text-white shadow-gray-200' 
                : 'bg-orange-400 text-white shadow-orange-200 hover:bg-orange-500'
            }`}
          >
            {isActive ? 'PAUSE' : 'START FOCUS'}
          </button>
          <button
            onClick={() => { setIsActive(false); setTimeLeft(POMODORO_TIMES[mode]); if(onFocusChange) onFocusChange(false); }}
            className="w-16 bg-gray-50 text-gray-300 rounded-[1.5rem] flex items-center justify-center hover:bg-gray-100 hover:text-gray-400 transition-all border-2 border-white"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        <label className="flex items-center justify-center gap-2 cursor-pointer group/label">
          <div className="relative inline-flex items-center">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={autoFocus} 
              onChange={() => setAutoFocus(!autoFocus)} 
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-400"></div>
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/label:text-gray-600 transition-colors">
            Auto-Focus Mode
          </span>
        </label>
      </div>
    </div>
  );
};

export default PomodoroTimer;
