import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/AppSidebar";
import { AppTopbar } from "../components/AppTopbar";
import { useAuth } from "../hooks/useAuth";

export function ProtectedLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useTranslation();

  const pageMetaByPath: Record<string, { titleKey: string; eyebrowKey: string }> = {
    "/": { titleKey: "pages.home.topbarTitle", eyebrowKey: "pages.home.topbarEyebrow" },
    "/profile": { titleKey: "pages.profile.topbarTitle", eyebrowKey: "pages.profile.topbarEyebrow" },
    "/discovery": { titleKey: "pages.discovery.topbarTitle", eyebrowKey: "pages.discovery.topbarEyebrow" },
    "/favorites": { titleKey: "pages.favorites.topbarTitle", eyebrowKey: "pages.favorites.topbarEyebrow" },
    "/admin": { titleKey: "pages.admin.topbarTitle", eyebrowKey: "pages.admin.topbarEyebrow" }
  };

  function handleLogout() {
    signOut();
    navigate("/login", {
      replace: true,
      state: { message: t("common.feedback.loggedOut") }
    });
  }

  function handleNavigate() {
    setIsSidebarOpen(false);
  }

  const currentPage = pageMetaByPath[location.pathname] ?? {
    titleKey: "common.workspace",
    eyebrowKey: "pages.home.topbarEyebrow"
  };

  return (
    <div className="app-shell">
      <div className={`sidebar-layer${isSidebarOpen ? " is-open" : ""}`} onClick={handleNavigate} />
      <div className={`sidebar-frame${isSidebarOpen ? " is-open" : ""}`}>
        <AppSidebar
          email={user?.email}
          role={user?.role}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      </div>

      <main className="content">
        <AppTopbar
          eyebrow={t(currentPage.eyebrowKey)}
          title={t(currentPage.titleKey)}
          email={user?.email}
          onMenuToggle={() => setIsSidebarOpen((current) => !current)}
        />
        <Outlet />
      </main>
    </div>
  );
}
