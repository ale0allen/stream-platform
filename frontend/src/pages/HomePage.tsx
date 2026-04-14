import { SectionHeader } from "../components/SectionHeader";
import { useAuth } from "../hooks/useAuth";

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="page">
      <SectionHeader
        eyebrow="Dashboard"
        title="Home"
        description="Quick access to profile management, discovery, favorites, and admin operations."
      />

      <div className="stats-grid">
        <article className="card stat-card">
          <span className="muted">Signed in as</span>
          <strong>{user?.email}</strong>
        </article>
        <article className="card stat-card">
          <span className="muted">Role</span>
          <strong>{user?.role}</strong>
        </article>
        <article className="card stat-card">
          <span className="muted">Platform state</span>
          <strong>MVP ready</strong>
        </article>
      </div>
    </section>
  );
}
