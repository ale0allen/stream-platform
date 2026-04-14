import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { ProfileCard } from "../components/ProfileCard";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { listFavorites, removeFavorite } from "../modules/favorite/favoriteService";
import type { Favorite } from "../services/types";

export function FavoritesPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [removingProfileId, setRemovingProfileId] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const authToken = token;

    async function loadFavorites() {
      try {
        setIsLoading(true);
        setError("");
        setSuccess("");
        setFavorites(await listFavorites(authToken));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("pages.favorites.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadFavorites();
  }, [token]);

  async function handleRemove(profileId: string) {
    if (!token || removingProfileId) {
      return;
    }

    try {
      setRemovingProfileId(profileId);
      setError("");
      setSuccess("");
      await removeFavorite(token, profileId);
      setFavorites((current) => current.filter((favorite) => favorite.profileId !== profileId));
      setSuccess(t("pages.favorites.removeSuccess"));
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : t("pages.favorites.removeError"));
    } finally {
      setRemovingProfileId("");
    }
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow={t("pages.favorites.eyebrow")}
        title={t("pages.favorites.title")}
        description={t("pages.favorites.description")}
        badge={t("pages.favorites.badge")}
      />

      {error ? <StatusMessage tone="error" message={error} /> : null}
      {!error && success ? <StatusMessage tone="success" message={success} /> : null}

      <div className="card-grid">
        {isLoading ? <Loader label={t("pages.favorites.loading")} /> : null}
        {!isLoading && !error && !favorites.length ? (
          <EmptyState
            title={t("pages.favorites.emptyTitle")}
            description={t("pages.favorites.emptyDescription")}
          />
        ) : null}
        {!isLoading && !error
          ? favorites.map((favorite) => (
              <div className="favorite-item" key={favorite.id}>
                <ProfileCard profile={favorite.profile} />
                <button
                  className="button button-secondary"
                  disabled={removingProfileId === favorite.profileId}
                  onClick={() => void handleRemove(favorite.profileId)}
                  type="button"
                >
                  {removingProfileId === favorite.profileId ? t("common.actions.removing") : t("common.actions.remove")}
                </button>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
