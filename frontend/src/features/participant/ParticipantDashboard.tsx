import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { AuthNavWidget } from '../../components/navigation/AuthNavWidget';
import { ArrowLeft, Calendar, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import './ParticipantDashboard.css';

export const ParticipantDashboard: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

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

        {/* Info & Registered Events Grid */}
        <div className="dashboard-grid">
          {/* Account Details */}
          <section className="dashboard-card">
            <h2>
              <UserIcon size={18} color="#38bdf8" />
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
                <span className="dashboard-meta-val">{user.college || 'NIT Raipur'}</span>
              </div>
              <div className="dashboard-meta-item">
                <span className="dashboard-meta-label">Academic Year</span>
                <span className="dashboard-meta-val">{user.year || 'N/A'}</span>
              </div>
              <div className="dashboard-meta-item">
                <span className="dashboard-meta-label">Role</span>
                <span className="dashboard-meta-val">{user.role}</span>
              </div>
            </div>
          </section>

          {/* Registered Events */}
          <section className="dashboard-card">
            <h2>
              <Calendar size={18} color="#f472b6" />
              <span>My Registrations</span>
            </h2>
            <div className="dashboard-empty-state">
              <Sparkles size={28} color="#38bdf8" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
              <p>You have not registered for any events yet.</p>
              <Link to="/#events" className="dashboard-btn-secondary" style={{ marginTop: '12px' }}>
                Browse Events
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ParticipantDashboard;
