import { useTranslation } from "react-i18next";
import type { Role } from "../services/types";

interface AppTopbarProps {
  title: string;
  context: string;
  email?: string;
  role?: Role;
  onMenuToggle: () => void;
}

export function AppTopbar({ title, context, email, role, onMenuToggle }: AppTopbarProps) {
  const { t } = useTranslation();

  return (
    <header className="topbar card">
      <button
        aria-label={t("common.actions.menu")}
        className="button button-secondary mobile-menu-button"
        onClick={onMenuToggle}
        type="button"
      >
        {t("common.actions.menu")}
      </button>
      <div className="topbar-copy">
        <span className="topbar-context">{context}</span>
        <strong>{title}</strong>
      </div>
      <div className="topbar-meta">
        <div className="topbar-meta-block">
          <span className="topbar-meta-label">{t("topbar.currentPage")}</span>
          <strong>{title}</strong>
        </div>
        <div className="topbar-meta-block">
          <span className="topbar-meta-label">{t("topbar.account")}</span>
          <strong>{email}</strong>
          <span className="muted">{role ? t(`common.role.${role}`) : t("topbar.overview")}</span>
        </div>
      </div>
    </header>
  );
}
