import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "../components/AppSidebar";
import { AppTopbar } from "../components/AppTopbar";
import { useAuth } from "../hooks/useAuth";

export function ProtectedLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const pageMetaByPath: Record<string, { title: string; eyebrow: string }> = {
    "/": { title: "Overview", eyebrow: "Dashboard" },
    "/profile": { title: "Creator Profile", eyebrow: "Profile" },
    "/discovery": { title: "Discovery", eyebrow: "Network" },
    "/favorites": { title: "Favorites", eyebrow: "Shortlist" },
    "/admin": { title: "Admin", eyebrow: "Operations" }
  };

  function handleLogout() {
    signOut();
    navigate("/login", {
      replace: true,
      state: { message: "Logged out successfully." }
    });
  }

  function handleNavigate() {
    setIsSidebarOpen(false);
  }

  const currentPage = pageMetaByPath[location.pathname] ?? {
    title: "Workspace",
    eyebrow: "Dashboard"
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
          eyebrow={currentPage.eyebrow}
          title={currentPage.title}
          email={user?.email}
          onMenuToggle={() => setIsSidebarOpen((current) => !current)}
        />
        <Outlet />
      </main>
    </div>
  );
}
