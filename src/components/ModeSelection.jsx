import React from 'react';
import { Dices, Disc, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';
import { DraggableToggleSwitch } from './DraggableToggleSwitch';
import { RoomCodeBadge } from './RoomCodeBadge';

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
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col items-center justify-center my-auto min-h-[60vh] gap-8 sm:gap-12 animate-in fade-in zoom-in-95 duration-300">
      {/* Header Banner */}
      <div className="glass-black-highlight p-7 sm:p-10 w-full text-center space-y-6 border border-slate-700/80 shadow-2xl my-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-slate-300" />
          IN-GAME GAMEMODE SELECTION
        </div>

        {gameState.roomCode && (
          <div className="flex justify-center">
            <RoomCodeBadge roomCode={gameState.roomCode} large={true} />
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-100 uppercase tracking-tight">
          Select Target Selection Mode
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-xl mx-auto leading-relaxed">
          {isHost
            ? 'Choose how the target player will be selected for this round.'
            : 'Waiting for the room host to select the gamemode for this round...'}
        </p>

        {/* Draggable Toggle Switch in the Center with Spacious Container */}
        <div className="pt-8 pb-2 flex justify-center w-full max-w-2xl mx-auto border-t border-slate-800/60 mt-6">
          <DraggableToggleSwitch
            mode={selectedMode}
            onChange={(newMode) => handleChoose(newMode)}
            disabled={!isHost}
          />
        </div>
      </div>

      {/* Gamemode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 w-full my-6">
        {/* Card 1: 1 to 21 Counting Game */}
        <div
          onClick={() => isHost && handleChoose('1-21')}
          className={`glass-black p-8 sm:p-10 flex flex-col justify-between space-y-6 transition-all duration-200 border shadow-2xl relative overflow-hidden group ${
            isHost ? 'cursor-pointer' : ''
          } ${
            selectedMode === '1-21'
              ? 'border-slate-500 bg-slate-900/90 scale-[1.01]'
              : 'border-slate-800/80 bg-slate-950/80 hover:border-slate-700 opacity-90'
          }`}
        >
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 shadow-md">
                <Dices className="w-6 h-6" />
              </div>
              {selectedMode === '1-21' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-mono font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selected
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                COUNTING GAME
              </span>
              <h3 className="text-xl font-bold font-heading text-slate-100">
                1 to 21 Counting Game
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-body">
                Players take turns counting +1, +2, or +3. Reaching 21 selects the target player.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 relative z-10">
            <button
              onClick={() => isHost && handleChoose('1-21')}
              disabled={!isHost}
              className={`w-full py-3 rounded-xl text-xs font-bold font-mono transition-all ${
                selectedMode === '1-21'
                  ? 'bg-slate-800 text-white border border-slate-600 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {selectedMode === '1-21' ? 'CURRENTLY SELECTED' : 'SELECT 1 TO 21'}
            </button>
          </div>
        </div>

        {/* Card 2: Spin the Bottle */}
        <div
          onClick={() => isHost && handleChoose('BOTTLE_SPIN')}
          className={`glass-black p-8 sm:p-10 flex flex-col justify-between space-y-6 transition-all duration-200 border shadow-2xl relative overflow-hidden group ${
            isHost ? 'cursor-pointer' : ''
          } ${
            selectedMode === 'BOTTLE_SPIN'
              ? 'border-slate-500 bg-slate-900/90 scale-[1.01]'
              : 'border-slate-800/80 bg-slate-950/80 hover:border-slate-700 opacity-90'
          }`}
        >
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200 shadow-md">
                <Disc className="w-6 h-6" />
              </div>
              {selectedMode === 'BOTTLE_SPIN' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-200 text-[10px] font-mono font-bold uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Selected
                </div>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                RANDOM SELECTION
              </span>
              <h3 className="text-xl font-bold font-heading text-slate-100">
                Spin the Bottle
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-body">
                The virtual bottle spins around the table and lands randomly on a target player.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 relative z-10">
            <button
              onClick={() => isHost && handleChoose('BOTTLE_SPIN')}
              disabled={!isHost}
              className={`w-full py-3 rounded-xl text-xs font-bold font-mono transition-all ${
                selectedMode === 'BOTTLE_SPIN'
                  ? 'bg-slate-800 text-white border border-slate-600 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {selectedMode === 'BOTTLE_SPIN' ? 'CURRENTLY SELECTED' : 'SELECT BOTTLE SPIN'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm & Launch Button */}
      {isHost ? (
        <div className="w-full max-w-sm my-4">
          <button
            onClick={handleStart}
            className="w-full btn-black-primary text-xs py-3.5 rounded-xl shadow-xl flex items-center justify-center gap-2 text-white"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START ROUND WITH {selectedMode === '1-21' ? '1 TO 21' : 'BOTTLE SPIN'}</span>
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 font-bold uppercase tracking-wider my-4">
          Waiting for room host to select mode...
        </div>
      )}
    </div>
  );
}
