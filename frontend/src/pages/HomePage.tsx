import { SectionHeader } from "../components/SectionHeader";
import { useAuth } from "../hooks/useAuth";

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="page">
      <SectionHeader
        eyebrow="Dashboard"
        title="Creator workspace overview"
        description="A focused control room for profile management, discovery, shortlist review, and internal ops."
        badge="Live workspace"
      />

      <div className="hero-panel card">
        <div>
          <span className="eyebrow">Ready to work</span>
          <h3>Everything important is one click away.</h3>
          <p className="muted">
            Use the sidebar to move between creator profile setup, discovery, favorites, and admin review without
            leaving the workspace.
          </p>
        </div>
        <div className="hero-metrics">
          <div className="hero-metric">
            <span className="muted">Signed in as</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="hero-metric">
            <span className="muted">Role</span>
            <strong>{user?.role}</strong>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <article className="card stat-card accent-card">
          <span className="stat-index">01</span>
          <strong>Profile ops</strong>
          <p className="muted">Keep display name, handle, bio, and avatar links presentation-ready.</p>
        </article>
        <article className="card stat-card">
          <span className="stat-index">02</span>
          <strong>Discovery flow</strong>
          <p className="muted">Search the directory and turn promising profiles into favorites quickly.</p>
        </article>
        <article className="card stat-card">
          <span className="stat-index">03</span>
          <span className="muted">Platform state</span>
          <strong>MVP ready</strong>
          <p className="muted">The product shell is standardized for desktop and mobile use.</p>
        </article>
      </div>
    </section>
  );
}
