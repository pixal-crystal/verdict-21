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
    const knobWidth = 44; // w-11 (44px)
    const padding = 6;    // p-1.5 (6px)
    const availableSlide = rect.width - knobWidth - padding * 2;
    if (availableSlide <= 0) return;

    const currentX = e.clientX - rect.left - padding - knobWidth / 2;
    const clampedX = Math.max(0, Math.min(availableSlide, currentX));
    const progress = clampedX / availableSlide;
    setDragProgress(progress);
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.target.releasePointerCapture?.(e.pointerId);

    // If dragged past midpoint (0.5), switch mode
    const newMode = dragProgress > 0.5 ? 'BOTTLE_SPIN' : '1-21';
    if (newMode !== mode) {
      soundEffects.playTick();
      onChange(newMode);
    } else {
      setDragProgress(mode === '1-21' ? 0 : 1);
    }
  };

  const isCounting = mode === '1-21';

  return (
    <div className="flex flex-col items-center select-none w-full py-4">
      {/* Draggable Switch Container */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
        {/* Left Label Button */}
        <button
          type="button"
          onClick={() => {
            if (!disabled && mode !== '1-21') {
              soundEffects.playTick();
              onChange('1-21');
            }
          }}
          className={`flex items-center gap-3 text-xs font-mono font-bold uppercase transition-all px-6 py-3 rounded-xl border cursor-pointer min-w-[130px] justify-center ${
            mode === '1-21'
              ? 'bg-slate-800 border-slate-600 text-white shadow-lg scale-105'
              : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dices className="w-4 h-4 text-slate-300" />
          <span>1 to 21</span>
        </button>

        {/* Track & Knob Container */}
        <div
          ref={trackRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-40 h-14 rounded-full border cursor-grab active:cursor-grabbing p-1.5 flex items-center transition-colors duration-300 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] touch-none select-none bg-slate-900 border-slate-700/80 shrink-0 ${
            disabled ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          {/* Knob (100% Flush left at 6px on 1-21, 100% Flush right at calc(100% - 44px - 6px) on BOTTLE_SPIN) */}
          <div
            className={`absolute top-[5px] w-11 h-11 rounded-full bg-slate-800 border border-slate-600 shadow-2xl flex items-center justify-center transition-all ${
              isDragging ? 'scale-110 bg-slate-700 duration-75' : 'duration-300 ease-out'
            }`}
            style={{
              left: isDragging
                ? `calc(6px + ${dragProgress * 104}px)`
                : mode === '1-21'
                ? '6px'
                : 'calc(100% - 44px - 6px)'
            }}
          >
            {dragProgress <= 0.5 ? (
              <Dices className="w-5 h-5 text-slate-100" />
            ) : (
              <Disc className="w-5 h-5 text-slate-100" />
            )}
          </div>
        </div>

        {/* Right Label Button */}
        <button
          type="button"
          onClick={() => {
            if (!disabled && mode !== 'BOTTLE_SPIN') {
              soundEffects.playTick();
              onChange('BOTTLE_SPIN');
            }
          }}
          className={`flex items-center gap-3 text-xs font-mono font-bold uppercase transition-all px-6 py-3 rounded-xl border cursor-pointer min-w-[130px] justify-center ${
            mode === 'BOTTLE_SPIN'
              ? 'bg-slate-800 border-slate-600 text-white shadow-lg scale-105'
              : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Disc className="w-4 h-4 text-slate-300" />
          <span>Bottle Spin</span>
        </button>
      </div>

      <div className="text-[10px] font-mono text-slate-400 tracking-wider flex items-center gap-1.5 pt-6 mt-2">
        <span>↔ Drag or click switch to change gamemode</span>
      </div>
    </div>
  );
}
