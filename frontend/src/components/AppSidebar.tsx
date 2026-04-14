import { NavLink } from "react-router-dom";
import type { Role } from "../services/types";

interface AppSidebarProps {
  email?: string;
  role?: Role;
  onLogout: () => void;
  onNavigate?: () => void;
}

export function AppSidebar({ email, role, onLogout, onNavigate }: AppSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand-lockup">
          <div className="brand-mark">SP</div>
          <div>
            <strong className="brand-title">Stream Platform</strong>
            <p className="brand-copy">Creator ops, discovery, and profile management in one workspace.</p>
          </div>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          <NavLink to="/" end onClick={onNavigate}>
            <span className="nav-label">Overview</span>
            <span className="nav-caption">Home</span>
          </NavLink>
          <NavLink to="/profile" onClick={onNavigate}>
            <span className="nav-label">Creator profile</span>
            <span className="nav-caption">Profile</span>
          </NavLink>
          <NavLink to="/discovery" onClick={onNavigate}>
            <span className="nav-label">Find creators</span>
            <span className="nav-caption">Discovery</span>
          </NavLink>
          <NavLink to="/favorites" onClick={onNavigate}>
            <span className="nav-label">Saved shortlist</span>
            <span className="nav-caption">Favorites</span>
          </NavLink>
          {role === "ADMIN" ? (
            <NavLink to="/admin" onClick={onNavigate}>
              <span className="nav-label">Operations</span>
              <span className="nav-caption">Admin</span>
            </NavLink>
          ) : null}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-chip">
          <span className="user-chip-label">Signed in</span>
          <strong>{email}</strong>
          <span>{role}</span>
        </div>
        <button className="button button-secondary" onClick={onLogout} type="button">
          Logout
        </button>
      </div>
    </aside>
  );
}
