import React, { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function RoomCodeBadge({ roomCode, large = false }) {
  const [copied, setCopied] = useState(false);

  if (!roomCode) return null;

  const handleCopy = (e) => {
    e.stopPropagation();
    soundEffects.playSuccessChime();
    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (large) {
    return (
      <div className="flex flex-col items-center gap-3 my-4 p-5 sm:p-6 rounded-2xl bg-black/90 border-2 border-slate-700/80 shadow-2xl">
        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-blue-400" />
          SHARE LINK & ROOM CODE WITH FRIENDS
        </span>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-slate-100 px-5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 select-all shadow-inner">
            {roomCode}
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-mono text-xs font-bold transition-all shadow-lg border ${
              copied
                ? 'bg-emerald-600 border-emerald-400 text-white scale-105'
                : 'bg-blue-600 hover:bg-blue-500 border-blue-400 text-white active:scale-95'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>LINK COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY SHARE LINK</span>
              </>
            )}
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-500">
          {copied ? '✓ Shareable invite link copied to clipboard!' : 'Click button to copy full invite link with room code'}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all border shadow-lg group relative cursor-pointer ${
        copied
          ? 'bg-emerald-950 border-emerald-500 text-emerald-300 scale-105 shadow-emerald-500/20'
          : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200 hover:border-slate-500 shadow-black/60'
      }`}
      title="Click to copy room code"
    >
      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">ROOM:</span>
      <span className="text-slate-100 font-extrabold tracking-widest text-sm">{roomCode}</span>
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
      ) : (
        <Copy className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
      )}
      
      {/* Tooltip feedback */}
      {copied && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-mono font-bold rounded-md shadow-lg pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95">
          COPIED TO CLIPBOARD!
        </span>
      )}
    </button>
  );
}
