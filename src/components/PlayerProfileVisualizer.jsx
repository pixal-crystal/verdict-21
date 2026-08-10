import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Mic, MicOff } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function PlayerProfileVisualizer({ user, className = '' }) {
  const [micActive, setMicActive] = useState(false);
  const [frequencies, setFrequencies] = useState([15, 25, 10, 35, 20, 30, 18, 40, 22, 32, 12, 28]);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  const accentColor = user?.color || '#475569';

  // Toggle Real Microphone Visualizer
  const toggleMic = async () => {
    if (micActive) {
      // Stop mic stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setMicActive(false);
      setFrequencies([15, 25, 10, 35, 20, 30, 18, 40, 22, 32, 12, 28]);
      return;
    }

    try {
      soundEffects.playTick();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      setMicActive(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateFrequencies = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Map real 12 frequency bins to height percentages (10% to 100%)
        const newFreqs = [];
        const step = Math.floor(dataArray.length / 12);
        for (let i = 0; i < 12; i++) {
          const val = dataArray[i * step] || 0;
          const height = Math.max(10, Math.min(100, Math.round((val / 255) * 100)));
          newFreqs.push(height);
        }

        setFrequencies(newFreqs);
        animFrameRef.current = requestAnimationFrame(updateFrequencies);
      };

      updateFrequencies();
    } catch (err) {
      console.warn('Microphone access for visualizer denied or unavailable:', err);
      setMicActive(false);
    }
  };

  // Fallback gentle ambient pulse when mic is off
  useEffect(() => {
    if (micActive) return;

    const interval = setInterval(() => {
      setFrequencies(prev =>
        prev.map(() => Math.floor(Math.random() * 35) + 12)
      );
    }, 200);

    return () => clearInterval(interval);
  }, [micActive]);

  // Clean up mic streams on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div
      className={`w-full bg-slate-950/90 rounded-2xl p-8 sm:p-10 border border-slate-800/80 shadow-2xl relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        boxShadow: `0 20px 40px -15px ${accentColor}25, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
      }}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Left Side: Avatar & Name */}
        <div className="flex items-center gap-6">
          <div
            className="w-16 h-16 rounded-2xl bg-black border-2 flex items-center justify-center text-3xl shadow-xl relative transition-all duration-300 shrink-0"
            style={{
              borderColor: accentColor,
              boxShadow: `0 0 25px ${accentColor}40`
            }}
          >
            <span>{user?.avatar || '✦'}</span>
            <div
              className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black bg-emerald-400 shadow-sm"
              title="Online"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <h3 className="text-xl font-bold font-heading text-slate-100 uppercase tracking-tight">
              {user?.name || 'PLAYER 1'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
              <span className="text-xs text-slate-400 font-mono">
                {micActive ? 'Mic Audio Live' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Working Web Audio / Mic Frequency Equalizer */}
        <div className="flex items-center gap-4 bg-black/60 p-4 px-6 rounded-2xl border border-slate-800/80 w-full sm:w-auto justify-between sm:justify-end shadow-inner">
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
              micActive
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md scale-105'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={micActive ? 'Disable Microphone Input' : 'Enable Real Microphone Visualizer'}
          >
            {micActive ? <Mic className="w-4 h-4 text-emerald-400 animate-pulse" /> : <MicOff className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Working Audio Equalizer Frequency Bars */}
          <div className="flex items-end gap-1.5 h-8 w-40 px-1">
            {frequencies.map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all duration-75"
                style={{
                  height: `${height}%`,
                  backgroundColor: micActive
                    ? height > 60
                      ? '#34d399'
                      : accentColor
                    : '#475569',
                  opacity: micActive ? 0.95 : 0.6
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
