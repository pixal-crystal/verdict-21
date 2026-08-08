import React from 'react';
import { Dices, Disc, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function ModeSelection({ gameState, currentUser, onSelectMode }) {
  const isHost = gameState.isHost || (gameState.players.length > 0 && gameState.players[0].id === currentUser.id);
  const selectedMode = gameState.gameMode || '1-21';

  const handleChoose = (mode) => {
    if (!isHost) return;
    soundEffects.playTick();
    onSelectMode(mode, false); // Update mode state
  };

  const handleStart = () => {
    if (!isHost) return;
    soundEffects.playSuccessChime();
    onSelectMode(selectedMode, true); // Launch game with selected mode
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col items-center gap-8 sm:gap-10 animate-in fade-in zoom-in-95 duration-300">
      {/* Header Banner */}
      <div className="glass-black-highlight p-6 sm:p-8 w-full text-center space-y-3 border border-slate-700/80 shadow-2xl my-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-slate-300" />
          IN-GAME GAMEMODE SELECTION
        </div>
        <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-100 uppercase tracking-tight">
          Select Target Selection Mode
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed">
          {isHost
            ? 'Choose how the target player will be selected for this round.'
            : 'Waiting for the room host to select the gamemode for this round...'}
        </p>
      </div>

      {/* Gamemode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 w-full my-4">
        {/* Card 1: 1 to 21 Counting Game */}
        <div
          onClick={() => isHost && handleChoose('1-21')}
          className={`glass-black p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 border-2 shadow-2xl relative overflow-hidden group ${
            isHost ? 'cursor-pointer' : ''
          } ${
            selectedMode === '1-21'
              ? 'border-blue-400 bg-slate-900/90 shadow-blue-500/10 scale-[1.02]'
              : 'border-slate-800/80 bg-black/60 hover:border-slate-700 opacity-80'
          }`}
        >
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-md">
                <Dices className="w-6 h-6" />
              </div>
              {selectedMode === '1-21' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-mono font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selected
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-widest">
                STRATEGY & TENSION
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-100">
                1 to 21 Counting Game
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Players take turns adding +1, +2, or +3. Whoever is forced to count 21 loses and gets selected as the Target.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 relative z-10">
            <button
              onClick={() => isHost && handleChoose('1-21')}
              disabled={!isHost}
              className={`w-full py-3 rounded-xl text-xs font-bold font-heading transition-all ${
                selectedMode === '1-21'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {selectedMode === '1-21' ? 'CURRENTLY SELECTED' : 'SELECT 1 TO 21'}
            </button>
          </div>

          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-blue-500/10 blur-[40px] rounded-full pointer-events-none" />
        </div>

        {/* Card 2: Spin the Bottle */}
        <div
          onClick={() => isHost && handleChoose('BOTTLE_SPIN')}
          className={`glass-black p-6 sm:p-8 flex flex-col justify-between space-y-6 transition-all duration-300 border-2 shadow-2xl relative overflow-hidden group ${
            isHost ? 'cursor-pointer' : ''
          } ${
            selectedMode === 'BOTTLE_SPIN'
              ? 'border-pink-400 bg-slate-900/90 shadow-pink-500/10 scale-[1.02]'
              : 'border-slate-800/80 bg-black/60 hover:border-slate-700 opacity-80'
          }`}
        >
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400 shadow-md">
                <Disc className="w-6 h-6" />
              </div>
              {selectedMode === 'BOTTLE_SPIN' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-mono font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selected
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-pink-400 uppercase tracking-widest">
                RANDOM CHANCE
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-100">
                Spin the Bottle
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                The virtual bottle spins around the table and lands randomly on a player. The chosen player becomes the Target.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 relative z-10">
            <button
              onClick={() => isHost && handleChoose('BOTTLE_SPIN')}
              disabled={!isHost}
              className={`w-full py-3 rounded-xl text-xs font-bold font-heading transition-all ${
                selectedMode === 'BOTTLE_SPIN'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              {selectedMode === 'BOTTLE_SPIN' ? 'CURRENTLY SELECTED' : 'SELECT BOTTLE SPIN'}
            </button>
          </div>

          <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-pink-500/10 blur-[40px] rounded-full pointer-events-none" />
        </div>
      </div>

      {/* Confirm & Launch Button */}
      {isHost ? (
        <div className="w-full max-w-md my-4">
          <button
            onClick={handleStart}
            className="w-full btn-black-primary text-sm py-4 rounded-xl shadow-2xl flex items-center justify-center gap-3 text-white tracking-widest"
          >
            <Play className="w-5 h-5 fill-current text-white" />
            START ROUND WITH {selectedMode === '1-21' ? '1 TO 21' : 'BOTTLE SPIN'}
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-black border border-slate-800 text-xs font-mono text-slate-400 font-bold uppercase tracking-wider my-4">
          Host is selecting gamemode for this round...
        </div>
      )}
    </div>
  );
}
