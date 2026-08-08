import React from 'react';
import { EyeOff, VolumeX, Lock, Radio } from 'lucide-react';

export function IsolationChamber({ targetPlayer }) {
  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-8 glass-black-highlight text-center space-y-6 relative overflow-hidden">
      {/* Isolation Header */}
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-heading font-semibold uppercase tracking-wider">
        <Lock className="w-3.5 h-3.5 text-slate-400" />
        Isolation Active
      </div>

      <div className="space-y-2 relative z-10">
        <h2 className="text-3xl font-black font-hero text-slate-100 uppercase">
          You are the Target
        </h2>
        <p className="text-slate-300 text-sm font-heading max-w-md mx-auto">
          The remaining players are currently choosing the question for your challenge.
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 relative z-10">
        <div className="p-4 rounded-xl bg-black border border-slate-800 flex flex-col items-center gap-2">
          <EyeOff className="w-5 h-5 text-slate-400" />
          <span className="text-xs font-bold font-heading text-slate-200 uppercase">Questions Hidden</span>
        </div>

        <div className="p-4 rounded-xl bg-black border border-slate-800 flex flex-col items-center gap-2">
          <VolumeX className="w-5 h-5 text-slate-400" />
          <span className="text-xs font-bold font-heading text-slate-200 uppercase">Voice Muted</span>
        </div>

        <div className="p-4 rounded-xl bg-black border border-slate-800 flex flex-col items-center gap-2">
          <Radio className="w-5 h-5 text-slate-400 animate-pulse" />
          <span className="text-xs font-bold font-heading text-slate-200 uppercase">Chat Hidden</span>
        </div>
      </div>
    </div>
  );
}
