import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";
import { listProfiles } from "../modules/discovery/discoveryService";
import { addFavorite, listFavorites, removeFavorite } from "../modules/favorite/favoriteService";
import type { Profile, StreamPlatformType } from "../services/types";

type PlatformFilter = "ALL" | Extract<StreamPlatformType, "TWITCH" | "YOUTUBE" | "KICK">;

const SEARCH_DEBOUNCE_MS = 350;
const PLATFORM_FILTERS: PlatformFilter[] = ["ALL", "TWITCH", "YOUTUBE", "KICK"];

function getPrimaryPlatform(profile: Profile, selectedPlatform: PlatformFilter) {
  if (selectedPlatform !== "ALL") {
    return profile.streamAccounts.find((account) => account.platform === selectedPlatform);
  }

  return profile.streamAccounts.find((account) => account.platform !== "OTHER") ?? profile.streamAccounts[0];
}

export function DiscoveryPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("ALL");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [favoriteProfileIds, setFavoriteProfileIds] = useState<Set<string>>(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [mutatingProfileId, setMutatingProfileId] = useState("");

  const filteredProfiles = useMemo(() => {
    if (platformFilter === "ALL") {
      return profiles;
    }

    return profiles.filter((profile) =>
      profile.streamAccounts.some((account) => account.platform === platformFilter)
    );
  }, [platformFilter, profiles]);

  useEffect(() => {
    setIsSearching(searchInput.trim() !== debouncedQuery.trim());
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchInput.trim());
      setIsSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [debouncedQuery, searchInput]);

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
        setProfiles(await listProfiles(authToken, debouncedQuery));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("pages.discovery.loadError"));
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfiles();
  }, [debouncedQuery, t, token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const authToken = token;

    async function loadFavoriteState() {
      try {
        setFavoriteProfileIds(new Set((await listFavorites(authToken)).map((favorite) => favorite.profileId)));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("pages.discovery.loadError"));
      }
    }

    void loadFavoriteState();
  }, [t, token]);

  async function handleToggleFavorite(profileId: string) {
    if (!token || mutatingProfileId) {
      return;
    }

    const isFavorite = favoriteProfileIds.has(profileId);

    try {
      setMutatingProfileId(profileId);
      setError("");
      setFeedback("");
      if (isFavorite) {
        await removeFavorite(token, profileId);
        setFavoriteProfileIds((current) => {
          const next = new Set(current);
          next.delete(profileId);
          return next;
        });
        setFeedback(t("pages.discovery.removeSuccess"));
      } else {
        await addFavorite(token, profileId);
        setFavoriteProfileIds((current) => new Set(current).add(profileId));
        setFeedback(t("pages.discovery.addSuccess"));
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("pages.discovery.toggleError"));
    } finally {
      setMutatingProfileId("");
    }
  }

  const showInitialLoading = isLoading && !profiles.length;
  const showSearchLoading = isLoading && profiles.length > 0;
  const hasActiveDiscoveryFilter = Boolean(debouncedQuery || platformFilter !== "ALL");

  function openPublicProfile(username: string) {
    navigate(`/u/${username}`);
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
        <div className="toolbar-actions discovery-toolbar-actions">
          <div className="platform-filter" aria-label={t("pages.discovery.filters.label")}>
            {PLATFORM_FILTERS.map((filter) => (
              <button
                className={platformFilter === filter ? "filter-chip is-active" : "filter-chip"}
                key={filter}
                onClick={() => setPlatformFilter(filter)}
                type="button"
              >
                {t(`pages.discovery.filters.${filter}`)}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            placeholder={t("pages.discovery.searchPlaceholder")}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
      </div>

      <div className="discovery-results-meta">
        <span className="table-summary">{t("pages.discovery.resultsSummary", { count: filteredProfiles.length })}</span>
        {isSearching || showSearchLoading ? <span className="search-status">{t("pages.discovery.searching")}</span> : null}
      </div>

      {error ? <StatusMessage tone="error" message={error} /> : null}
      {!error && feedback ? <StatusMessage tone="success" message={feedback} /> : null}

      <div className="card-grid discovery-grid" aria-busy={isLoading || isSearching}>
        {showInitialLoading ? <Loader label={t("pages.discovery.loading")} /> : null}
        {!isLoading && !error && !filteredProfiles.length ? (
          <EmptyState
            title={t("pages.discovery.emptyTitle")}
            description={hasActiveDiscoveryFilter ? t("pages.discovery.emptyFilteredDescription") : t("pages.discovery.emptyDescription")}
          />
        ) : null}
        {!isLoading && !error
          ? filteredProfiles.map((profile) => {
              const primaryPlatform = getPrimaryPlatform(profile, platformFilter);
              const isFavorite = favoriteProfileIds.has(profile.id);
              const isMutating = mutatingProfileId === profile.id;

              return (
                <article
                  className="card discovery-card is-clickable"
                  key={profile.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => openPublicProfile(profile.username)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openPublicProfile(profile.username);
                    }
                  }}
                >
                  <div className="discovery-card-header">
                    <Avatar
                      alt={profile.displayName}
                      className="discovery-avatar"
                      imageUrl={profile.avatarUrl}
                      label={profile.displayName || profile.username}
                    />
                    <div className="discovery-card-title">
                      <h3>{profile.displayName}</h3>
                      <p className="muted">@{profile.username}</p>
                    </div>
                    <span className="open-profile-indicator">{t("pages.discovery.openProfileShort")}</span>
                  </div>
                  <div className="discovery-platform-row">
                    {profile.streamAccounts.length ? (
                      profile.streamAccounts.slice(0, 3).map((account) => (
                        <span className={`platform-badge platform-${account.platform.toLowerCase()}`} key={account.id}>
                          {t(`pages.profile.platforms.${account.platform}`)}
                        </span>
                      ))
                    ) : (
                      <span className="platform-badge">{t("pages.discovery.noPlatform")}</span>
                    )}
                  </div>
                  <p className="discovery-card-bio">{profile.bio || t("profileCard.emptyBio")}</p>
                  <div className="discovery-card-footer">
                    {primaryPlatform ? (
                      <a href={primaryPlatform.channelUrl} rel="noreferrer" target="_blank" onClick={(event) => event.stopPropagation()}>
                        {primaryPlatform.platformUsername}
                      </a>
                    ) : (
                      <span>{t("pages.discovery.noLinkedAccount")}</span>
                    )}
                    <button className="button button-secondary open-profile-button" onClick={(event) => {
                      event.stopPropagation();
                      openPublicProfile(profile.username);
                    }} type="button">
                      {t("pages.discovery.openProfile")}
                    </button>
                    <button
                      className={isFavorite ? "button button-secondary favorite-toggle is-active" : "button button-secondary favorite-toggle"}
                      disabled={isMutating || Boolean(mutatingProfileId)}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleToggleFavorite(profile.id);
                      }}
                      type="button"
                    >
                      {isMutating
                        ? t("pages.discovery.favoriteToggle.loading")
                        : isFavorite
                          ? t("pages.discovery.favoriteToggle.remove")
                          : t("pages.discovery.favoriteToggle.add")}
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
