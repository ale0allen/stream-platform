import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedLayout } from "../layouts/ProtectedLayout";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { HomePage } from "../pages/HomePage";
import { ProfilePage } from "../pages/ProfilePage";
import { PublicProfilePage } from "../pages/PublicProfilePage";
import { CreatorProfilePage } from "../pages/CreatorProfilePage";
import { DiscoveryPage } from "../pages/DiscoveryPage";
import { FavoritesPage } from "../pages/FavoritesPage";
import { AdminPage } from "../pages/AdminPage";
import { RequireAuth } from "./RequireAuth";
import { RequireAdmin } from "./RequireAdmin";

export const router = createBrowserRouter([
  { path: "/u/:username", element: <PublicProfilePage /> },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> }
    ]
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/profiles/:profileId", element: <CreatorProfilePage /> },
          { path: "/discovery", element: <DiscoveryPage /> },
          { path: "/favorites", element: <FavoritesPage /> },
          {
            element: <RequireAdmin />,
            children: [{ path: "/admin", element: <AdminPage /> }]
          }
        ]
      }
    ]
  }
]);
