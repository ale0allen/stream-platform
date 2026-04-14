import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { Role } from "../services/types";

interface AppSidebarProps {
  email?: string;
  role?: Role;
  onLogout: () => void;
  onNavigate?: () => void;
}

export function AppSidebar({ email, role, onLogout, onNavigate }: AppSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand-lockup">
          <div className="brand-mark">SP</div>
          <div>
            <strong className="brand-title">{t("common.brand")}</strong>
            <p className="brand-copy">{t("navigation.brandDescription")}</p>
          </div>
        </div>

        <nav className="nav-list" aria-label={t("common.workspace")}>
          <NavLink to="/" end onClick={onNavigate}>
            <span className="nav-label">{t("navigation.home.label")}</span>
            <span className="nav-caption">{t("navigation.home.caption")}</span>
          </NavLink>
          <NavLink to="/profile" onClick={onNavigate}>
            <span className="nav-label">{t("navigation.profile.label")}</span>
            <span className="nav-caption">{t("navigation.profile.caption")}</span>
          </NavLink>
          <NavLink to="/discovery" onClick={onNavigate}>
            <span className="nav-label">{t("navigation.discovery.label")}</span>
            <span className="nav-caption">{t("navigation.discovery.caption")}</span>
          </NavLink>
          <NavLink to="/favorites" onClick={onNavigate}>
            <span className="nav-label">{t("navigation.favorites.label")}</span>
            <span className="nav-caption">{t("navigation.favorites.caption")}</span>
          </NavLink>
          {role === "ADMIN" ? (
            <NavLink to="/admin" onClick={onNavigate}>
              <span className="nav-label">{t("navigation.admin.label")}</span>
              <span className="nav-caption">{t("navigation.admin.caption")}</span>
            </NavLink>
          ) : null}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-chip">
          <span className="user-chip-label">{t("navigation.signedIn")}</span>
          <strong>{email}</strong>
          <span>{role ? t(`common.role.${role}`) : ""}</span>
        </div>
        <button className="button button-secondary" onClick={onLogout} type="button">
          {t("common.actions.logout")}
        </button>
      </div>
    </aside>
  );
}
