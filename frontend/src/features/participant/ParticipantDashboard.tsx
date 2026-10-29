import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { AuthNavWidget } from '../../components/navigation/AuthNavWidget';
import { ArrowLeft, Calendar, User as UserIcon, Shield, Sparkles, Trophy, RefreshCw } from 'lucide-react';
import api from '../../services/api/apiClient';
import './ParticipantDashboard.css';

interface PointsTransaction {
  id: string;
  eventName: string;
  delta: number;
  reason: string;
  createdAt: string;
  administrator: { id: string; name: string };
}

interface ParticipantPoints {
  participant: {
    id: string;
    totalPoints: number;
    rank: number;
  };
  transactions: PointsTransaction[];
  nextCursor: string | null;
}

interface LeaderboardEntry {
  id: string;
  name: string;
  totalPoints: number;
  rank: number;
}

export const ParticipantDashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState<ParticipantPoints | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pointsLoading, setPointsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [pointsError, setPointsError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const historyRequestId = useRef(0);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    if (!user) return;
    let active = true;
    Promise.all([
      api.get<ParticipantPoints>('/points/me?limit=25'),
      api.get<{ leaderboard: LeaderboardEntry[] }>('/points/leaderboard'),
    ]).then(([profile, board]) => {
      if (!active) return;
      setPoints(profile);
      setLeaderboard(board.leaderboard);
    }).catch((error: unknown) => {
      if (active) {
        setPointsError(error instanceof Error ? error.message : 'Unable to load points information.');
      }
    }).finally(() => {
      if (active) setPointsLoading(false);
    });
    return () => { active = false; };
  }, [navigate, refreshKey, user]);

  useEffect(() => {
    const refreshOnFocus = () => {
      historyRequestId.current += 1;
      setPointsLoading(true);
      setHistoryLoading(false);
      setPointsError('');
      setRefreshKey((key) => key + 1);
    };
    window.addEventListener('focus', refreshOnFocus);
    return () => window.removeEventListener('focus', refreshOnFocus);
  }, []);

  const loadMoreHistory = async () => {
    if (!points?.nextCursor || historyLoading) return;
    const requestId = ++historyRequestId.current;
    setHistoryLoading(true);
    try {
      const next = await api.get<ParticipantPoints>(
        `/points/me?limit=25&cursor=${encodeURIComponent(points.nextCursor)}`,
      );
      if (requestId === historyRequestId.current) {
        setPoints((current) => current && ({
          ...next,
          transactions: [...current.transactions, ...next.transactions],
        }));
      }
    } catch (error) {
      if (requestId === historyRequestId.current) {
        setPointsError(error instanceof Error ? error.message : 'Unable to load more history.');
      }
    } finally {
      if (requestId === historyRequestId.current) setHistoryLoading(false);
    }
  };

  const refreshDashboard = () => {
    historyRequestId.current += 1;
    setPointsLoading(true);
    setHistoryLoading(false);
    setPointsError('');
    setRefreshKey((key) => key + 1);
  };

  if (loading) {
    return (
      <div className="litfest-dashboard-page" style={{ display: 'grid', placeItems: 'center' }}>
        <p style={{ color: '#94a3b8' }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="litfest-dashboard-page" style={{ display: 'grid', placeItems: 'center', textAlign: 'center', padding: '40px' }}>
        <div>
          <h2>Access Restricted</h2>
          <p style={{ color: '#94a3b8', margin: '12px 0 24px' }}>Please log in to view your LitFest account details and registrations.</p>
          <button
            type="button"
            className="dashboard-btn-secondary"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="litfest-dashboard-page">
      {/* Top Navbar with AuthNavWidget */}
      <header className="dashboard-nav-bar">
        <Link to="/" className="dashboard-brand">
          LITERATI
        </Link>
        <AuthNavWidget />
      </header>

      <main className="dashboard-container">
        {/* Profile Hero Card */}
        <div className="dashboard-hero-card">
          <div className="dashboard-hero-left">
            <div className="dashboard-avatar-large">
              {initials}
            </div>
            <div className="dashboard-user-info">
              <h1>{user.name}</h1>
              <p>{user.email}</p>
              <div className="dashboard-badge-pill role-badge">
                <Shield size={12} />
                <span>{user.role}</span>
              </div>
            </div>
          </div>

          <div className="dashboard-hero-actions">
            <Link to="/" className="dashboard-btn-secondary">
              <ArrowLeft size={16} />
              <span>Back to Festival Home</span>
            </Link>
          </div>
        </div>

        <div className="participant-score-grid">
          <div className="participant-profile-column">
            <section className="dashboard-card">
              <h2>
                <UserIcon size={18} />
                <span>Account Profile</span>
              </h2>
              <div className="dashboard-meta-list">
                <div className="dashboard-meta-item">
                  <span className="dashboard-meta-label">Full Name</span>
                  <span className="dashboard-meta-val">{user.name}</span>
                </div>
                <div className="dashboard-meta-item">
                  <span className="dashboard-meta-label">Email</span>
                  <span className="dashboard-meta-val">{user.email}</span>
                </div>
                <div className="dashboard-meta-item">
                  <span className="dashboard-meta-label">College</span>
                  <span className="dashboard-meta-val">{user.college || 'Not provided'}</span>
                </div>
                <div className="dashboard-meta-item">
                  <span className="dashboard-meta-label">Role</span>
                  <span className="dashboard-meta-val">{user.role}</span>
                </div>
              </div>
            </section>

            <section className="dashboard-card points-history-card" aria-labelledby="points-history-title">
            <div className="dashboard-section-heading">
              <h2 id="points-history-title">
                <Trophy size={18} />
                <span>My points history</span>
              </h2>
              <button
                type="button"
                className="dashboard-refresh-button"
                onClick={refreshDashboard}
                disabled={pointsLoading}
                aria-label="Refresh points and leaderboard"
              >
                <RefreshCw size={15} />
                Refresh
              </button>
            </div>
            {pointsError && <p className="dashboard-data-error" role="alert">{pointsError}</p>}
            {pointsLoading ? (
              <p className="dashboard-data-message" role="status">Loading points and leaderboard…</p>
            ) : points ? (
              <>
                <div className="points-summary" aria-label="Your current score">
                  <div><span>Total points</span><strong>{points.participant.totalPoints}</strong></div>
                  <div><span>Leaderboard rank</span><strong>#{points.participant.rank || '—'}</strong></div>
                </div>
                <div className="points-transaction-list">
                  {points.transactions.length === 0 ? (
                    <p className="dashboard-data-message">No points adjustments have been recorded yet.</p>
                  ) : points.transactions.map((transaction) => (
                    <article className="points-transaction" key={transaction.id}>
                      <div className="points-transaction-main">
                        <strong>{transaction.eventName}</strong>
                        <span className={transaction.delta > 0 ? 'points-change points-positive' : 'points-change points-negative'}>
                          {transaction.delta > 0 ? 'Added' : 'Deducted'} {Math.abs(transaction.delta)} points
                        </span>
                      </div>
                      <p>{transaction.reason}</p>
                      <time dateTime={transaction.createdAt}>
                        {new Date(transaction.createdAt).toLocaleString()}
                      </time>
                    </article>
                  ))}
                </div>
                {points.nextCursor && (
                  <button
                    type="button"
                    className="dashboard-btn-secondary points-load-more"
                    onClick={() => void loadMoreHistory()}
                    disabled={historyLoading}
                  >
                    {historyLoading ? 'Loading…' : 'Load older adjustments'}
                  </button>
                )}
              </>
            ) : null}
            </section>
          </div>

          <section className="dashboard-card points-leaderboard-card" aria-labelledby="leaderboard-title">
            <h2 id="leaderboard-title"><Trophy size={18} /><span>Leaderboard</span></h2>
            {pointsLoading ? (
              <p className="dashboard-data-message" role="status">Loading leaderboard…</p>
            ) : leaderboard.length === 0 ? (
              <p className="dashboard-data-message">No participant scores are available yet.</p>
            ) : (
              <ol className="points-leaderboard">
                {leaderboard.map((entry) => (
                  <li
                    className={entry.id === user.id ? 'points-leaderboard-entry is-current-user' : 'points-leaderboard-entry'}
                    key={entry.id}
                    aria-current={entry.id === user.id ? 'true' : undefined}
                  >
                    <span className="leaderboard-rank">#{entry.rank}</span>
                    <span className="leaderboard-name">
                      {entry.name}{entry.id === user.id && <span className="leaderboard-you">You</span>}
                    </span>
                    <strong>{entry.totalPoints}</strong>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <section className="dashboard-card registrations-card">
          <h2>
            <Calendar size={18} />
            <span>My Registrations</span>
          </h2>
          <div className="dashboard-empty-state">
            <Sparkles size={28} style={{ margin: '0 auto 8px', opacity: 0.8 }} />
            <p>You have not registered for any events yet.</p>
            <Link to="/#events" className="dashboard-btn-secondary" style={{ marginTop: '12px' }}>
              Browse Events
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ParticipantDashboard;
