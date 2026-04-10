// src/pages/DashboardPage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { historyAPI } from '../utils/api';
import { useAuth }    from '../context/AuthContext';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Filler
);

/* ── Shared chart options ─────────────────────────────────────────────────── */
const chartDefaults = {
  plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } } },
  scales:  {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
};

/* ── Stat Card ────────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, icon, gradient, sub }) => (
  <div className="glass p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient}
                     flex items-center justify-center shrink-0 shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
      <p className="text-sm text-slate-400">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
══════════════════════════════════════════════════════════════════════════════ */
const DashboardPage = () => {
  const { user }   = useAuth();
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await historyAPI.getStats();
        setStats(res.data.stats);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  /* ── Process weekly data for chart ─────────────────────────────────────── */
  const buildWeeklyChart = () => {
    if (!stats?.weekly) return null;

    // Last 7 days labels
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    }
    const dateKeys = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateKeys.push(d.toISOString().split('T')[0]);
    }

    const fakeByDate = {};
    const realByDate = {};
    stats.weekly.forEach(item => {
      const { date, prediction } = item._id;
      if (prediction === 'FAKE') fakeByDate[date] = item.count;
      else realByDate[date] = item.count;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Fake News',
          data:  dateKeys.map(d => fakeByDate[d] || 0),
          backgroundColor: 'rgba(239,68,68,0.2)',
          borderColor:     'rgba(239,68,68,0.8)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(239,68,68,0.8)',
          pointRadius: 4,
        },
        {
          label: 'Real News',
          data:  dateKeys.map(d => realByDate[d] || 0),
          backgroundColor: 'rgba(16,185,129,0.2)',
          borderColor:     'rgba(16,185,129,0.8)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(16,185,129,0.8)',
          pointRadius: 4,
        },
      ],
    };
  };

  /* ── Category distribution doughnut ──────────────────────────────────────── */
  const buildCategoryChart = () => {
    if (!stats?.categories?.length) return null;

    const palette = [
      '#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444',
      '#06b6d4','#f97316','#ec4899',
    ];

    return {
      labels:   stats.categories.map(c => c._id || 'General'),
      datasets: [{
        data:            stats.categories.map(c => c.count),
        backgroundColor: palette.slice(0, stats.categories.length).map(c => c + '33'),
        borderColor:     palette.slice(0, stats.categories.length),
        borderWidth: 2,
        hoverOffset: 6,
      }],
    };
  };

  /* ── Fake vs Real bar ──────────────────────────────────────────────────── */
  const buildFakeRealChart = () => {
    const fakeCount = stats?.totals?.fakeCount || 0;
    const realCount = stats?.totals?.realCount || 0;
    return {
      labels: ['Total Checks'],
      datasets: [
        {
          label: 'Fake News',
          data: [fakeCount],
          backgroundColor: 'rgba(239,68,68,0.6)',
          borderColor:     'rgba(239,68,68,1)',
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Real News',
          data: [realCount],
          backgroundColor: 'rgba(16,185,129,0.6)',
          borderColor:     'rgba(16,185,129,1)',
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    };
  };

  const weeklyData  = buildWeeklyChart();
  const catData     = buildCategoryChart();
  const fakeRealData = buildFakeRealChart();

  const accuracy = stats?.totals?.totalChecks
    ? Math.round((stats.totals.fakeCount / stats.totals.totalChecks) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 spin-ring" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Dashboard
            </h1>
            <p className="text-slate-400 text-sm">
              Welcome back, <span className="text-white font-medium">{user?.name}</span>
            </p>
          </div>
          <Link to="/analyze" className="btn-primary flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            New Analysis
          </Link>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── Stat Cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Checks"
            value={stats?.totals?.totalChecks || 0}
            gradient="from-blue-500 to-indigo-600"
            sub="All time"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
          />
          <StatCard
            label="Fake Detected"
            value={stats?.totals?.fakeCount || 0}
            gradient="from-red-500 to-rose-600"
            sub={`${accuracy}% of checks`}
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
          />
          <StatCard
            label="Real Verified"
            value={stats?.totals?.realCount || 0}
            gradient="from-emerald-500 to-teal-600"
            sub={`${100 - accuracy}% of checks`}
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          />
          <StatCard
            label="Categories"
            value={stats?.categories?.length || 0}
            gradient="from-purple-500 to-indigo-600"
            sub="Topics analyzed"
            icon={<svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>}
          />
        </div>

        {/* ── Charts Row 1 ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Weekly Activity (spans 2 cols) */}
          <div className="lg:col-span-2 glass p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
              </svg>
              Weekly Activity
            </h2>
            {weeklyData ? (
              <Line data={weeklyData} options={{
                ...chartDefaults,
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                  ...chartDefaults.plugins,
                  tooltip: { backgroundColor: '#1a1a2e', borderColor: '#ffffff10', borderWidth: 1 },
                },
              }} />
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                No activity in the last 7 days.{' '}
                <Link to="/analyze" className="text-blue-400 ml-1">Start analyzing!</Link>
              </div>
            )}
          </div>

          {/* Fake vs Real Bar */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              Fake vs Real
            </h2>
            {fakeRealData && stats?.totals?.totalChecks > 0 ? (
              <Bar data={fakeRealData} options={{
                ...chartDefaults,
                responsive: true,
                plugins: {
                  ...chartDefaults.plugins,
                  tooltip: { backgroundColor: '#1a1a2e' },
                },
              }} />
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm text-center">
                No data yet.
              </div>
            )}
          </div>
        </div>

        {/* ── Charts Row 2 ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Category Distribution */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
              </svg>
              Category Distribution
            </h2>
            {catData ? (
              <div className="flex justify-center">
                <div style={{ maxWidth: 260 }}>
                  <Doughnut data={catData} options={{
                    responsive: true,
                    cutout: '65%',
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#94a3b8', padding: 12, font: { size: 11 } },
                      },
                      tooltip: { backgroundColor: '#1a1a2e' },
                    },
                  }} />
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
                No category data yet.
              </div>
            )}
          </div>

          {/* Quick Stats / Tips */}
          <div className="glass p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
              Tips & Insights
            </h2>
            <div className="space-y-3">
              {[
                { icon: '🔍', tip: 'Always verify shocking headlines with at least 3 credible sources.' },
                { icon: '⚠️', tip: 'Watch out for sensational language like "BREAKING" or "SHOCKING TRUTH".' },
                { icon: '📅', tip: 'Check the publication date — old articles shared as new is common.' },
                { icon: '👤', tip: 'Verify the author and publication credibility before sharing.' },
                { icon: '🔗', tip: 'Check if the URL matches a legitimate news domain.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/3 text-sm">
                  <span className="text-base">{item.icon}</span>
                  <p className="text-slate-400 leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Quick Links ──────────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link to="/analyze" className="btn-primary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Analyze New Article
          </Link>
          <Link to="/history" className="btn-secondary flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            View Full History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
