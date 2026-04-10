// src/pages/AnalyzePage.js
import React, { useState } from 'react';
import { analyzeAPI } from '../utils/api';
import { useAuth }    from '../context/AuthContext';
import ResultCard     from '../components/ResultCard';

/* ── Word highlight helper ────────────────────────────────────────────────── */
const HighlightedText = ({ text, words }) => {
  if (!words?.length) return <span>{text}</span>;

  const regex = new RegExp(`(${words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        words.some(w => w.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="bg-yellow-400/20 text-yellow-300 rounded px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

/* ── Scanning animation ───────────────────────────────────────────────────── */
const ScanLoader = () => (
  <div className="flex flex-col items-center gap-6 py-12">
    <div className="relative w-20 h-20">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent
                      border-t-blue-500 animate-spin" style={{ animationDuration: '1s' }} />
      {/* Inner ring */}
      <div className="absolute inset-3 rounded-full border-2 border-transparent
                      border-t-indigo-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      {/* Center */}
      <div className="absolute inset-6 rounded-full bg-blue-500/20 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
      </div>
    </div>
    <div className="text-center">
      <p className="text-white font-semibold mb-1">Analyzing Content</p>
      <p className="text-slate-400 text-sm">Our AI model is processing your input...</p>
    </div>
    {/* Progress dots */}
    <div className="flex gap-2">
      {['Preprocessing', 'Vectorizing', 'Classifying', 'Scoring'].map((step, i) => (
        <div key={step} className="flex items-center gap-1.5 text-xs text-slate-500"
             style={{ animation: `fadeIn 0.5s ease ${i * 0.3}s both` }}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }} />
          {step}
        </div>
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════════
   ANALYZE PAGE
══════════════════════════════════════════════════════════════════════════════ */
const AnalyzePage = () => {
  const { updateStats } = useAuth();

  const [inputMode, setInputMode] = useState('text'); // 'text' | 'url'
  const [text,      setText]      = useState('');
  const [url,       setUrl]       = useState('');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');

  const MAX_CHARS = 3000;

  const handleAnalyze = async () => {
    setError('');
    setResult(null);

    // Validation
    if (inputMode === 'text') {
      if (!text.trim()) { setError('Please paste some news content to analyze.'); return; }
      if (text.trim().length < 20) { setError('Please enter at least 20 characters.'); return; }
      if (text.length > MAX_CHARS) { setError(`Text too long. Maximum ${MAX_CHARS} characters.`); return; }
    } else {
      if (!url.trim()) { setError('Please enter a URL to analyze.'); return; }
      try { new URL(url); } catch { setError('Please enter a valid URL (e.g. https://example.com/article).'); return; }
    }

    setLoading(true);
    try {
      const payload = inputMode === 'text'
        ? { text: text.trim(), inputType: 'text' }
        : { url: url.trim(), text: url.trim(), inputType: 'url' };

      const res = await analyzeAPI.analyze(payload);
      setResult(res.data.result);
      updateStats(res.data.result.prediction);

      // Scroll to result
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setText('');
    setUrl('');
    setResult(null);
    setError('');
  };

  const handleSampleText = (sample) => {
    setInputMode('text');
    setText(sample);
    setResult(null);
    setError('');
  };

  const sampleTexts = [
    {
      label: 'Sample Fake News',
      icon: '🚨',
      text: 'BREAKING: Scientists EXPOSED for hiding shocking cure that BIG PHARMA doesn\'t want you to know about! Anonymous whistleblower reveals the deep state conspiracy to suppress this viral secret remedy. Share before they take this down! The mainstream media is covering up the truth about this bombshell revelation that could change everything you know about modern medicine.',
    },
    {
      label: 'Sample Real News',
      icon: '✅',
      text: 'The Federal Reserve announced a 0.25 percentage point interest rate increase on Wednesday, bringing the target range to 5.25-5.5 percent. The decision was unanimous among voting members of the Federal Open Market Committee. Officials cited continued progress on inflation, which has declined from its 2022 peak, though it remains above the 2 percent target.',
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-blue-600/8 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-purple-600/8 blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Analyze <span className="gradient-text">News Content</span>
          </h1>
          <p className="text-slate-400">
            Paste any article, headline, or social media post to check its credibility.
          </p>
        </div>

        {/* ── Input Card ───────────────────────────────────────────────────── */}
        <div className="glass p-6 mb-6 animate-slide-up">

          {/* Mode Toggle */}
          <div className="flex gap-2 mb-5 bg-white/5 rounded-xl p-1">
            {[
              { mode: 'text', label: 'Paste Text', icon: '📝' },
              { mode: 'url',  label: 'Enter URL',  icon: '🔗' },
            ].map(({ mode, label, icon }) => (
              <button
                key={mode}
                onClick={() => { setInputMode(mode); setError(''); setResult(null); }}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200
                            flex items-center justify-center gap-2 ${
                  inputMode === mode
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>

          {/* Text Input */}
          {inputMode === 'text' ? (
            <div className="relative">
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setError(''); setResult(null); }}
                placeholder="Paste news content, article text, or headline here...

Example: 'Scientists discover revolutionary treatment that could cure all diseases overnight according to anonymous sources.'"
                className="input-field min-h-52 resize-none leading-relaxed font-mono text-sm"
                maxLength={MAX_CHARS + 100}
              />
              {/* Character count */}
              <div className={`absolute bottom-3 right-3 text-xs font-mono
                               ${text.length > MAX_CHARS ? 'text-red-400' : 'text-slate-600'}`}>
                {text.length} / {MAX_CHARS}
              </div>
              {/* Highlight suspicious words in text area (show below) */}
              {result?.suspiciousWords?.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/15 text-sm">
                  <p className="text-yellow-300/80 text-xs font-medium mb-2">📍 Highlighted text:</p>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    <HighlightedText text={text} words={result.suspiciousWords} />
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <input
                type="url" value={url}
                onChange={e => { setUrl(e.target.value); setError(''); setResult(null); }}
                placeholder="https://example.com/news/article"
                className="input-field"
              />
              <p className="mt-2 text-xs text-slate-500">
                ⚠️ URL analysis extracts text from the page. Some sites may block access.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20
                            text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleAnalyze}
              disabled={loading || (!text.trim() && !url.trim())}
              className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 spin-ring" /> Analyzing...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg> Analyze Now</>
              )}
            </button>
            {(text || url || result) && (
              <button onClick={handleReset} className="btn-secondary py-3 px-4">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Sample Texts ─────────────────────────────────────────────────── */}
        {!result && !loading && (
          <div className="mb-6 animate-fade-in">
            <p className="text-xs text-slate-500 mb-3 text-center uppercase tracking-widest">
              Try a sample
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sampleTexts.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSampleText(s.text)}
                  className="glass p-4 text-left hover:bg-white/8 transition-all duration-200
                             hover:-translate-y-0.5 group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                      {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {s.text.substring(0, 80)}...
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Loading Animation ─────────────────────────────────────────────── */}
        {loading && (
          <div className="glass animate-fade-in">
            <ScanLoader />
          </div>
        )}

        {/* ── Result Section ────────────────────────────────────────────────── */}
        {result && !loading && (
          <div id="result-section" className="animate-slide-up">
            <ResultCard result={result} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;
