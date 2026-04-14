import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageTitleByPath: Record<string, string> = {
    "/": "Home",
    "/profile": "Profile",
    "/discovery": "Discovery",
    "/favorites": "Favorites",
    "/admin": "Admin"
  };

  function handleLogout() {
    signOut();
    navigate("/login", {
      replace: true,
      state: { message: "Logged out successfully." }
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand brand-large">Stream Platform</div>
          <p className="muted">MVP dashboard for streamers and internal ops.</p>
        </div>

        <nav className="nav-list">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/discovery">Discovery</NavLink>
          <NavLink to="/favorites">Favorites</NavLink>
          {user?.role === "ADMIN" ? <NavLink to="/admin">Admin</NavLink> : null}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <strong>{user?.email}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="button button-secondary" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="content-header card">
          <div>
            <span className="eyebrow">Workspace</span>
            <h2>{pageTitleByPath[location.pathname] ?? "Dashboard"}</h2>
          </div>
          <div className="muted">Signed in as {user?.email}</div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
