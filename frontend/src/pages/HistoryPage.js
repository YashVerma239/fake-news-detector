// src/pages/HistoryPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { historyAPI } from '../utils/api';

/* ── History Item ─────────────────────────────────────────────────────────── */
const HistoryItem = ({ item, onDelete }) => {
  const isFake  = item.prediction === 'FAKE';
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this history entry?')) return;
    setDeleting(true);
    try { await onDelete(item._id); }
    catch { setDeleting(false); }
  };

  return (
    <div className={`glass p-4 border transition-all duration-200
                     hover:bg-white/8 group ${
      isFake ? 'border-red-500/10 hover:border-red-500/20'
             : 'border-emerald-500/10 hover:border-emerald-500/20'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Badge */}
          <div className={`shrink-0 mt-0.5 px-2.5 py-1 rounded-full text-xs font-bold ${
            isFake
              ? 'bg-red-500/15 text-red-400 border border-red-500/25'
              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
          }`}>
            {isFake ? '🚨 FAKE' : '✅ REAL'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed mb-2">
              {item.sourceUrl
                ? <span className="text-blue-400 text-xs">{item.sourceUrl}</span>
                : item.content}
            </p>
            <div className="flex items-center flex-wrap gap-3 text-xs text-slate-600">
              <span className={`font-medium ${isFake ? 'text-red-400/70' : 'text-emerald-400/70'}`}>
                {item.confidence}% confidence
              </span>
              <span>•</span>
              <span>{item.category}</span>
              <span>•</span>
              <span>{new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}</span>
              {item.suspiciousWords?.length > 0 && (
                <><span>•</span>
                <span className="text-yellow-500/70">
                  {item.suspiciousWords.length} flag{item.suspiciousWords.length !== 1 ? 's' : ''}
                </span></>
              )}
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 p-2 rounded-lg text-slate-600 hover:text-red-400
                     hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
        >
          {deleting
            ? <span className="w-4 h-4 spin-ring block" />
            : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>}
        </button>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   HISTORY PAGE
══════════════════════════════════════════════════════════════════════════════ */
const HistoryPage = () => {
  const [history,    setHistory]    = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filter,     setFilter]     = useState('ALL'); // ALL | FAKE | REAL
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [clearing,   setClearing]   = useState(false);

  const fetchHistory = useCallback(async (page = 1, type = filter) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (type !== 'ALL') params.type = type;

      const res = await historyAPI.getHistory(params);
      setHistory(res.data.data);
      setPagination(res.data.pagination);
    } catch {
      setError('Failed to load history.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchHistory(1); }, [filter]); // eslint-disable-line

  const handleDelete = async (id) => {
    await historyAPI.deleteEntry(id);
    setHistory(prev => prev.filter(h => h._id !== id));
    setPagination(prev => ({ ...prev, total: prev.total - 1 }));
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure? This will permanently delete your entire history.')) return;
    setClearing(true);
    try {
      await historyAPI.clearHistory();
      setHistory([]);
      setPagination({ total: 0, page: 1, pages: 1 });
    } catch {
      setError('Failed to clear history.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Analysis History</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {pagination.total} total checks
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/analyze" className="btn-primary text-sm py-2 px-4">New Check</Link>
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                disabled={clearing}
                className="btn-danger text-sm py-2 px-4"
              >
                {clearing ? 'Clearing...' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Tabs ──────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-5 bg-white/5 rounded-xl p-1 w-fit">
          {['ALL', 'FAKE', 'REAL'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'All Results' : f === 'FAKE' ? '🚨 Fake' : '✅ Real'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── List ──────────────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass p-4 h-20 animate-pulse bg-white/3" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="glass p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-white mb-2">No history yet</h3>
            <p className="text-slate-400 text-sm mb-6">
              {filter === 'ALL'
                ? 'Start analyzing news articles to build your history.'
                : `No ${filter.toLowerCase()} news articles in your history.`}
            </p>
            <Link to="/analyze" className="btn-primary text-sm">Analyze News Now</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map(item => (
              <HistoryItem key={item._id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────────── */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => fetchHistory(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-secondary py-2 px-3 text-sm disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-slate-400 text-sm px-4">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchHistory(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn-secondary py-2 px-3 text-sm disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
