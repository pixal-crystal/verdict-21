import React, { useState, useEffect } from 'react';
import { ShieldAlert, EyeOff, Lock } from 'lucide-react';

export function AntiScreenshotOverlay({ active }) {
  const [showWarning, setShowWarning] = useState(false);
  const [isScreenshotAttempted, setIsScreenshotAttempted] = useState(false);

  useEffect(() => {
    if (!active) return;

    // Prevent Context Menu & Dragging Images
    const handleContextMenu = (e) => e.preventDefault();

    // Comprehensive Mac OS & Windows Screenshot Shortcut Detector
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      const key = e.key ? e.key.toLowerCase() : '';
      const code = e.code ? e.code.toLowerCase() : '';

      const isMacScreenshotKey =
        (isCmdOrCtrl && isShift && (key === '3' || key === '4' || key === '5' || key === '6' || code.startsWith('digit'))) ||
        (isCmdOrCtrl && isShift && key === 's') ||
        (isCmdOrCtrl && key === 'p');

      const isWindowsScreenshotKey =
        e.key === 'PrintScreen' || code === 'printscreen';

      if (isMacScreenshotKey || isWindowsScreenshotKey) {
        setIsScreenshotAttempted(true);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3500);
        setTimeout(() => setIsScreenshotAttempted(false), 2000);
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      {/* Repeating Anti-Screenshot Watermark Grid */}
      <div className="watermark-pattern" />

      {/* Temporary Blackout ONLY during active Screenshot key press */}
      {isScreenshotAttempted && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center space-y-4">
          <EyeOff className="w-16 h-16 text-red-500 animate-pulse" />
          <h2 className="text-2xl font-black text-red-400 font-mono">
            SCREENSHOT BLOCKED
          </h2>
        </div>
      )}

      {/* Screenshot Key Trigger Warning */}
      {showWarning && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white font-mono text-xs font-bold px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <ShieldAlert className="w-5 h-5" />
          SCREENSHOT ATTEMPT BLOCKED! CONTENT PROTECTED.
        </div>
      )}
    </>
  );
}
