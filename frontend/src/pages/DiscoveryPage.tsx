import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { ProfileCard } from "../components/ProfileCard";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { listProfiles } from "../modules/discovery/discoveryService";
import { addFavorite } from "../modules/favorite/favoriteService";
import type { Profile } from "../services/types";

export function DiscoveryPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [addingProfileId, setAddingProfileId] = useState("");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const authToken = token;

    async function loadProfiles() {
      try {
        setIsLoading(true);
        setError("");
        setProfiles(await listProfiles(authToken, query));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("pages.discovery.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfiles();
  }, [query, token]);

  async function handleAddFavorite(profileId: string) {
    if (!token || addingProfileId) {
      return;
    }

    try {
      setAddingProfileId(profileId);
      setError("");
      setFeedback("");
      await addFavorite(token, profileId);
      setFeedback(t("pages.discovery.addSuccess"));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("pages.discovery.addError"));
    } finally {
      setAddingProfileId("");
    }
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow={t("pages.discovery.eyebrow")}
        title={t("pages.discovery.title")}
        description={t("pages.discovery.description")}
        badge={t("pages.discovery.badge")}
      />

      <div className="toolbar card toolbar-card">
        <div className="toolbar-copy">
          <strong>{t("pages.discovery.searchTitle")}</strong>
          <span className="muted">{t("pages.discovery.searchDescription")}</span>
        </div>
        <input
          className="search-input"
          placeholder={t("pages.discovery.searchPlaceholder")}
          disabled={isLoading}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {error ? <StatusMessage tone="error" message={error} /> : null}
      {!error && feedback ? <StatusMessage tone="success" message={feedback} /> : null}

      <div className="card-grid">
        {isLoading ? <Loader label={t("pages.discovery.loading")} /> : null}
        {!isLoading && !error && !profiles.length ? (
          <EmptyState
            title={t("pages.discovery.emptyTitle")}
            description={t("pages.discovery.emptyDescription")}
          />
        ) : null}
        {!isLoading && !error
          ? profiles.map((profile) => (
              <div className="favorite-item" key={profile.id}>
                <ProfileCard profile={profile} />
                <button
                  className="button button-secondary"
                  disabled={addingProfileId === profile.id}
                  onClick={() => void handleAddFavorite(profile.id)}
                  type="button"
                >
                  {addingProfileId === profile.id ? t("common.actions.adding") : t("common.actions.addToFavorites")}
                </button>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
