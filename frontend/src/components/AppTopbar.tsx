interface AppTopbarProps {
  eyebrow: string;
  title: string;
  email?: string;
  onMenuToggle: () => void;
}

export function AppTopbar({ eyebrow, title, email, onMenuToggle }: AppTopbarProps) {
  return (
    <header className="topbar card">
      <div className="topbar-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <div className="topbar-actions">
        <div className="topbar-user">
          <span className="muted">Workspace</span>
          <strong>{email}</strong>
        </div>
        <button
          aria-label="Toggle navigation"
          className="button button-secondary mobile-menu-button"
          onClick={onMenuToggle}
          type="button"
        >
          Menu
        </button>
      </div>
    </header>
  );
}
