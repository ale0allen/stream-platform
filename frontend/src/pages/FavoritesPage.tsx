import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { listFavorites, removeFavorite } from "../modules/favorite/favoriteService";
import type { Favorite, Profile } from "../services/types";

const REMOVE_TRANSITION_MS = 140;

function getPrimaryPlatform(profile: Profile) {
  return profile.streamAccounts.find((account) => account.platform !== "OTHER") ?? profile.streamAccounts[0];
}

export function FavoritesPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [removingProfileId, setRemovingProfileId] = useState("");
  const [removingVisualIds, setRemovingVisualIds] = useState<Set<string>>(() => new Set());

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
  }, [t, token]);

  async function handleRemove(profileId: string) {
    if (!token || removingProfileId) {
      return;
    }

    const removedFavorite = favorites.find((favorite) => favorite.profileId === profileId);

    try {
      setRemovingProfileId(profileId);
      setRemovingVisualIds((current) => new Set(current).add(profileId));
      setError("");
      setSuccess("");
      const removeRequest = removeFavorite(token, profileId)
        .then(() => null)
        .catch((requestError: unknown) => requestError);
      await new Promise((resolve) => window.setTimeout(resolve, REMOVE_TRANSITION_MS));
      setFavorites((current) => current.filter((favorite) => favorite.profileId !== profileId));
      const requestError = await removeRequest;
      if (requestError) {
        throw requestError;
      }
      setSuccess(t("pages.favorites.removeSuccess"));
    } catch (removeError) {
      if (removedFavorite) {
        setFavorites((current) =>
          current.some((favorite) => favorite.id === removedFavorite.id) ? current : [removedFavorite, ...current]
        );
      }
      setError(removeError instanceof Error ? removeError.message : t("pages.favorites.removeError"));
    } finally {
      setRemovingProfileId("");
      setRemovingVisualIds((current) => {
        const next = new Set(current);
        next.delete(profileId);
        return next;
      });
    }
  }

  function handleCardNavigation(profileId: string) {
    navigate(`/profiles/${profileId}`);
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow={t("pages.favorites.eyebrow")}
        title={t("pages.favorites.title")}
        description={t("pages.favorites.description")}
        badge={t("pages.favorites.badge")}
      />

      <div className="toolbar card toolbar-card">
        <div className="toolbar-copy">
          <strong>{t("pages.favorites.summaryTitle")}</strong>
          <span className="muted">{t("pages.favorites.summaryDescription")}</span>
        </div>
        <span className="table-summary">{t("pages.favorites.savedCount", { count: favorites.length })}</span>
      </div>

      {error ? <StatusMessage tone="error" message={error} /> : null}
      {!error && success ? <StatusMessage tone="success" message={success} /> : null}

      <div className="card-grid favorites-grid">
        {isLoading ? <Loader label={t("pages.favorites.loading")} /> : null}
        {!isLoading && !error && !favorites.length ? (
          <EmptyState
            title={t("pages.favorites.emptyTitle")}
            description={t("pages.favorites.emptyDescription")}
            action={
              <Link className="button" to="/discovery">
                {t("pages.favorites.emptyAction")}
              </Link>
            }
          />
        ) : null}
        {!isLoading && !error
          ? favorites.map((favorite) => {
              const primaryPlatform = getPrimaryPlatform(favorite.profile);
              const isRemoving = removingProfileId === favorite.profileId;

              return (
                <article
                  className={removingVisualIds.has(favorite.profileId) ? "card discovery-card favorite-card is-removing" : "card discovery-card favorite-card"}
                  key={favorite.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => handleCardNavigation(favorite.profileId)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleCardNavigation(favorite.profileId);
                    }
                  }}
                >
                  <div className="discovery-card-header">
                    <Avatar
                      alt={favorite.profile.displayName}
                      className="discovery-avatar"
                      imageUrl={favorite.profile.avatarUrl}
                      label={favorite.profile.displayName || favorite.profile.username}
                    />
                    <div className="discovery-card-title">
                      <h3>{favorite.profile.displayName}</h3>
                      <p className="muted">@{favorite.profile.username}</p>
                    </div>
                    <span className={`platform-badge platform-${(primaryPlatform?.platform ?? "OTHER").toLowerCase()}`}>
                      {primaryPlatform ? t(`pages.profile.platforms.${primaryPlatform.platform}`) : t("pages.favorites.noPlatform")}
                    </span>
                  </div>
                  <p className="discovery-card-bio">{favorite.profile.bio || t("profileCard.emptyBio")}</p>
                  <div className="discovery-card-footer">
                    {primaryPlatform ? (
                      <a
                        href={primaryPlatform.channelUrl}
                        rel="noreferrer"
                        target="_blank"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {primaryPlatform.platformUsername}
                      </a>
                    ) : (
                      <span>{t("pages.favorites.noLinkedAccount")}</span>
                    )}
                  <button
                    className="button button-secondary favorite-toggle remove-favorite-button"
                    disabled={isRemoving || Boolean(removingProfileId)}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleRemove(favorite.profileId);
                    }}
                    type="button"
                  >
                    {isRemoving ? t("common.actions.removing") : t("pages.favorites.removeAction")}
                  </button>
                  </div>
                </article>
              );
            })
          : null}
      </div>
    </section>
  );
}
