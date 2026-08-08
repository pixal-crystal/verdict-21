import React from 'react';
import { Hash, Flame, Dices } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function CountingGame({ gameState, currentUser, onCountMove }) {
  const activePlayers = gameState.players.filter(p => !p.isBenched);
  const turnPlayerIndex = gameState.turnPlayerIndex % activePlayers.length;
  const currentTurnPlayer = activePlayers[turnPlayerIndex];
  const isMyTurn = currentTurnPlayer && currentTurnPlayer.id === currentUser.id;

  const currentCount = gameState.currentCount || 0;

  const handleCount = (increment) => {
    if (!isMyTurn) return;
    soundEffects.playCountBeep(increment);
    onCountMove(increment);
  };

  const renderArcNumbers = () => {
    const total = 21;
    const radius = 160;
    const centerX = 200;
    const centerY = 200;

    return Array.from({ length: total }, (_, i) => {
      const num = i + 1;
      const angle = Math.PI - (i / (total - 1)) * Math.PI;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY - Math.sin(angle) * radius;
      const isReached = num <= currentCount;
      const isCurrent = num === currentCount;

      return (
        <g key={num} className="transition-all duration-300">
          <circle
            cx={x}
            cy={y}
            r={isCurrent ? 13 : isReached ? 9 : 7}
            className={`${
              isCurrent
                ? 'fill-slate-100 stroke-white stroke-2 shadow-xl'
                : isReached
                ? 'fill-slate-400'
                : 'fill-black stroke-slate-800'
            }`}
          />
          <text
            x={x}
            y={y + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            className={`font-mono text-[10px] font-bold select-none ${
              isCurrent ? 'fill-black font-black' : isReached ? 'fill-black font-black' : 'fill-slate-600'
            }`}
          >
            {num}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-8 sm:gap-10">
      {/* Target Mode Header */}
      <div className="glass-black-highlight p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 border-l-8 border-slate-500 w-full my-2 border border-slate-700/80 shadow-xl">
        <div>
          <span className="text-xs font-mono text-slate-400 font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-slate-400" />
            1 to 21 Counting Mode
          </span>
          <h2 className="text-lg font-bold font-heading text-slate-100 mt-1">
            Whoever reaches <span className="text-slate-100 font-hero text-2xl font-black">21</span> gets selected for Truth or Dare.
          </h2>
        </div>
        <div className="text-right">
          <div className="text-xs font-heading text-slate-400 font-bold uppercase tracking-wider">Turn Player</div>
          <div className="text-sm font-bold text-slate-100 font-heading flex items-center gap-2">
            <span>{currentTurnPlayer ? currentTurnPlayer.name : 'Waiting'}</span>
            {isMyTurn && <span className="px-2.5 py-0.5 rounded-lg bg-slate-200 text-black text-[10px] font-black uppercase tracking-wider">Your Turn</span>}
          </div>
        </div>
      </div>

      {/* Main Counter Arena */}
      <div className="glass-black p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden w-full my-4 border border-slate-800/80 shadow-2xl">
        {/* Semi-Circular SVG Arc Dial */}
        <div className="relative w-full max-w-lg aspect-[2/1] flex flex-col items-center justify-end">
          <svg viewBox="0 0 400 220" className="w-full h-full drop-shadow-xl overflow-visible">
            <path
              d="M 40 200 A 160 160 0 0 1 360 200"
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="14"
              strokeLinecap="round"
            />

            <path
              d="M 40 200 A 160 160 0 0 1 360 200"
              fill="none"
              stroke="url(#pitchArcGrad)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray="502"
              strokeDashoffset={502 - (currentCount / 21) * 502}
              className="transition-all duration-500 ease-out"
            />

            <defs>
              <linearGradient id="pitchArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
            </defs>

            {renderArcNumbers()}
          </svg>

          {/* Center Display */}
          <div className="absolute bottom-2 flex flex-col items-center justify-center">
            <span className="text-xs font-heading font-bold text-slate-400 tracking-wider uppercase">Current Count</span>
            <span className="text-6xl sm:text-7xl font-black font-hero text-slate-100 my-0.5">
              {currentCount}
            </span>
            <span className="text-xs font-mono text-slate-400">/ 21</span>
          </div>
        </div>

        {/* Action Controls */}
        {isMyTurn ? (
          <div className="w-full max-w-lg space-y-4 pt-4 p-5 sm:p-6 rounded-2xl bg-black/60 border border-slate-800/80 my-3 shadow-inner">
            <div className="text-xs font-heading font-bold text-slate-300 uppercase tracking-wider">
              Select numbers to count:
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((inc) => {
                const nextVal = currentCount + inc;
                const leadsTo21 = nextVal >= 21;

                return (
                  <button
                    key={inc}
                    onClick={() => handleCount(inc)}
                    className={`p-4 sm:p-5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                      leadsTo21
                        ? 'bg-red-950/80 border-red-800 text-red-300 hover:bg-red-900 shadow-lg'
                        : 'bg-slate-900 border-slate-700 text-slate-100 hover:border-slate-400 hover:scale-105 shadow-lg'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold uppercase">+{inc}</span>
                    <span className="text-2xl font-black font-hero">
                      {inc === 1
                        ? nextVal
                        : inc === 2
                        ? `${currentCount + 1}, ${nextVal}`
                        : `${currentCount + 1}, ${currentCount + 2}, ${nextVal}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-xl bg-black border border-slate-800 text-slate-400 text-sm font-semibold my-2">
            Waiting for <strong className="text-slate-200">{currentTurnPlayer ? currentTurnPlayer.name : 'player'}</strong>...
          </div>
        )}
      </div>

      {/* Active Players Roster */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 w-full my-4">
        {activePlayers.map((player, idx) => {
          const isTurn = idx === turnPlayerIndex;
          return (
            <div
              key={player.id}
              className={`p-4 sm:p-5 rounded-xl border-2 flex items-center gap-3 transition-all ${
                isTurn
                  ? 'bg-slate-900 border-slate-500 shadow-lg scale-102'
                  : 'bg-black border-slate-800 opacity-80'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold border"
                style={{ borderColor: player.color || '#475569', backgroundColor: `${player.color || '#475569'}30` }}
              >
                {player.avatar}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-slate-100 truncate font-heading">{player.name}</div>
                <div className="text-[10px] font-mono text-slate-400">
                  {isTurn ? 'Turn Active' : 'Waiting'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Counting History */}
      <div className="glass-black p-6 space-y-3 w-full">
        <div className="text-xs font-heading font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-400" />
          Round Log
        </div>
        <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
          {gameState.countHistory && gameState.countHistory.length > 0 ? (
            gameState.countHistory.slice(-5).reverse().map((entry, index) => (
              <div key={index} className="text-xs font-mono text-slate-300 flex items-center justify-between p-2 rounded-xl bg-black border border-slate-800">
                <span className="font-bold text-slate-200">{entry.playerName}:</span>
                <span className="text-slate-400">Counted {entry.numbers.join(', ')}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 italic">Game started at 0.</div>
          )}
        </div>
      </div>
    </div>
  );
}
