import React from 'react';
import { Flame, Dices, Disc, RefreshCw } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';
import { RoomCodeBadge } from './RoomCodeBadge';

export function Navbar({ gameState, currentUser, onSwitchMode }) {
  const isIsolated = gameState.phase === 'QUESTION_SELECTION' && gameState.targetPlayerId === currentUser.id;
  const isHost = gameState.isHost || (gameState.players.length > 0 && gameState.players[0]?.id === currentUser.id);

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

      {/* Room Code & In-Game Gamemode Badge / Switcher */}
      <div className="flex items-center gap-4">
        {gameState.roomCode && (
          <RoomCodeBadge roomCode={gameState.roomCode} />
        )}

        {gameState.phase !== 'LOBBY' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-200">
              {gameState.gameMode === '1-21' ? (
                <>
                  <Dices className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-300">MODE: 1 TO 21</span>
                </>
              ) : (
                <>
                  <Disc className="w-3.5 h-3.5 text-pink-400" />
                  <span className="text-pink-300">MODE: BOTTLE SPIN</span>
                </>
              )}
            </div>

            {isHost && (
              <button
                onClick={() => {
                  soundEffects.playTick();
                  onSwitchMode();
                }}
                disabled={isIsolated}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-heading font-bold transition-all shadow-md"
                title="Change gamemode during game"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-300" />
                <span>SWITCH MODE</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

