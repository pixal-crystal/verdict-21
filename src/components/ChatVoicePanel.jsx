import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Volume2, VolumeX, Mic, MicOff, Lock, Radio, Activity } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';
import { VoiceChatService } from '../utils/voiceService';

const QUICK_EMOJIS = ['🔥', '😂', '💀', '😱', '👑', '🎉', '⚡', '👍'];

export function ChatVoicePanel({ gameState, currentUser, chatMessages, onSendMessage, networkHub }) {
  const [inputText, setInputText] = useState('');
  const [isMicOn, setIsMicOn] = useState(false);
  const [myVolume, setMyVolume] = useState(0);
  const [activeSpeakers, setActiveSpeakers] = useState({}); // { [playerId]: { isTalking, volume } }
  const voiceServiceRef = useRef(null);
  const chatEndRef = useRef(null);

  const isIsolated = gameState.phase === 'QUESTION_SELECTION' && gameState.targetPlayerId === currentUser.id;

  // Listen to peer voice actions
  useEffect(() => {
    if (!networkHub) return;

    const originalActionHandler = networkHub.onClientAction;
    networkHub.onClientAction = (action) => {
      if (action?.type === 'VOICE_TALKING') {
        setActiveSpeakers(prev => ({
          ...prev,
          [action.playerId]: {
            isTalking: action.isTalking,
            volume: action.volume || 0,
            lastSeen: Date.now()
          }
        }));
      }
      if (originalActionHandler) originalActionHandler(action);
    };
  }, [networkHub]);

  // Clean up silent speakers after 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveSpeakers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          if (now - next[id].lastSeen > 2500) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initialize Voice Service
  useEffect(() => {
    voiceServiceRef.current = new VoiceChatService((isTalking, volume) => {
      setMyVolume(volume);
      if (networkHub) {
        networkHub.broadcastAction({
          type: 'VOICE_TALKING',
          playerId: currentUser.id,
          isTalking,
          volume
        });
      }
    });

    return () => {
      voiceServiceRef.current?.stopMicrophone();
    };
  }, [currentUser.id, networkHub]);

  const toggleMic = async () => {
    if (isIsolated) return;
    soundEffects.playTick();

    if (isMicOn) {
      voiceServiceRef.current?.stopMicrophone();
      setIsMicOn(false);
      setMyVolume(0);
    } else {
      const success = await voiceServiceRef.current?.startMicrophone();
      if (success) {
        setIsMicOn(true);
      } else {
        alert('Could not access microphone. Please allow microphone permissions in your browser.');
      }
    }
  };

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

  const roomPlayers = gameState.players || [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 my-4">
      <div className={`glass-black p-6 sm:p-8 border border-slate-800/80 shadow-2xl transition-all space-y-6 ${isIsolated ? 'opacity-60 pointer-events-none filter blur-[1px]' : ''}`}>
        
        {/* Header & Voice Mic Controls */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-2 text-xs font-heading font-bold text-slate-300 uppercase tracking-wider">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <span>VOICE CHAT & LIVE SPEECH HUB</span>
          </div>

          {/* Voice Chat Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMic}
              disabled={isIsolated}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all shadow-lg border ${
                isIsolated
                  ? 'bg-slate-900 text-slate-500 border-slate-800'
                  : isMicOn
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-emerald-500/20 scale-105'
                  : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'
              }`}
            >
              {isMicOn ? <Mic className="w-4 h-4 text-emerald-400 animate-pulse" /> : <MicOff className="w-4 h-4 text-red-400" />}
              <span>{isIsolated ? 'MUTED IN ISOLATION' : isMicOn ? 'MIC ON (TALKING)' : 'ENABLE MIC'}</span>
            </button>
          </div>
        </div>

        {/* WHO IS TALKING Live Roster Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/80 border border-slate-800/80 space-y-3 shadow-inner">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              WHO IS TALKING
            </span>
            <span className="text-[10px] font-mono text-slate-500">Real-Time Voice Activity</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {roomPlayers.map((player) => {
              const isSelf = player.id === currentUser.id;
              const speakerInfo = isSelf
                ? { isTalking: isMicOn && myVolume > 12, volume: myVolume }
                : activeSpeakers[player.id];
              
              const isTalking = speakerInfo?.isTalking;

              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all text-xs font-mono font-bold ${
                    isTalking
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50 scale-105 shadow-lg shadow-emerald-500/20'
                      : 'bg-black/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-base">{player.avatar || '👤'}</span>
                  <span>{player.name}</span>
                  {isTalking ? (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Volume2 className="w-4 h-4 animate-bounce" />
                      <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">TALKING</span>
                    </div>
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              );
            })}
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

