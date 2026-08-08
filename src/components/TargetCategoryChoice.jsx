import React from 'react';
import { ShieldAlert, Flame, Sparkles, HelpCircle, Zap } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function TargetCategoryChoice({ gameState, currentUser, onChooseCategory }) {
  const targetPlayer = gameState.players.find(p => p.id === gameState.targetPlayerId) || { name: 'Target Player' };
  const isTarget = currentUser.id === gameState.targetPlayerId;

  const handleSelect = (category) => {
    soundEffects.playSuccessChime();
    onChooseCategory(category);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center gap-10 sm:gap-14 animate-in fade-in zoom-in-95 duration-300">
      {/* Header Banner */}
      <div className="glass-black-highlight p-10 sm:p-14 w-full text-center space-y-6 border border-slate-700/80 shadow-2xl my-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          TARGET CHOICE PHASE
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-black font-heading text-slate-100 uppercase tracking-tight">
          {isTarget ? 'YOUR FATE IS IN YOUR HANDS!' : `${targetPlayer.name} IS CHOOSING THEIR FATE!`}
        </h2>

        <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
          {isTarget ? (
            <span>You have been selected as the Target! Choose whether you will answer a <strong className="text-blue-400">TRUTH</strong> or perform a <strong className="text-pink-400">DARE</strong>.</span>
          ) : (
            <span>Waiting for <strong className="text-white">{targetPlayer.name}</strong> to decide whether they want a Truth or a Dare challenge for this round...</span>
          )}
        </p>
      </div>

      {/* Choice Buttons for Target Player */}
      {isTarget ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14 w-full my-6">
          {/* TRUTH Option */}
          <div
            onClick={() => handleSelect('truth')}
            className="glass-black p-10 sm:p-12 flex flex-col justify-between space-y-8 border-2 border-blue-500/50 bg-gradient-to-b from-blue-950/60 to-black hover:border-blue-400 cursor-pointer shadow-2xl hover:scale-[1.03] transition-all group rounded-2xl relative overflow-hidden"
          >
            <div className="space-y-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-lg group-hover:scale-110 transition-transform">
                <HelpCircle className="w-8 h-8" />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
                  HONEST REVELATION
                </span>
                <h3 className="text-3xl font-black font-heading text-slate-100">
                  TRUTH
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  Answer a revealing, high-stakes question submitted and voted on by the other players.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSelect('truth')}
              className="w-full py-4 rounded-xl text-xs font-black font-heading bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all uppercase tracking-wider relative z-10"
            >
              I CHOOSE TRUTH
            </button>

            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
          </div>

          {/* DARE Option */}
          <div
            onClick={() => handleSelect('dare')}
            className="glass-black p-10 sm:p-12 flex flex-col justify-between space-y-8 border-2 border-pink-500/50 bg-gradient-to-b from-pink-950/60 to-black hover:border-pink-400 cursor-pointer shadow-2xl hover:scale-[1.03] transition-all group rounded-2xl relative overflow-hidden"
          >
            <div className="space-y-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400 shadow-lg group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8" />
              </div>

              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest">
                  BOLD ACTION
                </span>
                <h3 className="text-3xl font-black font-heading text-slate-100">
                  DARE
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                  Complete a daring challenge proposed and voted on by the other players.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSelect('dare')}
              className="w-full py-4 rounded-xl text-xs font-black font-heading bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/30 transition-all uppercase tracking-wider relative z-10"
            >
              I CHOOSE DARE
            </button>

            <div className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-pink-500/10 blur-[40px] rounded-full pointer-events-none" />
          </div>
        </div>
      ) : (
        /* Spectator Waiting View */
        <div className="p-10 sm:p-12 rounded-2xl bg-black/80 border border-slate-800 text-center space-y-5 max-w-lg w-full my-6 shadow-xl">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
          <h4 className="text-xl font-bold font-heading text-slate-200">
            Waiting for {targetPlayer.name}
          </h4>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
            Once {targetPlayer.name} selects Truth or Dare, you will be able to submit and vote on custom questions!
          </p>
        </div>
      )}
    </div>
  );
}
