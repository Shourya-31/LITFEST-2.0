import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Shield, Trophy, UserRound } from 'lucide-react';
import { AuthNavWidget } from '../../components/navigation/AuthNavWidget';
import api from '../../services/api/apiClient';
import { useAuth } from '../../state/AuthContext';
import './AdminDashboard.css';

interface LeaderboardEntry {
  id: string;
  name: string;
  totalPoints: number;
  rank: number;
}

interface PointsTransaction {
  id: string;
  eventName: string;
  delta: number;
  reason: string;
  createdAt: string;
  administrator: { id: string; name: string };
}

interface ParticipantProfile {
  participant: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    college: string | null;
    bio: string | null;
    createdAt: string;
    totalPoints: number;
    rank: number;
  };
  transactions: PointsTransaction[];
  nextCursor: string | null;
}

type AdjustmentAction = 'ADD' | 'DEDUCT';

export const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState('');
  const [leaderboardRefreshKey, setLeaderboardRefreshKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [action, setAction] = useState<AdjustmentAction>('ADD');
  const [amount, setAmount] = useState('');
  const [eventName, setEventName] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitError, setSubmitError] = useState('');
  const requestKey = useRef<string | null>(null);
  const submitLock = useRef(false);
  const profileRequestId = useRef(0);

  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    api.get<{ leaderboard: LeaderboardEntry[] }>('/points/leaderboard')
      .then((data) => {
        if (active) setLeaderboard(data.leaderboard);
      })
      .catch((error: unknown) => {
        if (active) setLeaderboardError(error instanceof Error ? error.message : 'Unable to load leaderboard.');
      })
      .finally(() => {
        if (active) setLeaderboardLoading(false);
      });
    return () => { active = false; };
  }, [isAdmin, leaderboardRefreshKey]);

  useEffect(() => {
    if (!selectedId || !isAdmin) return;
    const requestId = ++profileRequestId.current;
    let active = true;
    api.get<ParticipantProfile>(
      `/points/admin/participants/${encodeURIComponent(selectedId)}?limit=25`,
    ).then((data) => {
      if (active && requestId === profileRequestId.current) setProfile(data);
    }).catch((error: unknown) => {
      if (active && requestId === profileRequestId.current) {
        setProfileError(error instanceof Error ? error.message : 'Unable to load participant details.');
      }
    }).finally(() => {
      if (active && requestId === profileRequestId.current) setProfileLoading(false);
    });
    return () => { active = false; };
  }, [isAdmin, profileRefreshKey, selectedId]);

  const filteredParticipants = leaderboard.filter((entry) =>
    `${entry.name} ${entry.id}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const loadMoreHistory = () => {
    if (selectedId && profile?.nextCursor && !historyLoading) {
      const requestId = ++profileRequestId.current;
      setHistoryLoading(true);
      setProfileError('');
      api.get<ParticipantProfile>(
        `/points/admin/participants/${encodeURIComponent(selectedId)}?limit=25&cursor=${encodeURIComponent(profile.nextCursor)}`,
      ).then((next) => {
        if (requestId === profileRequestId.current) {
          setProfile((current) => current && ({
            ...next,
            transactions: [...current.transactions, ...next.transactions],
          }));
        }
      }).catch((error: unknown) => {
        if (requestId === profileRequestId.current) {
          setProfileError(error instanceof Error ? error.message : 'Unable to load older history.');
        }
      }).finally(() => {
        if (requestId === profileRequestId.current) setHistoryLoading(false);
      });
    }
  };

  const refreshLeaderboard = () => {
    setLeaderboardLoading(true);
    setLeaderboardError('');
    setLeaderboardRefreshKey((key) => key + 1);
  };

  const selectParticipant = (participantId: string) => {
    profileRequestId.current += 1;
    requestKey.current = null;
    setSelectedId(participantId);
    setProfile(null);
    setProfileLoading(true);
    setProfileError('');
    setAmount('');
    setEventName('');
    setReason('');
    setFeedback('');
    setSubmitError('');
  };

  const submitAdjustment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId || !profile || submitLock.current) return;

    const points = Number(amount);
    const cleanEvent = eventName.trim();
    const cleanReason = reason.trim();
    if (!Number.isSafeInteger(points) || points < 1 || points > 2_147_483_647 || !cleanEvent || !cleanReason) {
      setSubmitError('Enter a valid positive whole number, event name, and reason.');
      return;
    }

    const signedChange = action === 'ADD' ? points : -points;
    const confirmed = window.confirm(
      `${action === 'ADD' ? 'Add' : 'Deduct'} ${Math.abs(signedChange)} points for ${profile.participant.name}?\n\nEvent: ${cleanEvent}\nChange: ${signedChange > 0 ? '+' : ''}${signedChange}\nReason: ${cleanReason}`,
    );
    if (!confirmed) return;

    submitLock.current = true;
    setSubmitting(true);
    setSubmitError('');
    setFeedback('');
    requestKey.current ??= crypto.randomUUID();

    try {
      await api.post(
        `/points/admin/participants/${encodeURIComponent(selectedId)}/adjustments`,
        {
          action,
          points,
          eventName: cleanEvent,
          reason: cleanReason,
          idempotencyKey: requestKey.current,
        },
      );
      requestKey.current = null;
      setAmount('');
      setEventName('');
      setReason('');
      setFeedback('Points adjustment recorded successfully.');
      setLeaderboardLoading(true);
      setProfileLoading(true);
      setLeaderboardRefreshKey((key) => key + 1);
      setProfileRefreshKey((key) => key + 1);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to record points adjustment.');
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <main className="admin-dashboard-page" role="status">Loading administrator access…</main>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent('/admin/dashboard')}`} replace />;
  }

  if (!isAdmin) {
    return (
      <main className="admin-dashboard-page admin-access-message">
        <h1>Administrator access required</h1>
        <p>Your account cannot manage participant scores.</p>
        <Link to="/dashboard" className="admin-button">Return to your dashboard</Link>
      </main>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <header className="admin-dashboard-nav">
        <Link to="/" className="admin-dashboard-brand">LITERATI</Link>
        <AuthNavWidget />
      </header>

      <main className="admin-dashboard-container">
        <div className="admin-dashboard-heading">
          <div>
            <p className="admin-eyebrow"><Shield size={14} /> Administrator workspace</p>
            <h1>Points & leaderboard</h1>
            <p>Record event scores with a permanent, attributable adjustment history.</p>
          </div>
          <Link to="/" className="admin-button admin-button-secondary"><ArrowLeft size={16} /> Festival home</Link>
        </div>

        <div className="admin-dashboard-grid">
          <section className="admin-card admin-participant-list" aria-labelledby="admin-leaderboard-title">
            <div className="admin-card-heading">
              <h2 id="admin-leaderboard-title"><Trophy size={18} /> Leaderboard</h2>
              <button
                type="button"
                className="admin-icon-button"
                onClick={refreshLeaderboard}
                disabled={leaderboardLoading}
                aria-label="Refresh leaderboard"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <label className="admin-search-label" htmlFor="participant-search">Search participants</label>
            <input
              id="participant-search"
              className="admin-input"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or participant ID"
            />
            {leaderboardError && <p className="admin-error" role="alert">{leaderboardError}</p>}
            {leaderboardLoading ? (
              <p className="admin-status" role="status">Loading participants…</p>
            ) : filteredParticipants.length === 0 ? (
              <p className="admin-status">{search ? 'No matching participants.' : 'No participants are available.'}</p>
            ) : (
              <ol className="admin-participant-rows">
                {filteredParticipants.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className={entry.id === selectedId ? 'admin-participant-row is-selected' : 'admin-participant-row'}
                      onClick={() => selectParticipant(entry.id)}
                      aria-pressed={entry.id === selectedId}
                      disabled={submitting || historyLoading}
                    >
                      <span className="admin-row-rank">#{entry.rank}</span>
                      <span className="admin-row-name">{entry.name}<small>ID {entry.id}</small></span>
                      <strong>{entry.totalPoints}<small>points</small></strong>
                    </button>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="admin-card admin-participant-details" aria-labelledby="participant-detail-title">
            <div className="admin-card-heading">
              <h2 id="participant-detail-title"><UserRound size={18} /> Participant details</h2>
            </div>
            {!selectedId ? (
              <p className="admin-status">Select a leaderboard participant to view their profile and history.</p>
            ) : profileLoading ? (
              <p className="admin-status" role="status">Loading participant profile…</p>
            ) : profile ? (
              <>
                <div className="admin-profile-summary">
                  <div className="admin-profile-title">
                    <div className="admin-profile-avatar" aria-hidden="true">
                      {profile.participant.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div><h3>{profile.participant.name}</h3><span>ID {profile.participant.id}</span></div>
                  </div>
                  <div className="admin-profile-stats">
                    <div><span>Total points</span><strong>{profile.participant.totalPoints}</strong></div>
                    <div><span>Rank</span><strong>#{profile.participant.rank || '—'}</strong></div>
                  </div>
                  <dl className="admin-profile-data">
                    <div><dt>Email</dt><dd>{profile.participant.email}</dd></div>
                    <div><dt>Phone</dt><dd>{profile.participant.phone || 'Not provided'}</dd></div>
                    <div><dt>College</dt><dd>{profile.participant.college || 'Not provided'}</dd></div>
                    <div><dt>Joined</dt><dd>{new Date(profile.participant.createdAt).toLocaleDateString()}</dd></div>
                    {profile.participant.bio && <div><dt>About</dt><dd>{profile.participant.bio}</dd></div>}
                  </dl>
                </div>

                <form className="admin-adjustment-form" onSubmit={(event) => void submitAdjustment(event)}>
                  <h3>Adjust points</h3>
                  <label htmlFor="adjustment-action">Action</label>
                  <select
                    id="adjustment-action"
                    className="admin-input"
                    value={action}
                    disabled={submitting || historyLoading}
                    onChange={(event) => {
                      requestKey.current = null;
                      setAction(event.target.value as AdjustmentAction);
                    }}
                  >
                    <option value="ADD">Add points</option>
                    <option value="DEDUCT">Deduct points</option>
                  </select>

                  <label htmlFor="adjustment-points">Points</label>
                  <input
                    id="adjustment-points"
                    className="admin-input"
                    type="number"
                    min="1"
                    max="2147483647"
                    step="1"
                    required
                    value={amount}
                    disabled={submitting || historyLoading}
                    onChange={(event) => {
                      requestKey.current = null;
                      setAmount(event.target.value);
                    }}
                  />
                  <label htmlFor="adjustment-event">Event name</label>
                  <input
                    id="adjustment-event"
                    className="admin-input"
                    type="text"
                    maxLength={150}
                    required
                    value={eventName}
                    disabled={submitting || historyLoading}
                    onChange={(event) => {
                      requestKey.current = null;
                      setEventName(event.target.value);
                    }}
                  />
                  <label htmlFor="adjustment-reason">Reason</label>
                  <textarea
                    id="adjustment-reason"
                    className="admin-input admin-textarea"
                    maxLength={500}
                    required
                    value={reason}
                    disabled={submitting || historyLoading}
                    onChange={(event) => {
                      requestKey.current = null;
                      setReason(event.target.value);
                    }}
                  />
                  <div className="admin-feedback" aria-live="polite">
                    {submitError && <p className="admin-error" role="alert">{submitError}</p>}
                    {feedback && <p className="admin-success" role="status">{feedback}</p>}
                  </div>
                  <button type="submit" className="admin-button admin-submit-button" disabled={submitting || historyLoading}>
                    {submitting ? 'Saving adjustment…' : action === 'ADD' ? 'Confirm add points' : 'Confirm deduction'}
                  </button>
                </form>

                <div className="admin-history">
                  <h3>Points history</h3>
                  {profile.transactions.length === 0 ? (
                    <p className="admin-status">No adjustments have been recorded.</p>
                  ) : profile.transactions.map((transaction) => (
                    <article className="admin-history-entry" key={transaction.id}>
                      <div className="admin-history-heading">
                        <strong>{transaction.eventName}</strong>
                        <span className={transaction.delta > 0 ? 'admin-delta admin-delta-positive' : 'admin-delta admin-delta-negative'}>
                          {transaction.delta > 0 ? '+' : ''}{transaction.delta}
                        </span>
                      </div>
                      <p>{transaction.reason}</p>
                      <time dateTime={transaction.createdAt}>{new Date(transaction.createdAt).toLocaleString()}</time>
                      <span className="admin-history-actor">Recorded by {transaction.administrator.name}</span>
                    </article>
                  ))}
                  {profile.nextCursor && (
                    <button
                      type="button"
                      className="admin-button admin-button-secondary admin-history-more"
                      onClick={loadMoreHistory}
                      disabled={historyLoading}
                    >
                      {historyLoading ? 'Loading…' : 'Load older adjustments'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              profileError ? <p className="admin-error" role="alert">{profileError}</p> : null
            )}
            {profileError && profile && <p className="admin-error" role="alert">{profileError}</p>}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
