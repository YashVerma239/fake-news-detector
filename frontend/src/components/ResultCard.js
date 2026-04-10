// src/components/ResultCard.js
// Displays the ML model prediction result with confidence, explanation, and suspicious words

import React, { useEffect, useRef } from 'react';

/* ── Animated confidence arc ──────────────────────────────────────────────── */
const ConfidenceArc = ({ confidence, isFake }) => {
  const canvasRef = useRef(null);
  const color = isFake ? '#ef4444' : '#10b981';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx  = canvas.getContext('2d');
    const size = canvas.width;
    const cx   = size / 2;
    const cy   = size / 2;
    const r    = size / 2 - 8;

    ctx.clearRect(0, 0, size, size);

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth   = 8;
    ctx.lineCap     = 'round';
    ctx.stroke();

    // Foreground arc (animated)
    const targetAngle = Math.PI * 0.75 + (Math.PI * 1.5 * confidence) / 100;
    let current = Math.PI * 0.75;

    const animate = () => {
      if (current >= targetAngle) return;
      current = Math.min(current + (targetAngle - Math.PI * 0.75) / 40, targetAngle);

      ctx.clearRect(0, 0, size, size);

      // Re-draw background
      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 0.75, Math.PI * 2.25);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth   = 8;
      ctx.lineCap     = 'round';
      ctx.stroke();

      // Gradient arc
      const grad = ctx.createLinearGradient(0, 0, size, 0);
      grad.addColorStop(0, isFake ? '#ef4444' : '#10b981');
      grad.addColorStop(1, isFake ? '#f97316' : '#06b6d4');

      ctx.beginPath();
      ctx.arc(cx, cy, r, Math.PI * 0.75, current);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 8;
      ctx.lineCap     = 'round';
      ctx.stroke();

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [confidence, isFake, color]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <canvas ref={canvasRef} width={120} height={120} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-bold ${isFake ? 'text-red-400' : 'text-emerald-400'}`}>
          {confidence}%
        </span>
        <span className="text-xs text-slate-500">confidence</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   RESULT CARD
══════════════════════════════════════════════════════════════════════════════ */
const ResultCard = ({ result }) => {
  const isFake = result.prediction === 'FAKE';

  const verdict = isFake
    ? { label: 'FAKE NEWS',  emoji: '🚨', bg: 'from-red-950/60 to-dark-800',   border: 'border-red-500/25',   badge: 'bg-red-500/15 text-red-400 border-red-500/30' }
    : { label: 'REAL NEWS',  emoji: '✅', bg: 'from-emerald-950/60 to-dark-800', border: 'border-emerald-500/25', badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${verdict.bg} border ${verdict.border}
                     overflow-hidden shadow-2xl`}>

      {/* ── Verdict Header ──────────────────────────────────────────────── */}
      <div className={`px-6 pt-6 pb-5 border-b ${verdict.border}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{verdict.emoji}</span>
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold
                               border ${verdict.badge} mb-1`}>
                {verdict.label}
              </div>
              <p className="text-slate-400 text-xs">
                Category: <span className="text-slate-300">{result.category || 'General'}</span>
              </p>
            </div>
          </div>

          {/* Confidence arc */}
          <ConfidenceArc confidence={result.confidence} isFake={isFake} />
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="px-6 py-5 space-y-5">

        {/* Confidence bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Confidence Level</span>
            <span className={isFake ? 'text-red-400' : 'text-emerald-400'}>{result.confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out
                          ${isFake
                            ? 'bg-gradient-to-r from-red-600 to-orange-500'
                            : 'bg-gradient-to-r from-emerald-600 to-cyan-500'}`}
              style={{ width: `${result.confidence}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="p-4 rounded-xl bg-white/4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-sm font-medium text-slate-300">Analysis Explanation</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {result.explanation}
          </p>
        </div>

        {/* Suspicious words */}
        {result.suspiciousWords?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <span className="text-sm font-medium text-slate-300">
                Suspicious Indicators ({result.suspiciousWords.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.suspiciousWords.map((word, i) => (
                <span key={i}
                  className="px-3 py-1 rounded-full text-xs font-medium
                             bg-yellow-500/10 text-yellow-300 border border-yellow-500/20">
                  ⚠️ {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-600">
          <span>Analyzed: {new Date(result.analyzedAt).toLocaleString()}</span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            TruthLens AI Model
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
