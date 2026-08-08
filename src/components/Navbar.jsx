import React from 'react';
import { Volume2, VolumeX, Shield, Users, Flame } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function Navbar({ gameState, currentUser, voiceMuted, toggleVoiceMute, antiScreenshot, setAntiScreenshot }) {
  const isIsolated = gameState.phase === 'QUESTION_SELECTION' && gameState.targetPlayerId === currentUser.id;

  return (
    <header className="w-full max-w-7xl mx-auto px-8 py-5 sm:px-10 sm:py-6 glass-black-dark rounded-2xl border border-slate-800 shadow-2xl z-30 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Title: VERDICT 21 */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
          <Flame className="w-5 h-5 text-slate-300" />
        </div>
        <div>
          <h1 className="text-xl font-black font-hero tracking-tight text-slate-100 uppercase flex items-center gap-1.5">
            VERDICT <span className="text-slate-400 font-extrabold">21</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase">
            TRUTH OR DARE MULTIPLAYER
          </p>
        </div>
      </div>

      {/* Room Code Badge */}
      {gameState.roomCode && (
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black border border-slate-800 shadow-lg text-xs font-mono">
          <span className="text-slate-400">ROOM:</span>
          <span className="text-slate-100 font-bold tracking-widest">{gameState.roomCode}</span>
        </div>
      )}

    </header>
  );
}
