import React, { useState, useEffect } from 'react';
import { ShieldAlert, EyeOff, Lock } from 'lucide-react';

export function AntiScreenshotOverlay({ active }) {
  const [isWindowBlurred, setIsWindowBlurred] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!active) return;

    // Detect Focus Loss (e.g., Snipping tool, switching windows, devtools)
    const handleBlur = () => setIsWindowBlurred(true);
    const handleFocus = () => setIsWindowBlurred(false);

    // Prevent Context Menu & Copy
    const handleContextMenu = (e) => e.preventDefault();

    // Detect PrintScreen / Screenshot shortcuts
    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) ||
        (e.ctrlKey && e.key === 'p')
      ) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 3000);
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      {/* Repeating Anti-Screenshot Watermark Grid */}
      <div className="watermark-pattern" />

      {/* Focus Loss / Window Blur Shield */}
      {isWindowBlurred && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center space-y-4">
          <EyeOff className="w-16 h-16 text-pink-500 animate-pulse" />
          <h2 className="text-2xl font-black text-pink-400 font-mono">
            SCREEN PROTECTED // FOCUS LOST
          </h2>
          <p className="text-xs text-slate-400 max-w-sm">
            Content is blurred while app window is out of focus to prevent unauthorized screen captures or tab switching.
          </p>
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
