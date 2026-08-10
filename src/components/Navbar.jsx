import React from 'react';
import { Layers, Dices, Disc, RefreshCw } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';
import { RoomCodeBadge } from './RoomCodeBadge';

export function Navbar({ gameState, currentUser, onSwitchMode }) {
  const isIsolated = gameState.phase === 'QUESTION_SELECTION' && gameState.targetPlayerId === currentUser.id;
  const isHost = gameState.isHost || (gameState.players.length > 0 && gameState.players[0]?.id === currentUser.id);

  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-5 glass-black-dark rounded-2xl border border-slate-800/80 shadow-2xl z-30 flex flex-col items-center justify-center gap-3.5 text-center">
      {/* Centered Brand Title: VERDICT 21 */}
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5 text-slate-200" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-hero tracking-tight text-slate-100 uppercase flex items-center gap-2">
            VERDICT <span className="text-slate-500 font-bold">21</span>
          </h1>
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono tracking-widest font-medium uppercase">
          MULTIPLAYER EXPERIENCE
        </p>
      </div>

      {/* Room Code & Host Controls (Only visible during active game) */}
      {gameState.phase !== 'LOBBY' && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1 border-t border-slate-800/60 w-full max-w-md">
          {gameState.roomCode && (
            <RoomCodeBadge roomCode={gameState.roomCode} />
          )}

          {isHost && (
            <button
              onClick={() => {
                soundEffects.playTick();
                onSwitchMode();
              }}
              disabled={isIsolated}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
              title="Change gamemode during game"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>SWITCH MODE</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}

