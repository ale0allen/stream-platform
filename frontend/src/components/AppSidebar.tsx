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
  const navItems = [
    {
      to: "/",
      label: t("navigation.home.label"),
      caption: t("navigation.home.caption"),
      end: true
    },
    {
      to: "/profile",
      label: t("navigation.profile.label"),
      caption: t("navigation.profile.caption")
    },
    {
      to: "/discovery",
      label: t("navigation.discovery.label"),
      caption: t("navigation.discovery.caption")
    },
    {
      to: "/favorites",
      label: t("navigation.favorites.label"),
      caption: t("navigation.favorites.caption")
    }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand-lockup">
          <div className="brand-mark">SP</div>
          <div className="brand-stack">
            <strong className="brand-title">{t("common.brand")}</strong>
            <span className="brand-kicker">{t("common.creatorHub")}</span>
            <p className="brand-copy">{t("navigation.brandDescription")}</p>
          </div>
        </div>

        <nav className="nav-list" aria-label={t("common.workspace")}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate}>
              <span className="nav-copy">
                <span className="nav-label">{item.label}</span>
                <span className="nav-caption">{item.caption}</span>
              </span>
            </NavLink>
          ))}
          {role === "ADMIN" ? (
            <NavLink to="/admin" onClick={onNavigate}>
              <span className="nav-copy">
                <span className="nav-label">{t("navigation.admin.label")}</span>
                <span className="nav-caption">{t("navigation.admin.caption")}</span>
              </span>
            </NavLink>
          ) : null}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="user-chip">
          <span className="user-chip-label">{t("navigation.signedIn")}</span>
          <strong>{email}</strong>
          <span>{role ? t("navigation.userRole", { role: t(`common.role.${role}`) }) : ""}</span>
        </div>
        <button className="button button-secondary button-full" onClick={onLogout} type="button">
          {t("common.actions.logout")}
        </button>
      </div>
    </aside>
  );
}
