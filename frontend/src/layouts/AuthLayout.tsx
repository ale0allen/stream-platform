import { Link, Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel-brand">
        <span className="eyebrow">Creator Platform</span>
        <h1>Run a creator workspace that feels ready for launch.</h1>
        <p>
          Centralize creator profiles, discovery, saved talent, and internal operations in one clean control
          room.
        </p>
        <div className="auth-feature-grid">
          <div className="auth-feature-card">
            <strong>Discovery pipeline</strong>
            <span>Search, review, and save creator profiles fast.</span>
          </div>
          <div className="auth-feature-card">
            <strong>Ops visibility</strong>
            <span>Keep profile edits and admin actions inside one workspace.</span>
          </div>
        </div>
      </div>
      <div className="auth-panel">
        <header className="auth-header">
          <Link to="/" className="brand auth-brand">
            <span className="brand-mark brand-mark-small">SP</span>
            <span className="brand-title">Stream Platform</span>
          </Link>
        </header>
        <div className="auth-form-wrap">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
