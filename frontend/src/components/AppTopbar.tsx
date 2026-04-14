import { useTranslation } from "react-i18next";

interface AppTopbarProps {
  eyebrow: string;
  title: string;
  email?: string;
  onMenuToggle: () => void;
}

export function AppTopbar({ eyebrow, title, email, onMenuToggle }: AppTopbarProps) {
  const { t } = useTranslation();

  return (
    <header className="topbar card">
      <div className="topbar-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      <div className="topbar-actions">
        <div className="topbar-user">
          <span className="muted">{t("common.workspace")}</span>
          <strong>{email}</strong>
        </div>
        <button
          aria-label={t("common.actions.menu")}
          className="button button-secondary mobile-menu-button"
          onClick={onMenuToggle}
          type="button"
        >
          {t("common.actions.menu")}
        </button>
      </div>
    </header>
  );
}
