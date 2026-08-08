import React, { useState } from 'react';
import { Swords, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

const RPS_CHOICES = [
  { id: 'rock', name: 'ROCK', icon: '🪨', beats: 'scissors' },
  { id: 'paper', name: 'PAPER', icon: '📄', beats: 'rock' },
  { id: 'scissors', name: 'SCISSORS', icon: '✂️', beats: 'paper' }
];

export function RpsTieBreaker({ gameState, currentUser, onRpsComplete }) {
  const duel = gameState.rpsDuel || {};
  const p1 = gameState.players.find(p => p.id === duel.player1Id);
  const p2 = gameState.players.find(p => p.id === duel.player2Id);

  const isPlayerInDuel = currentUser.id === duel.player1Id || currentUser.id === duel.player2Id;
  const [myChoice, setMyChoice] = useState(null);

  const handleSelect = (choiceId) => {
    setMyChoice(choiceId);
    soundEffects.playRpsClash();

    // Resolve 1-point match
    const p1Choice = currentUser.id === duel.player1Id ? choiceId : RPS_CHOICES[Math.floor(Math.random() * 3)].id;
    const p2Choice = currentUser.id === duel.player2Id ? choiceId : RPS_CHOICES[Math.floor(Math.random() * 3)].id;

    let loserId = null;
    if (p1Choice === p2Choice) {
      // Draw -> random tie break
      loserId = Math.random() > 0.5 ? p1.id : p2.id;
    } else {
      const p1BeatsP2 = RPS_CHOICES.find(c => c.id === p1Choice).beats === p2Choice;
      loserId = p1BeatsP2 ? p2.id : p1.id;
    }

    setTimeout(() => {
      onRpsComplete(loserId, p1Choice, p2Choice);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel-pink max-w-xl w-full p-8 sm:p-10 text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 text-xs font-mono font-bold">
            <Swords className="w-4 h-4 text-pink-400" />
            1-POINT TIE-BREAKER DUEL
          </div>
          <h2 className="text-2xl font-black text-slate-100">ROCK • PAPER • SCISSORS</h2>
          <p className="text-xs text-slate-400">
            A tie has occurred between <span className="text-cyan-400 font-bold">{p1?.name}</span> and <span className="text-pink-400 font-bold">{p2?.name}</span>!
          </p>
        </div>

        {/* Competitor Avatars */}
        <div className="flex items-center justify-center gap-10 py-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-3xl">
              {p1?.avatar || '👤'}
            </div>
            <span className="text-xs font-bold text-slate-200">{p1?.name}</span>
          </div>

          <div className="text-2xl font-black text-pink-500 font-mono animate-pulse">VS</div>

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-pink-500/20 border-2 border-pink-400 flex items-center justify-center text-3xl">
              {p2?.avatar || '👤'}
            </div>
            <span className="text-xs font-bold text-slate-200">{p2?.name}</span>
          </div>
        </div>

        {/* Choice Buttons for Dueling Players */}
        {isPlayerInDuel ? (
          <div className="space-y-5">
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase">MAKE YOUR CHOICE NOW!</div>
            <div className="grid grid-cols-3 gap-5">
              {RPS_CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice.id)}
                  disabled={myChoice !== null}
                  className={`p-5 sm:p-6 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                    myChoice === choice.id
                      ? 'bg-pink-500/30 border-pink-400 scale-105 shadow-lg shadow-pink-500/30'
                      : 'bg-slate-900/80 border-slate-700 hover:border-cyan-400 hover:scale-105'
                  }`}
                >
                  <span className="text-3xl">{choice.icon}</span>
                  <span className="text-xs font-bold font-mono">{choice.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-400 flex items-center justify-center gap-3">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            Spectating the tie-breaker clash...
          </div>
        )}
      </div>
    </div>
  );
}
