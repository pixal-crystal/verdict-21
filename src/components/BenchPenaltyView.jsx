import React from 'react';
import { UserX, Clock } from 'lucide-react';

export function BenchPenaltyView({ roundsLeft, player }) {
  return (
    <div className="w-full max-w-xl mx-auto my-8 p-8 glass-black-highlight text-center space-y-6">
      {/* Warning Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase">
        <UserX className="w-4 h-4 text-slate-400" />
        Player Benched
      </div>

      <div className="space-y-2 relative z-10">
        <h2 className="text-3xl font-black font-hero text-slate-100 uppercase">
          Timeout Penalty
        </h2>
        <p className="text-slate-300 text-sm font-heading max-w-md mx-auto">
          <strong className="text-white">{player?.name || 'You'}</strong> failed to answer within 30 seconds and is benched for 2 rounds.
        </p>
      </div>

      {/* Remaining Rounds Counter */}
      <div className="p-6 rounded-2xl bg-black border border-slate-800 flex flex-col items-center justify-center space-y-2 relative z-10 shadow-xl">
        <Clock className="w-8 h-8 text-slate-400 animate-spin" />
        <span className="text-xs font-heading font-bold text-slate-400 uppercase tracking-wider">Remaining Bench Suspension</span>
        
        <span className="text-5xl font-black font-hero text-slate-100">
          {roundsLeft} Round{roundsLeft !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
