import React from 'react';
import { Users, Play, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { soundEffects } from '../utils/audioSynth';
import { PlayerProfileVisualizer } from '../components/PlayerProfileVisualizer';

const AVATARS = ['✦', '◆', '❖', '◈', '▲', '⚡', '🌌', '🎯', '✨', '🪐'];
const STEALTH_ACCENTS = ['#475569', '#334155', '#1e293b', '#64748b', '#94a3b8', '#cbd5e1'];

export function ProfilePage({ currentUser, setCurrentUser }) {
  const navigate = useNavigate();

  const handleNext = () => {
    soundEffects.playTick();
    navigate('/room-setup');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center justify-center my-auto min-h-[60vh] gap-10 animate-in fade-in duration-300">
      
      {/* 1. Main Profile Settings Card */}
      <div className="w-full glass-black p-8 sm:p-12 border border-slate-800/80 shadow-2xl space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-slate-100 uppercase tracking-tight">
                Player Profile Configuration
              </h2>
              <p className="text-xs text-slate-400 font-body mt-0.5">
                Set up your display identity, theme accent, and avatar badge
              </p>
            </div>
          </div>
          <div className="text-3xl p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            {currentUser.avatar}
          </div>
        </div>

        {/* Inputs Grid (Spacious 2-column layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12 items-start">
          {/* Display Name */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold text-slate-350 uppercase tracking-wider">
              DISPLAY NAME
            </label>
            <input
              type="text"
              value={currentUser.name}
              onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
              placeholder="Enter your name..."
              maxLength={24}
              className="w-full bg-black border-2 border-slate-800 focus:border-slate-500 rounded-xl px-6 py-4.5 text-slate-100 font-bold text-sm focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Accent Color */}
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold text-slate-350 uppercase tracking-wider">
              ACCENT COLOR
            </label>
            <div className="flex items-center gap-4 p-4.5 bg-black/60 border border-slate-800/80 rounded-xl justify-around">
              {STEALTH_ACCENTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrentUser({ ...currentUser, color: c })}
                  style={{ backgroundColor: c }}
                  className={`w-10 h-10 rounded-xl border-2 transition-all cursor-pointer ${
                    currentUser.color === c ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Avatar Symbol Grid */}
        <div className="space-y-4 pt-6 border-t border-slate-800/60">
          <label className="block text-xs font-mono font-bold text-slate-350 uppercase tracking-wider">
            CHOOSE AVATAR SYMBOL
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-4.5 p-6 bg-black/50 border border-slate-800/80 rounded-2xl">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setCurrentUser({ ...currentUser, avatar: av })}
                className={`text-xl p-4 rounded-xl border-2 transition-all flex items-center justify-center aspect-square cursor-pointer ${
                  currentUser.avatar === av
                    ? 'bg-slate-800 border-slate-400 scale-105 shadow-md text-white'
                    : 'bg-black border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Standalone Live Player Card Visualizer */}
      <div className="w-full">
        <PlayerProfileVisualizer user={currentUser} />
      </div>

      {/* 3. Action Navigation Bar */}
      <div className="w-full flex justify-end pt-4">
        <button
          type="button"
          onClick={handleNext}
          className="btn-black-primary text-xs py-4 px-10 rounded-xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-all cursor-pointer"
        >
          <span>NEXT: ROOM SETUP & JOIN</span>
          <Play className="w-4 h-4 fill-current" />
        </button>
      </div>

    </div>
  );
}
