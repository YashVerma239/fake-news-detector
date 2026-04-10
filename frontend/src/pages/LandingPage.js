// src/pages/LandingPage.js
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Floating orbs background ─────────────────────────────────────────────── */
const GlowOrbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
    <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full
                    bg-blue-600/15 blur-3xl animate-pulse-slow" />
    <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full
                    bg-purple-600/15 blur-3xl animate-pulse-slow"
         style={{ animationDelay: '1s' }} />
    <div className="absolute bottom-20 left-1/3 w-72 h-72 rounded-full
                    bg-indigo-600/10 blur-3xl animate-pulse-slow"
         style={{ animationDelay: '2s' }} />
    {/* Grid */}
    <div className="absolute inset-0"
      style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
               backgroundSize: '64px 64px' }} />
  </div>
);

/* ── Feature Card ──────────────────────────────────────────────────────────── */
const FeatureCard = ({ icon, title, desc, gradient, delay = 0 }) => (
  <div className="glass p-6 hover:bg-white/8 transition-all duration-300
                  hover:-translate-y-1 hover:shadow-xl group"
       style={{ animationDelay: `${delay}ms` }}>
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient}
                     flex items-center justify-center mb-4 shadow-lg
                     group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
  </div>
);

/* ── Step Card ─────────────────────────────────────────────────────────────── */
const StepCard = ({ number, title, desc, icon }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="relative mb-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700
                      flex items-center justify-center shadow-xl shadow-blue-900/50
                      group-hover:shadow-blue-600/40 transition-shadow duration-300
                      group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full
                      bg-gradient-to-br from-purple-500 to-indigo-500
                      flex items-center justify-center text-xs font-bold text-white">
        {number}
      </div>
    </div>
    <h3 className="font-semibold text-white mb-2 text-lg">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed max-w-xs">{desc}</p>
  </div>
);

/* ── Stat Counter ──────────────────────────────────────────────────────────── */
const StatItem = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl font-bold gradient-text mb-1">{value}</div>
    <div className="text-sm text-slate-500">{label}</div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const heroRef = useRef(null);

  // Parallax effect on scroll
  useEffect(() => {
    const onScroll = () => {
      if (heroRef.current) {
        heroRef.current.style.transform = `translateY(${window.scrollY * 0.15}px)`;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>,
      title: 'High Accuracy AI',
      desc:  'Powered by NLP models trained on thousands of verified fake and real news articles, achieving up to 95% detection accuracy.',
      gradient: 'from-blue-500 to-cyan-600',
      delay: 0,
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
      title: 'Real-Time Analysis',
      desc:  'Get instant results in under 2 seconds. Paste any news article and our ML model analyzes it on the fly.',
      gradient: 'from-indigo-500 to-purple-600',
      delay: 100,
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>,
      title: 'Privacy First',
      desc:  'Your analyzed content is secured and tied to your private account. We never sell or share user data.',
      gradient: 'from-purple-500 to-pink-600',
      delay: 200,
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
      title: 'Personal Dashboard',
      desc:  'Track your analysis history, view weekly trends, and see category breakdowns with interactive charts.',
      gradient: 'from-emerald-500 to-teal-600',
      delay: 300,
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/></svg>,
      title: 'Detailed Explanations',
      desc:  'Understand WHY content is flagged. Our system highlights suspicious keywords and provides human-readable reasoning.',
      gradient: 'from-orange-500 to-amber-600',
      delay: 400,
    },
    {
      icon: <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
      title: 'Confidence Scoring',
      desc:  'Every result comes with a confidence percentage so you know how certain the model is about its prediction.',
      gradient: 'from-rose-500 to-red-600',
      delay: 500,
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Paste Your Content',
      desc:  'Copy a news article, headline, or social media post and paste it into the analyzer.',
      icon: <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>,
    },
    {
      number: 2,
      title: 'AI Analyzes It',
      desc:  'Our NLP model processes the text using TF-IDF vectorization and logistic regression to classify content.',
      icon: <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
    },
    {
      number: 3,
      title: 'Get Your Result',
      desc:  'Instantly see if the content is Real or Fake, along with a confidence score and detailed explanation.',
      icon: <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <GlowOrbs />

      {/* ══ HERO SECTION ════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div ref={heroRef} className="max-w-5xl mx-auto px-4 text-center py-24 animate-fade-in">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          glass border-blue-500/20 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-slate-300">AI-Powered Misinformation Detection</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Stop Believing{' '}
            <span className="gradient-text">Fake News</span>
            <br />
            <span className="text-4xl sm:text-5xl lg:text-6xl text-slate-300 font-bold">
              Before It Spreads
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            TruthLens uses advanced Natural Language Processing to detect misinformation
            in seconds. Paste any article, headline, or claim — get an instant verdict.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to={isAuthenticated ? '/analyze' : '/signup'}
              className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2
                         shadow-2xl shadow-blue-900/50 hover:shadow-blue-600/40"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Check News Now
            </Link>
            <Link to="/#how-it-works" className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="glass rounded-2xl px-8 py-6 max-w-2xl mx-auto
                          grid grid-cols-3 gap-6 border-white/10">
            <StatItem value="95%"    label="Detection Accuracy" />
            <StatItem value="< 2s"   label="Analysis Speed" />
            <StatItem value="50K+"   label="Articles Analyzed" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose <span className="gradient-text">TruthLens</span>?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built with modern NLP technology to give you the most accurate fake news detection available.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 px-4 relative">
        {/* Section background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent -z-10" />

        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Three simple steps to verify any news article with AI-powered precision.
            </p>
          </div>

          {/* Steps with connecting line */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4
                            h-px bg-gradient-to-r from-blue-500/50 to-purple-500/50" />
            {steps.map((step, i) => <StepCard key={i} {...step} />)}
          </div>

          {/* CTA under steps */}
          <div className="text-center mt-16">
            <Link
              to={isAuthenticated ? '/analyze' : '/signup'}
              className="btn-primary text-base px-8 py-4 inline-flex items-center gap-2"
            >
              Try It Free — No Credit Card Required
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row
                        items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600
                            flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
              </svg>
            </div>
            <span className="font-bold text-white">Truth<span className="gradient-text">Lens</span></span>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 TruthLens · Final Year CS Project · AI-Powered Fake News Detection
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">About</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
