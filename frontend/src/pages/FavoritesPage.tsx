import { useEffect, useState } from "react";
import { ProfileCard } from "../components/ProfileCard";
import { SectionHeader } from "../components/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { listFavorites, removeFavorite } from "../modules/favorite/favoriteService";
import type { Favorite } from "../services/types";

export function FavoritesPage() {
  const { token } = useAuth();
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
        setError(loadError instanceof Error ? loadError.message : "Unable to load favorites");
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
      setSuccess("Favorite removed successfully.");
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Unable to remove favorite");
    } finally {
      setRemovingProfileId("");
    }
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow="Favorites"
        title="Saved profiles"
        description="Quick access to the streamer profiles you care about most."
      />

      <div className="card-grid">
        {isLoading ? <div className="state-card">Loading favorites...</div> : null}
        {!isLoading && error ? <div className="form-error">{error}</div> : null}
        {!isLoading && !error && success ? <div className="form-success">{success}</div> : null}
        {!isLoading && !error && !favorites.length ? <div className="state-card">No favorites yet.</div> : null}
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
                  {removingProfileId === favorite.profileId ? "Removing..." : "Remove"}
                </button>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
