import React, { useRef, useEffect, useState } from 'react';
import { Disc, Play } from 'lucide-react';
import { soundEffects } from '../utils/audioSynth';

export function BottleSpinner({ gameState, currentUser, onBottleLand }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [canvasSize, setCanvasSize] = useState(400);

  const activePlayers = gameState.players.filter(p => !p.isBenched);
  const isHost = gameState.isHost || currentUser.id === activePlayers[0]?.id;

  // Responsive device aspect ratio & dimension scaling
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const size = Math.min(width - 32, 440);
        setCanvasSize(size > 260 ? size : 260);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvasSize;
    const height = canvasSize;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - (canvasSize < 340 ? 40 : 55);

    ctx.clearRect(0, 0, width, height);

    // Slices
    const total = activePlayers.length;
    const sliceAngle = (Math.PI * 2) / total;
    const segmentColors = ['rgba(30, 41, 59, 0.5)', 'rgba(15, 23, 42, 0.7)', 'rgba(51, 65, 85, 0.4)', 'rgba(11, 15, 25, 0.8)'];

    for (let i = 0; i < total; i++) {
      const start = i * sliceAngle - Math.PI / 2;
      const end = start + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius + 16, start, end);
      ctx.closePath();
      ctx.fillStyle = segmentColors[i % segmentColors.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Outer Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 16, 0, Math.PI * 2);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Seats
    const seatRadius = canvasSize < 340 ? 22 : 28;
    activePlayers.forEach((player, idx) => {
      const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.arc(x, y, seatRadius, 0, Math.PI * 2);
      ctx.fillStyle = player.color ? `${player.color}40` : 'rgba(51, 65, 85, 0.5)';
      ctx.fill();
      ctx.strokeStyle = player.color || '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.font = `${canvasSize < 340 ? '18px' : '22px'} sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.avatar || '👤', x, y);

      ctx.font = `bold ${canvasSize < 340 ? '11px' : '13px'} Space Grotesk, sans-serif`;
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(player.name, x, y + seatRadius + 14);
    });

    // Center Pivot
    ctx.beginPath();
    ctx.arc(centerX, centerY, canvasSize < 340 ? 14 : 18, 0, Math.PI * 2);
    ctx.fillStyle = '#07080c';
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Bottle Vector Artwork
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    const bWidth = canvasSize < 340 ? 8 : 12;
    const bHeight = canvasSize < 340 ? 40 : 55;

    ctx.beginPath();
    ctx.moveTo(-bWidth, -radius + 40);
    ctx.lineTo(bWidth, -radius + 40);
    ctx.lineTo(bWidth + 4, -20);
    ctx.lineTo(bWidth + 8, bHeight - 30);
    ctx.lineTo(bWidth + 4, bHeight);
    ctx.lineTo(-(bWidth + 4), bHeight);
    ctx.lineTo(-(bWidth + 8), bHeight - 30);
    ctx.lineTo(-(bWidth + 4), -20);
    ctx.closePath();

    const bottleGrad = ctx.createLinearGradient(-bWidth, -radius, bWidth, bHeight);
    bottleGrad.addColorStop(0, '#64748b');
    bottleGrad.addColorStop(0.5, '#334155');
    bottleGrad.addColorStop(1, '#0f172a');

    ctx.fillStyle = bottleGrad;
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -radius + 18);
    ctx.lineTo(-8, -radius + 36);
    ctx.lineTo(8, -radius + 36);
    ctx.closePath();
    ctx.fillStyle = '#f8fafc';
    ctx.fill();

    ctx.restore();
  }, [rotation, activePlayers, canvasSize]);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const extraTurns = Math.floor(Math.random() * 5) + 6;
    const targetIdx = Math.floor(Math.random() * activePlayers.length);
    const targetAngle = (targetIdx / activePlayers.length) * Math.PI * 2;
    const finalRotation = rotation + extraTurns * Math.PI * 2 + targetAngle;

    let currentRot = rotation;
    const startTime = performance.now();
    const duration = 4000;

    const animateSpin = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const newRot = currentRot + (finalRotation - currentRot) * ease;

      setRotation(newRot);

      if (Math.floor(newRot * 6) > Math.floor(currentRot * 6)) {
        soundEffects.playSpinClick();
      }
      currentRot = newRot;

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);
        const chosenTarget = activePlayers[targetIdx];
        soundEffects.playSuccessChime();
        onBottleLand(chosenTarget);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col items-center gap-8 sm:gap-10">
      {/* Header */}
      <div className="glass-black-highlight p-6 sm:p-8 w-full flex flex-wrap items-center justify-between gap-4 border-l-8 border-slate-500 border border-slate-700/80 shadow-xl my-2">
        <div>
          <span className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Disc className="w-4 h-4 text-slate-300" />
            Spin the Bottle Mode
          </span>
          <h2 className="text-lg font-bold font-heading text-slate-100 mt-1">
            Spin the bottle to choose the target player.
          </h2>
        </div>
        <div>
          {isHost && (
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="btn-black-primary text-xs sm:text-sm px-6 py-3.5"
            >
              <Play className="w-4 h-4 fill-current" />
              {isSpinning ? 'Spinning...' : 'Spin Bottle'}
            </button>
          )}
        </div>
      </div>

      {/* Responsive Aspect-Ratio Canvas Container */}
      <div ref={containerRef} className="glass-black p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden w-full aspect-square max-w-[480px] mx-auto my-4 border border-slate-800/80 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          className="w-full h-full object-contain drop-shadow-2xl z-10"
        />

        {!isHost && !isSpinning && (
          <div className="mt-4 text-xs font-heading font-semibold text-slate-400 uppercase tracking-wider z-10 text-center">
            Waiting for host to spin the bottle...
          </div>
        )}
      </div>
    </div>
  );
}
