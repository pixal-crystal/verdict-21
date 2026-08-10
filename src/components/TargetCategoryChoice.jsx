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
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex flex-col items-center justify-center my-auto min-h-[60vh] gap-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Header Banner */}
      <div className="glass-black-highlight p-8 sm:p-10 w-full text-center space-y-4 border border-slate-700/80 shadow-2xl my-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          TARGET CATEGORY SELECTION
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-100 uppercase tracking-tight">
          {isTarget ? 'Select Your Challenge Category' : `${targetPlayer.name} is Selecting a Category`}
        </h2>

        <p className="text-slate-400 text-xs sm:text-sm font-body max-w-lg mx-auto leading-relaxed">
          {isTarget ? (
            <span>You are the Target for this round. Choose whether to take a <strong className="text-slate-200">Truth</strong> or a <strong className="text-slate-200">Dare</strong>.</span>
          ) : (
            <span>Waiting for <strong className="text-slate-200">{targetPlayer.name}</strong> to pick between Truth or Dare for this round...</span>
          )}
        </p>
      </div>

      {/* Choice Buttons for Target Player */}
      {isTarget ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full my-4">
          {/* TRUTH Option */}
          <div
            onClick={() => handleSelect('truth')}
            className="glass-black p-8 sm:p-10 flex flex-col justify-between space-y-6 border border-slate-800 bg-slate-950/90 hover:border-slate-600 cursor-pointer shadow-2xl hover:scale-[1.01] transition-all group rounded-2xl relative overflow-hidden"
          >
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 shadow-md">
                <HelpCircle className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  QUESTION CATEGORY
                </span>
                <h3 className="text-2xl font-bold font-heading text-slate-100">
                  TRUTH
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-body">
                  Answer a question submitted and voted on by players.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSelect('truth')}
              className="w-full btn-black-primary text-xs py-3.5 rounded-xl uppercase tracking-wider relative z-10"
            >
              SELECT TRUTH
            </button>
          </div>

          {/* DARE Option */}
          <div
            onClick={() => handleSelect('dare')}
            className="glass-black p-8 sm:p-10 flex flex-col justify-between space-y-6 border border-slate-800 bg-slate-950/90 hover:border-slate-600 cursor-pointer shadow-2xl hover:scale-[1.01] transition-all group rounded-2xl relative overflow-hidden"
          >
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 shadow-md">
                <Zap className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  ACTION CATEGORY
                </span>
                <h3 className="text-2xl font-bold font-heading text-slate-100">
                  DARE
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-body">
                  Perform a challenge proposed and voted on by players.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSelect('dare')}
              className="w-full btn-black-accent text-xs py-3.5 rounded-xl uppercase tracking-wider relative z-10"
            >
              SELECT DARE
            </button>
          </div>
        </div>
      ) : (
        /* Spectator Waiting View */
        <div className="p-8 sm:p-10 rounded-2xl bg-black/80 border border-slate-800 text-center space-y-4 max-w-md w-full my-4 shadow-xl">
          <Sparkles className="w-6 h-6 text-slate-400 mx-auto animate-pulse" />
          <h4 className="text-base font-bold font-heading text-slate-200">
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
