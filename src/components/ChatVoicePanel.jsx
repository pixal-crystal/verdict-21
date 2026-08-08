import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Volume2, VolumeX, Mic, MicOff, Lock } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

const QUICK_EMOJIS = ['🔥', '😂', '💀', '😱', '👑', '🎉', '⚡', '👍'];

export function ChatVoicePanel({ gameState, currentUser, chatMessages, onSendMessage, voiceMuted, toggleVoiceMute }) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef(null);

  const isIsolated = gameState.phase === 'QUESTION_SELECTION' && gameState.targetPlayerId === currentUser.id;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isIsolated) return;
    soundEffects.playTick();
    onSendMessage({
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      avatar: currentUser.avatar,
      color: currentUser.color || '#94a3b8',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setInputText('');
  };

  const handleEmoji = (emoji) => {
    if (isIsolated) return;
    onSendMessage({
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      avatar: currentUser.avatar,
      color: currentUser.color || '#94a3b8',
      text: emoji,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div className={`glass-black p-6 transition-all ${isIsolated ? 'opacity-50 pointer-events-none filter blur-[2px]' : ''}`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-slate-300 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>GAME CHAT & VOICE HUB</span>
          </div>

          {/* Voice Chat Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEffects.init();
                toggleVoiceMute();
              }}
              disabled={isIsolated}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all ${
                isIsolated || voiceMuted
                  ? 'bg-slate-900 text-slate-500 border border-slate-800'
                  : 'bg-slate-800 text-slate-200 border border-slate-600 shadow-md'
              }`}
            >
              {voiceMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-slate-300" />}
              <span>{isIsolated ? 'MUTED IN ISOLATION' : voiceMuted ? 'UNMUTE MIC' : 'MUTE MIC'}</span>
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="h-40 overflow-y-auto py-4 space-y-3 pr-1 font-sans">
          {isIsolated ? (
            <div className="h-full flex items-center justify-center text-xs font-mono font-bold text-slate-400 gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              Chat log locked during sensory isolation phase.
            </div>
          ) : chatMessages.length === 0 ? (
            <div className="text-xs text-slate-500 font-medium italic text-center py-8">
              No chat messages yet. Say hello or discuss questions with other players!
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 text-xs">
                <span className="text-xl leading-none">{msg.avatar || '👤'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-heading text-slate-200" style={{ color: msg.color || '#cbd5e1' }}>
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>
                  <div className="text-slate-200 font-medium mt-0.5">{msg.text}</div>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input & Emoji Quick Bar */}
        {!isIsolated && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {QUICK_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => handleEmoji(e)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-base transition-all border border-slate-800"
                >
                  {e}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-black border-2 border-slate-800 focus:border-slate-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-medium focus:outline-none"
              />
              <button type="submit" disabled={!inputText.trim()} className="btn-black-primary text-xs px-6 rounded-xl">
                <Send className="w-4 h-4" />
                SEND
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
