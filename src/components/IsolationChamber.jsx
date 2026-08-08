import React from 'react';
import { EyeOff, VolumeX, Lock, Radio } from 'lucide-react';

export function IsolationChamber({ targetPlayer }) {
  return (
    <div className="w-full max-w-2xl mx-auto my-10 p-10 sm:p-14 glass-black-highlight text-center space-y-10 relative overflow-hidden border border-slate-700/80 shadow-2xl">
      {/* Isolation Header */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-heading font-semibold uppercase tracking-wider">
        <Lock className="w-4 h-4 text-slate-400" />
        Isolation Active
      </div>

      <div className="space-y-4 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-black font-hero text-slate-100 uppercase">
          You are the Target
        </h2>
        <p className="text-slate-300 text-sm font-heading max-w-md mx-auto leading-relaxed">
          The remaining players are currently choosing the question for your challenge.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-4 relative z-10">
        <div className="p-7 rounded-2xl bg-black/80 border border-slate-800 flex flex-col items-center gap-4 shadow-lg">
          <EyeOff className="w-6 h-6 text-slate-400" />
          <span className="text-xs font-bold font-heading text-slate-200 uppercase tracking-wider">Questions Hidden</span>
        </div>

        <div className="p-7 rounded-2xl bg-black/80 border border-slate-800 flex flex-col items-center gap-4 shadow-lg">
          <VolumeX className="w-6 h-6 text-slate-400" />
          <span className="text-xs font-bold font-heading text-slate-200 uppercase tracking-wider">Voice Muted</span>
        </div>

        <div className="p-7 rounded-2xl bg-black/80 border border-slate-800 flex flex-col items-center gap-4 shadow-lg">
          <Radio className="w-6 h-6 text-slate-400 animate-pulse" />
          <span className="text-xs font-bold font-heading text-slate-200 uppercase tracking-wider">Chat Hidden</span>
        </div>
      </div>
    </div>
  );
}
