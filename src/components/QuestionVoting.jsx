import React, { useState } from 'react';
import { ThumbsUp, Plus, Crown, MessageSquare, Check, Sparkles } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function QuestionVoting({ gameState, currentUser, onVoteQuestion, onSubmitCustomQuestion, onLockQuestion }) {
  const [customText, setCustomText] = useState('');
  const [questionType, setQuestionType] = useState('truth');

  const targetPlayer = gameState.players.find(p => p.id === gameState.targetPlayerId);
  const leadAsker = gameState.players.find(p => p.id === gameState.leadAskerId);

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    soundEffects.playSuccessChime();
    onSubmitCustomQuestion({
      id: `q_user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: customText.trim(),
      type: questionType,
      votes: [currentUser.id]
    });
    setCustomText('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="glass-black-highlight p-6 sm:p-7 flex flex-wrap items-center justify-between gap-4 border-l-8 border-slate-400 w-full border border-slate-700/80 shadow-xl my-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl">
            {targetPlayer?.avatar || '🎯'}
          </div>
          <div>
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Target Player: {targetPlayer?.name}
            </div>
            <h2 className="text-lg font-bold font-heading text-slate-100">
              Submit your question for {targetPlayer?.name} & vote on the best one
            </h2>
          </div>
        </div>

        {/* Lead Asker Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black border border-slate-800 text-slate-300 text-xs font-heading font-semibold">
          <Crown className="w-4 h-4 text-slate-400" />
          <span>Lead Asker: <strong className="text-white font-bold">{leadAsker?.name}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 w-full my-4">
        {/* Left Column: Live Voting Pool */}
        <div className="glass-black p-6 sm:p-8 space-y-6 border border-slate-800/80 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold font-heading text-slate-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Live Voting Pool ({gameState.proposedQuestions.length})
            </h3>
            <span className="text-xs font-mono text-slate-400 font-bold">
              User Submitted
            </span>
          </div>

          {gameState.proposedQuestions.length === 0 ? (
            <div className="p-8 rounded-xl bg-black/80 border border-slate-800 text-center space-y-2 my-4">
              <Sparkles className="w-6 h-6 text-slate-500 mx-auto" />
              <p className="text-xs font-heading font-semibold text-slate-400">
                No questions submitted yet.
              </p>
              <p className="text-[11px] text-slate-500">
                Type a custom Truth or Dare question on the right panel to add it to the live voting pool!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1 my-2">
              {gameState.proposedQuestions.map((q) => {
                const hasVoted = q.votes.includes(currentUser.id);
                const voteCount = q.votes.length;

                return (
                  <div
                    key={q.id}
                    className={`p-5 sm:p-6 rounded-xl border-2 transition-all my-2 ${
                      hasVoted
                        ? 'bg-slate-900 border-slate-400 shadow-md'
                        : 'bg-black border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {q.type}
                        </span>
                        {q.authorName && (
                          <span className="text-[11px] font-mono text-slate-500">
                            by {q.authorName}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onVoteQuestion(q.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-heading transition-all ${
                          hasVoted
                            ? 'bg-slate-200 text-black shadow'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{voteCount} Vote{voteCount !== 1 ? 's' : ''}</span>
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 font-heading">{q.text}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lock Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                const sorted = [...gameState.proposedQuestions].sort((a, b) => b.votes.length - a.votes.length);
                const best = sorted[0];
                if (best) onLockQuestion(best);
              }}
              disabled={gameState.proposedQuestions.length === 0}
              className="w-full btn-black-primary text-xs py-4 rounded-xl shadow-lg"
            >
              <Check className="w-4 h-4" />
              Lock Highest Voted Question & Start Timer
            </button>
          </div>
        </div>

        {/* Right Column: User Question Input Form */}
        <div className="glass-black-dark p-6 sm:p-8 space-y-6 flex flex-col justify-between border border-slate-700/80 shadow-2xl">
          <div className="space-y-5">
            <h3 className="text-base font-bold font-heading text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-4">
              <Plus className="w-4 h-4 text-slate-400" />
              Write & Submit Question
            </h3>

            {/* Truth / Dare Selector */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setQuestionType('truth')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold font-heading border-2 transition-all ${
                  questionType === 'truth'
                    ? 'bg-slate-800 border-slate-400 text-white shadow'
                    : 'bg-black border-slate-800 text-slate-400'
                }`}
              >
                TRUTH
              </button>
              <button
                type="button"
                onClick={() => setQuestionType('dare')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold font-heading border-2 transition-all ${
                  questionType === 'dare'
                    ? 'bg-slate-800 border-slate-400 text-white shadow'
                    : 'bg-black border-slate-800 text-slate-400'
                }`}
              >
                DARE
              </button>
            </div>

            {/* Custom Text Input Form */}
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold text-slate-400 mb-2 uppercase">
                  YOUR {questionType.toUpperCase()} QUESTION
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={`Write your custom ${questionType} for ${targetPlayer?.name}...`}
                  rows={4}
                  className="w-full bg-black border-2 border-slate-800 focus:border-slate-500 rounded-xl p-4 text-xs font-medium text-slate-100 focus:outline-none resize-none shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={!customText.trim()}
                className="w-full btn-black-accent text-xs py-3.5 rounded-xl shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Submit Question to Voting Pool
              </button>
            </form>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-black/80 border border-slate-800 text-[11px] text-slate-400 font-medium leading-relaxed my-2">
            💡 <strong>How it works:</strong> All participants can submit custom questions. The group votes on the best question, and the highest-voted question is chosen for the Target Player.
          </div>
        </div>
      </div>
    </div>
  );
}
