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

  const pageMetaByPath: Record<string, { titleKey: string; contextKey: string }> = {
    "/": { titleKey: "pages.home.topbarTitle", contextKey: "pages.home.topbarContext" },
    "/profile": { titleKey: "pages.profile.topbarTitle", contextKey: "pages.profile.topbarContext" },
    "/discovery": { titleKey: "pages.discovery.topbarTitle", contextKey: "pages.discovery.topbarContext" },
    "/favorites": { titleKey: "pages.favorites.topbarTitle", contextKey: "pages.favorites.topbarContext" },
    "/admin": { titleKey: "pages.admin.topbarTitle", contextKey: "pages.admin.topbarContext" }
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
    contextKey: "common.workspace"
  };

  return (
    <div className="app-shell">
      <div className={`sidebar-layer${isSidebarOpen ? " is-open" : ""}`} onClick={handleNavigate} />
      <div
        aria-hidden={!isSidebarOpen}
        className={`sidebar-frame${isSidebarOpen ? " is-open" : ""}`}
      >
        <AppSidebar
          email={user?.email}
          role={user?.role}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
      </div>

      <main className="content">
        <AppTopbar
          title={t(currentPage.titleKey)}
          context={t(currentPage.contextKey)}
          email={user?.email}
          role={user?.role}
          isSidebarOpen={isSidebarOpen}
          onMenuToggle={() => setIsSidebarOpen((current) => !current)}
        />
        <div className="content-shell">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
