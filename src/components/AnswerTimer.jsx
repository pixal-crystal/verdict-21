import React, { useState, useEffect } from 'react';
import { Clock, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function AnswerTimer({ gameState, currentUser, onAnswerSubmit, onTimeoutPenalty, onNextRound }) {
  const [secondsLeft, setSecondsLeft] = useState(gameState.timerSeconds || 30);
  const [answerInput, setAnswerInput] = useState('');
  const [isRevealed, setIsRevealed] = useState(gameState.answerSubmitted || false);

  const targetPlayer = gameState.players.find(p => p.id === gameState.targetPlayerId);
  const isTarget = currentUser.id === gameState.targetPlayerId;
  const question = gameState.selectedQuestion || { text: 'Truth or Dare Challenge', type: 'truth' };

  useEffect(() => {
    if (isRevealed) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          soundEffects.playBuzzer();
          onTimeoutPenalty(gameState.targetPlayerId);
          return 0;
        }
        if (prev <= 6) {
          soundEffects.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRevealed, gameState.targetPlayerId]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!answerInput.trim()) return;
    soundEffects.playSuccessChime();
    setIsRevealed(true);
    onAnswerSubmit(answerInput.trim());
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-4 flex flex-col gap-8">
      {/* Target Question Card */}
      <div className="glass-black-highlight p-6 sm:p-8 text-center space-y-4 border-l-8 border-slate-400 border border-slate-700/80 shadow-xl my-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase tracking-wider">
          {question.type?.toUpperCase()} FOR {targetPlayer?.name}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-100 max-w-xl mx-auto leading-tight">
          "{question.text}"
        </h2>
      </div>

      {!isRevealed ? (
        /* Countdown Timer & Answer Form */
        <div className="glass-black p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-8 my-4 border border-slate-800/80 shadow-2xl">
          {/* Timer Clock Circle */}
          <div className="relative w-40 h-40 rounded-full bg-black border-4 border-slate-700 flex flex-col items-center justify-center shadow-xl">
            <Clock className="w-5 h-5 text-slate-400 mb-1" />
            <span className={`text-4xl font-black font-hero ${secondsLeft <= 5 ? 'text-red-400 animate-ping' : 'text-slate-100'}`}>
              00:{secondsLeft < 10 ? `0${secondsLeft}` : secondsLeft}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mt-1">REMAINING</span>
          </div>

          {secondsLeft <= 5 && (
            <div className="text-xs font-heading font-bold text-red-400 uppercase tracking-wider flex items-center gap-2 animate-bounce">
              <AlertTriangle className="w-4 h-4" />
              Answer before time expires to avoid 2-round bench penalty!
            </div>
          )}

          {isTarget ? (
            /* Target Answer Input Box */
            <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4 my-2">
              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Type your response here..."
                rows={3}
                className="w-full bg-black border-2 border-slate-800 focus:border-slate-500 rounded-xl p-4 text-xs text-slate-100 focus:outline-none resize-none shadow-inner"
              />
              <button
                type="submit"
                disabled={!answerInput.trim()}
                className="w-full btn-black-primary text-xs py-3.5 rounded-xl shadow-lg"
              >
                <Send className="w-4 h-4" />
                Submit Answer
              </button>
            </form>
          ) : (
            /* Spectator View */
            <div className="p-5 rounded-xl bg-black border border-slate-800 text-slate-300 text-xs font-semibold my-2">
              Waiting for <strong className="text-white">{targetPlayer?.name}</strong> to answer...
            </div>
          )}
        </div>
      ) : (
        /* Post-Answer Reveal View */
        <div className="glass-black p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200 my-4 border border-slate-800/80 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono font-bold uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Answer Revealed
          </div>

          <div className="p-6 rounded-2xl bg-black border border-slate-800 text-left space-y-4 shadow-xl my-2">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">Question:</div>
            <div className="text-sm font-medium text-slate-300 italic font-heading">"{question.text}"</div>
            
            <div className="border-t border-slate-800 pt-4">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase">{targetPlayer?.name}'s Response:</div>
              <div className="text-xl font-bold font-heading text-slate-100 mt-1">{gameState.answerText || answerInput}</div>
            </div>
          </div>

          <div className="pt-3">
            <button
              onClick={onNextRound}
              className="btn-black-primary text-xs px-8 py-3.5 rounded-xl shadow-lg"
            >
              Start Next Round
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
