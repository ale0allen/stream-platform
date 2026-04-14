import { Link, Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel-brand">
        <span className="eyebrow">Stream Platform</span>
        <h1>Build the first version of your streamer hub.</h1>
        <p>
          Centralize profiles, discovery, favorites, and admin operations in one lightweight MVP.
        </p>
      </div>
      <div className="auth-panel">
        <header className="auth-header">
          <Link to="/" className="brand">
            SP
          </Link>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
