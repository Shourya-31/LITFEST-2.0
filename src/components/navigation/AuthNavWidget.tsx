import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { User } from '../../types';
import './AuthNavWidget.css';

export interface AuthNavWidgetProps {
  /** Override user object directly (defaults to useAuth().user) */
  user?: User | null;
  /** Explicit authentication override */
  isAuthenticated?: boolean;
  /** Loading state override */
  loading?: boolean;
  /** Custom destination when avatar is clicked (default: '/dashboard') */
  profilePath?: string;
  /** Custom route for login (default: '/login') */
  loginPath?: string;
  /** Custom route for registration (default: '/signup') */
  registerPath?: string;
  /** Custom click handler for avatar (takes precedence over navigation) */
  onAvatarClick?: () => void;
  /** Custom click handler for login (e.g. open modal) */
  onLoginClick?: () => void;
  /** Custom click handler for register (e.g. open modal) */
  onRegisterClick?: () => void;
  /** Custom logout handler override */
  onLogout?: () => void | Promise<void>;
  /** Whether to show the logout icon button next to avatar (default: true) */
  showLogoutButton?: boolean;
  /** Whether to show the user's name text next to avatar (default: false) */
  showUserName?: boolean;
  /** Whether to show register button in guest state (default: true) */
  showRegisterButton?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Computes 1-2 character uppercase initials from name or email.
 */
function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (email && email.trim()) {
    return email.trim()[0].toUpperCase();
  }
  return '';
}

/**
 * AuthNavWidget
 * Self-contained, portable authentication navigation widget.
 * Features:
 *  - Logged In: Displays clickable user avatar (initials + role dot) and logout button.
 *  - Logged Out: Displays login and register CTA buttons.
 *  - Loading: Displays sleek shimmer skeleton.
 */
export const AuthNavWidget: React.FC<AuthNavWidgetProps> = ({
  user: userProp,
  isAuthenticated: isAuthProp,
  loading: loadingProp,
  profilePath = '/dashboard',
  loginPath = '/login',
  registerPath = '/signup',
  onAvatarClick,
  onLoginClick,
  onRegisterClick,
  onLogout,
  showLogoutButton = true,
  showUserName = false,
  showRegisterButton = true,
  className = '',
}) => {
  const navigate = useNavigate();

  const authContext = useAuth(true);

  const effectiveLoading = loadingProp !== undefined ? loadingProp : (authContext?.loading ?? false);
  const currentUser = userProp !== undefined ? userProp : (authContext?.user ?? null);
  const effectiveIsAuthenticated =
    isAuthProp !== undefined
      ? isAuthProp
      : authContext?.isAuthenticated ?? !!currentUser;

  // Handlers
  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAvatarClick) {
      onAvatarClick();
    } else {
      navigate(profilePath);
    }
  };

  const handleLogoutClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLogout) {
      await onLogout();
    } else if (authContext?.logout) {
      await authContext.logout();
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    if (onLoginClick) {
      e.preventDefault();
      onLoginClick();
    } else {
      e.preventDefault();
      navigate(loginPath);
    }
  };

  const handleRegisterClick = (e: React.MouseEvent) => {
    if (onRegisterClick) {
      e.preventDefault();
      onRegisterClick();
    } else {
      e.preventDefault();
      navigate(registerPath);
    }
  };

  // 1. Loading Skeleton State
  if (effectiveLoading) {
    return (
      <div className={`auth-nav-widget auth-nav-skeleton ${className}`} aria-label="Loading authentication">
        <div className="auth-skeleton-avatar" />
        <div className="auth-skeleton-btn" />
      </div>
    );
  }

  // 2. Authenticated State
  if (effectiveIsAuthenticated && currentUser) {
    const initials = getInitials(currentUser.name, currentUser.email);
    const displayName = currentUser.name || currentUser.email || 'User';
    const role = currentUser.role || 'PARTICIPANT';
    const isAdmin = role === 'ADMIN';

    return (
      <div className={`auth-nav-widget auth-user-container ${className}`} id="auth-nav-user-container">
        {/* Clickable Minimalist Avatar */}
        <button
          type="button"
          onClick={handleAvatarClick}
          className="auth-avatar-btn"
          id="auth-avatar-btn"
          title={`${displayName} (${role}) — Click to open Dashboard`}
          aria-label={`Open profile for ${displayName}`}
        >
          {initials ? (
            <span className="auth-avatar-initials">{initials}</span>
          ) : (
            <UserIcon size={18} strokeWidth={2.2} />
          )}

          {/* Admin / VIP Status Dot */}
          {isAdmin && (
            <span
              className="auth-role-indicator role-admin"
              title="Administrator"
              aria-label="Administrator"
            />
          )}
        </button>

        {/* Optional User Name Display */}
        {showUserName && (
          <span className="auth-user-name" title={displayName}>
            {displayName}
          </span>
        )}

        {/* Sleek Logout Icon Button */}
        {showLogoutButton && (
          <button
            type="button"
            onClick={handleLogoutClick}
            className="auth-logout-btn"
            id="auth-logout-btn"
            title="Log out"
            aria-label="Log out of account"
          >
            <LogOut size={16} strokeWidth={2} />
          </button>
        )}
      </div>
    );
  }

  // 3. Guest / Logged-out State
  return (
    <div className={`auth-nav-widget auth-guest-container ${className}`} id="auth-nav-guest-container">
      <button
        type="button"
        onClick={handleLoginClick}
        className="auth-login-link"
        id="auth-login-btn"
      >
        Login
      </button>

      {showRegisterButton && (
        <button
          type="button"
          onClick={handleRegisterClick}
          className="auth-register-btn"
          id="auth-register-btn"
        >
          Register
        </button>
      )}
    </div>
  );
};

export default AuthNavWidget;
