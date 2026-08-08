import React, { useState, useRef, useEffect } from 'react';
import { Dices, Disc } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function DraggableToggleSwitch({ mode, onChange, disabled = false }) {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(mode === '1-21' ? 0 : 1); // 0 = 1-21, 1 = BOTTLE_SPIN

  useEffect(() => {
    if (!isDragging) {
      setDragProgress(mode === '1-21' ? 0 : 1);
    }
  }, [mode, isDragging]);

  const handlePointerDown = (e) => {
    if (disabled) return;
    setIsDragging(true);
    e.target.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const knobWidth = 48; // 12 * 4
    const padding = 6;
    const maxSlide = rect.width - knobWidth - padding * 2;
    if (maxSlide <= 0) return;

    const currentX = e.clientX - rect.left - padding - knobWidth / 2;
    const clampedX = Math.max(0, Math.min(maxSlide, currentX));
    const progress = clampedX / maxSlide;
    setDragProgress(progress);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.target.releasePointerCapture?.(e.pointerId);

    // If dragged past midpoint, switch to BOTTLE_SPIN, else 1-21
    const newMode = dragProgress > 0.5 ? 'BOTTLE_SPIN' : '1-21';
    if (newMode !== mode) {
      soundEffects.playTick();
      onChange(newMode);
    } else {
      setDragProgress(mode === '1-21' ? 0 : 1);
    }
  };

  const handleToggleClick = () => {
    if (disabled || isDragging) return;
    const nextMode = mode === '1-21' ? 'BOTTLE_SPIN' : '1-21';
    soundEffects.playTick();
    onChange(nextMode);
  };

  const isCounting = dragProgress <= 0.5;

  return (
    <div className="flex flex-col items-center gap-3 my-4 select-none">
      {/* Draggable Switch Container */}
      <div className="flex items-center justify-center gap-4">
        {/* Left Label */}
        <button
          type="button"
          onClick={() => {
            if (!disabled && mode !== '1-21') {
              soundEffects.playTick();
              onChange('1-21');
            }
          }}
          className={`flex items-center gap-2 text-xs font-mono font-bold uppercase transition-all px-3 py-1.5 rounded-xl border ${
            mode === '1-21'
              ? 'bg-blue-950/80 border-blue-500 text-blue-300 shadow-md shadow-blue-500/20 scale-105'
              : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dices className="w-4 h-4 text-blue-400" />
          <span>1 to 21</span>
        </button>

        {/* Track & Knob */}
        <div
          ref={trackRef}
          onClick={handleToggleClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-40 h-14 rounded-full border cursor-grab active:cursor-grabbing p-1.5 flex items-center transition-colors duration-300 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] touch-none ${
            isCounting
              ? 'bg-gradient-to-r from-blue-950/90 via-slate-900 to-black border-blue-500/50 shadow-blue-500/10'
              : 'bg-gradient-to-r from-black via-slate-900 to-pink-950/90 border-pink-500/50 shadow-pink-500/10'
          } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          {/* Knob */}
          <div
            className={`w-11 h-11 rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all ${
              isDragging ? 'scale-110 shadow-2xl' : 'duration-300 ease-out'
            }`}
            style={{
              transform: `translateX(${dragProgress * (160 - 44 - 12)}px)`
            }}
          >
            {isCounting ? (
              <Dices className="w-5 h-5 text-blue-600 animate-pulse" />
            ) : (
              <Disc className="w-5 h-5 text-pink-600 animate-pulse" />
            )}
          </div>

          {/* Background track text */}
          <div className="absolute inset-0 flex items-center justify-between px-4 text-[9px] font-mono font-bold text-slate-500 pointer-events-none uppercase tracking-widest">
            <span className={dragProgress < 0.3 ? 'opacity-0' : 'opacity-100'}>1-21</span>
            <span className={dragProgress > 0.7 ? 'opacity-0' : 'opacity-100'}>SPIN</span>
          </div>
        </div>

        {/* Right Label */}
        <button
          type="button"
          onClick={() => {
            if (!disabled && mode !== 'BOTTLE_SPIN') {
              soundEffects.playTick();
              onChange('BOTTLE_SPIN');
            }
          }}
          className={`flex items-center gap-2 text-xs font-mono font-bold uppercase transition-all px-3 py-1.5 rounded-xl border ${
            mode === 'BOTTLE_SPIN'
              ? 'bg-pink-950/80 border-pink-500 text-pink-300 shadow-md shadow-pink-500/20 scale-105'
              : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Disc className="w-4 h-4 text-pink-400" />
          <span>Bottle Spin</span>
        </button>
      </div>

      <div className="text-[10px] font-mono text-slate-400 tracking-wider flex items-center gap-1.5">
        <span>↔ Drag or click switch to change gamemode</span>
      </div>
    </div>
  );
}
