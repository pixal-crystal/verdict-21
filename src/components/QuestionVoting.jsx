import React, { useState, useEffect } from 'react';
import { ThumbsUp, Plus, Crown, MessageSquare, Check, Sparkles, HelpCircle, Zap } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function QuestionVoting({ gameState, currentUser, onVoteQuestion, onSubmitCustomQuestion, onLockQuestion }) {
  const [customText, setCustomText] = useState('');
  const activeCategory = gameState.choiceType || 'truth';
  const [questionType, setQuestionType] = useState(activeCategory);

  useEffect(() => {
    if (gameState.choiceType) {
      setQuestionType(gameState.choiceType);
    }
  }, [gameState.choiceType]);

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
    <div className="w-full max-w-5xl mx-auto px-6 py-8 flex flex-col items-center justify-center my-auto min-h-[60vh] gap-12">
      {/* Header Banner */}
      <div className="glass-black-highlight p-8 sm:p-12 flex flex-wrap items-center justify-between gap-8 border-l-8 border-slate-400 w-full border border-slate-700/80 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl">
            {targetPlayer?.avatar || '🎯'}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 font-bold uppercase">
                Target Player: {targetPlayer?.name}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase border ${
                activeCategory === 'truth'
                  ? 'bg-blue-950 border-blue-400 text-blue-300'
                  : 'bg-pink-950 border-pink-400 text-pink-300'
              }`}>
                CHOSE {activeCategory.toUpperCase()}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold font-heading text-slate-100 leading-relaxed">
              Submit your <strong className={activeCategory === 'truth' ? 'text-blue-400' : 'text-pink-400'}>{activeCategory.toUpperCase()}</strong> question for {targetPlayer?.name} & vote on the best one
            </h2>
          </div>
        </div>

        {/* Lead Asker Badge */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-black border border-slate-800 text-slate-300 text-xs font-heading font-semibold">
          <Crown className="w-4 h-4 text-slate-400" />
          <span>Lead Asker: <strong className="text-white font-bold">{leadAsker?.name}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 w-full">
        {/* Left Column: Live Voting Pool */}
        <div className="glass-black p-8 sm:p-12 space-y-8 border border-slate-800/80 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <h3 className="text-base font-bold font-heading text-slate-200 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-slate-400" />
              Live Voting Pool ({gameState.proposedQuestions.length})
            </h3>
            <span className="text-xs font-mono text-slate-400 font-bold">
              User Submitted
            </span>
          </div>

          {gameState.proposedQuestions.length === 0 ? (
            <div className="p-10 rounded-xl bg-black/80 border border-slate-800 text-center space-y-3">
              <Sparkles className="w-7 h-7 text-slate-500 mx-auto" />
              <p className="text-xs font-heading font-semibold text-slate-400">
                No questions submitted yet.
              </p>
              <p className="text-xs text-slate-500">
                Type a custom Truth or Dare question on the right panel to add it to the live voting pool!
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-h-96 overflow-y-auto pr-1">
              {gameState.proposedQuestions.map((q) => {
                const hasVoted = q.votes.includes(currentUser.id);
                const voteCount = q.votes.length;

                return (
                  <div
                    key={q.id}
                    className={`p-7 sm:p-8 rounded-xl border-2 transition-all overflow-hidden ${
                      hasVoted
                        ? 'bg-slate-900 border-slate-400 shadow-md'
                        : 'bg-black border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {q.type}
                        </span>
                        {q.authorName && (
                          <span className="text-xs font-mono text-slate-500">
                            by {q.authorName}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => onVoteQuestion(q.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold font-heading transition-all cursor-pointer ${
                          hasVoted
                            ? 'bg-slate-200 text-black shadow'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{voteCount} Vote{voteCount !== 1 ? 's' : ''}</span>
                      </button>
                    </div>
                    <p className="text-base font-semibold text-slate-100 font-heading leading-relaxed break-words">{q.text}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lock Button */}
          <div className="pt-6 border-t border-slate-800">
            <button
              onClick={() => {
                const sorted = [...gameState.proposedQuestions].sort((a, b) => b.votes.length - a.votes.length);
                const best = sorted[0];
                if (best) onLockQuestion(best);
              }}
              disabled={gameState.proposedQuestions.length === 0}
              className="w-full btn-black-primary text-xs py-4.5 rounded-xl shadow-lg"
            >
              <Check className="w-4 h-4" />
              Lock Highest Voted Question & Start Timer
            </button>
          </div>
        </div>

        {/* Right Column: User Question Input Form */}
        <div className="glass-black-dark p-8 sm:p-12 space-y-8 flex flex-col justify-between border border-slate-700/80 shadow-2xl">
          <div className="space-y-8">
            <h3 className="text-base font-bold font-heading text-slate-100 flex items-center gap-3 border-b border-slate-800 pb-5">
              <Plus className="w-5 h-5 text-slate-400" />
              Write & Submit Question
            </h3>

            {/* Truth / Dare Selector */}
            <div className="flex gap-5">
              <button
                type="button"
                onClick={() => setQuestionType('truth')}
                className={`flex-1 py-4 rounded-xl text-xs font-bold font-heading border-2 transition-all cursor-pointer ${
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
                className={`flex-1 py-4 rounded-xl text-xs font-bold font-heading border-2 transition-all cursor-pointer ${
                  questionType === 'dare'
                    ? 'bg-slate-800 border-slate-400 text-white shadow'
                    : 'bg-black border-slate-800 text-slate-400'
                }`}
              >
                DARE
              </button>
            </div>

            {/* Custom Text Input Form */}
            <form onSubmit={handleAddQuestion} className="space-y-6">
              <div className="space-y-3">
                <label className="block text-xs font-heading font-bold text-slate-400 uppercase tracking-wider">
                  YOUR {questionType.toUpperCase()} QUESTION
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={`Write your custom ${questionType} for ${targetPlayer?.name}...`}
                  rows={5}
                  className="w-full bg-black border-2 border-slate-800 focus:border-slate-500 rounded-xl p-6 text-sm font-medium text-slate-100 focus:outline-none resize-none shadow-inner leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={!customText.trim()}
                className="w-full btn-black-accent text-xs py-4.5 rounded-xl shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Submit Question to Voting Pool
              </button>
            </form>
          </div>

          <div className="p-6 sm:p-8 rounded-xl bg-black/80 border border-slate-800 text-xs text-slate-400 font-medium leading-relaxed">
            💡 <strong>How it works:</strong> All participants can submit custom questions. The group votes on the best question, and the highest-voted question is chosen for the Target Player.
          </div>
        </div>
      </div>
    </div>
  );
}
