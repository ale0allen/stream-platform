import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { CreatorDiscoveryCard } from "../components/CreatorDiscoveryCard";
import { useAuth } from "../hooks/useAuth";
import { listProfiles, type DiscoverySortKey } from "../modules/discovery/discoveryService";
import { getDiscoveryHighlights } from "../modules/discovery/discoveryHighlightsService";
import { addFavorite, listFavorites, removeFavorite } from "../modules/favorite/favoriteService";
import type { DiscoveryHighlightsResponse, Profile, StreamPlatformType } from "../services/types";

type PlatformFilter = "ALL" | Extract<StreamPlatformType, "TWITCH" | "YOUTUBE" | "KICK">;

const SEARCH_DEBOUNCE_MS = 350;
const PLATFORM_FILTERS: PlatformFilter[] = ["ALL", "TWITCH", "YOUTUBE", "KICK"];
const LOADING_SKELETON_CARDS = 8;
const PAGE_SIZE = 8;
const DISCOVERY_DEFAULT_SORT: DiscoverySortKey = "name_asc";

export function DiscoveryPage() {
  const { token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("ALL");
  const [sortKey, setSortKey] = useState<DiscoverySortKey>(DISCOVERY_DEFAULT_SORT);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [highlights, setHighlights] = useState<DiscoveryHighlightsResponse | null>(null);
  const [highlightsError, setHighlightsError] = useState("");
  const [isHighlightsLoading, setIsHighlightsLoading] = useState(true);
  const [favoriteProfileIds, setFavoriteProfileIds] = useState<Set<string>>(() => new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [mutatingProfileId, setMutatingProfileId] = useState("");

  const totalPages = useMemo(() => {
    if (!totalCount) return 1;
    return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  }, [totalCount]);

  // Evita jumps de layout ao trocar page/sort/filtros: page sempre volta para 1.
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, platformFilter, sortKey]);

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
    const shouldUseInitialLoading = page === 1 && profiles.length === 0;

    async function loadProfiles() {
      try {
        if (shouldUseInitialLoading) {
          setIsLoading(true);
        } else {
          setIsFetching(true);
        }
        setError("");
        const result = await listProfiles(authToken, {
          query: debouncedQuery,
          platform: platformFilter,
          sort: sortKey,
          page,
          size: PAGE_SIZE
        });
        setProfiles(result.items);
        setTotalCount(result.totalCount);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : t("pages.discovery.loadError"));
      } finally {
        if (shouldUseInitialLoading) {
          setIsLoading(false);
        } else {
          setIsFetching(false);
        }
      }
    }

    void loadProfiles();
  }, [debouncedQuery, page, platformFilter, sortKey, t, token]);

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

  useEffect(() => {
    if (!token) {
      setIsHighlightsLoading(false);
      return;
    }

    const authToken = token;
    let isCurrent = true;

    async function loadHighlights() {
      try {
        setIsHighlightsLoading(true);
        setHighlightsError("");
        const result = await getDiscoveryHighlights(authToken, 6);
        if (!isCurrent) return;
        setHighlights(result);
      } catch (e) {
        if (!isCurrent) return;
        setHighlights(null);
        setHighlightsError(e instanceof Error ? e.message : t("pages.discovery.highlights.loadError"));
      } finally {
        if (!isCurrent) return;
        setIsHighlightsLoading(false);
      }
    }

    void loadHighlights();

    return () => {
      isCurrent = false;
    };
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
  const hasActiveDiscoveryFilter = Boolean(debouncedQuery || platformFilter !== "ALL");

  function openPublicProfile(username: string) {
    navigate(`/u/${username}`);
  }

  function clearDiscoveryFilters() {
    setSearchInput("");
    setDebouncedQuery("");
    setIsSearching(false);
    setPlatformFilter("ALL");
    setSortKey(DISCOVERY_DEFAULT_SORT);
    setPage(1);
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow={t("pages.discovery.eyebrow")}
        title={t("pages.discovery.title")}
        description={t("pages.discovery.description")}
        badge={t("pages.discovery.badge")}
      />

      {!debouncedQuery && platformFilter === "ALL" && page === 1 ? (
        <div className="discovery-highlights">
          <div className="section-block">
            <div className="section-block-copy">
              <strong>{t("pages.discovery.highlights.featuredTitle")}</strong>
              <p className="muted">{t("pages.discovery.highlights.featuredDescription")}</p>
            </div>
            {isHighlightsLoading ? <Loader compact label={t("pages.discovery.highlights.loading")} /> : null}
            {!isHighlightsLoading && highlightsError ? <StatusMessage tone="error" message={highlightsError} /> : null}
            {!isHighlightsLoading && highlights?.featured?.length ? (
              <div className="card-grid discovery-grid discovery-highlights-grid">
                {highlights.featured.slice(0, 4).map((profile) => (
                  <CreatorDiscoveryCard
                    key={`featured-${profile.id}`}
                    profile={profile}
                    platformFilter="ALL"
                    isFavorite={favoriteProfileIds.has(profile.id)}
                    isMutating={mutatingProfileId === profile.id}
                    isAnyMutating={Boolean(mutatingProfileId)}
                    onOpenPublicProfile={openPublicProfile}
                    onToggleFavorite={(profileId) => void handleToggleFavorite(profileId)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="section-block">
            <div className="section-block-copy">
              <strong>{t("pages.discovery.highlights.recentTitle")}</strong>
              <p className="muted">{t("pages.discovery.highlights.recentDescription")}</p>
            </div>
            {!isHighlightsLoading && highlights?.recent?.length ? (
              <div className="card-grid discovery-grid discovery-highlights-grid">
                {highlights.recent.slice(0, 4).map((profile) => (
                  <CreatorDiscoveryCard
                    key={`recent-${profile.id}`}
                    profile={profile}
                    platformFilter="ALL"
                    isFavorite={favoriteProfileIds.has(profile.id)}
                    isMutating={mutatingProfileId === profile.id}
                    isAnyMutating={Boolean(mutatingProfileId)}
                    onOpenPublicProfile={openPublicProfile}
                    onToggleFavorite={(profileId) => void handleToggleFavorite(profileId)}
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="section-block">
            <div className="section-block-copy">
              <strong>{t("pages.discovery.highlights.completeTitle")}</strong>
              <p className="muted">{t("pages.discovery.highlights.completeDescription")}</p>
            </div>
            {!isHighlightsLoading && highlights?.complete?.length ? (
              <div className="card-grid discovery-grid discovery-highlights-grid">
                {highlights.complete.slice(0, 4).map((profile) => (
                  <CreatorDiscoveryCard
                    key={`complete-${profile.id}`}
                    profile={profile}
                    platformFilter="ALL"
                    isFavorite={favoriteProfileIds.has(profile.id)}
                    isMutating={mutatingProfileId === profile.id}
                    isAnyMutating={Boolean(mutatingProfileId)}
                    onOpenPublicProfile={openPublicProfile}
                    onToggleFavorite={(profileId) => void handleToggleFavorite(profileId)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

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
                aria-pressed={platformFilter === filter}
                type="button"
              >
                {t(`pages.discovery.filters.${filter}`)}
              </button>
            ))}
          </div>
          <div className="discovery-sort">
            <select
              className="discovery-sort-select"
              value={sortKey}
              aria-label={t("pages.discovery.sort.label")}
              onChange={(event) => setSortKey(event.target.value as DiscoverySortKey)}
            >
              <option value="recent">{t("pages.discovery.sort.recent")}</option>
              <option value="name_asc">{t("pages.discovery.sort.name_asc")}</option>
              <option value="name_desc">{t("pages.discovery.sort.name_desc")}</option>
              <option value="complete">{t("pages.discovery.sort.complete")}</option>
            </select>
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
        <span className="table-summary">{t("pages.discovery.resultsSummary", { count: totalCount })}</span>
        {isSearching || isFetching ? <span className="search-status">{t("pages.discovery.searching")}</span> : null}
      </div>

      {error ? <StatusMessage tone="error" message={error} /> : null}
      {!error && feedback ? <StatusMessage tone="success" message={feedback} /> : null}

      <div className="card-grid discovery-grid" aria-busy={isLoading || isFetching || isSearching}>
        {showInitialLoading ? (
          <>
            <Loader compact label={t("pages.discovery.loading")} />
            {Array.from({ length: LOADING_SKELETON_CARDS }, (_, index) => (
              <article className="card discovery-card discovery-card-skeleton" key={`discovery-skeleton-${index}`} aria-hidden="true">
                <div className="discovery-card-header">
                  <div className="discovery-skeleton-avatar" />
                  <div className="discovery-card-title">
                    <div className="discovery-skeleton-line is-title" />
                    <div className="discovery-skeleton-line is-subtitle" />
                  </div>
                  <div className="discovery-skeleton-pill" />
                </div>
                <div className="discovery-platform-row">
                  <div className="discovery-skeleton-badge" />
                  <div className="discovery-skeleton-badge" />
                  <div className="discovery-skeleton-badge" />
                </div>
                <div className="discovery-skeleton-paragraph">
                  <div className="discovery-skeleton-line" />
                  <div className="discovery-skeleton-line" />
                  <div className="discovery-skeleton-line is-short" />
                </div>
                <div className="discovery-card-footer">
                  <div className="discovery-skeleton-line is-link" />
                  <div className="discovery-skeleton-button" />
                  <div className="discovery-skeleton-button" />
                </div>
              </article>
            ))}
          </>
        ) : null}
        {!isLoading && !error && !profiles.length && totalCount === 0 ? (
          <EmptyState
            title={t("pages.discovery.emptyTitle")}
            description={hasActiveDiscoveryFilter ? t("pages.discovery.emptyFilteredDescription") : t("pages.discovery.emptyDescription")}
            action={
              hasActiveDiscoveryFilter ? (
                <button className="button button-secondary" onClick={clearDiscoveryFilters} type="button">
                  {t("pages.discovery.clearFilters")}
                </button>
              ) : null
            }
          />
        ) : null}
        {!isLoading && !error
          ? profiles.map((profile) => (
              <CreatorDiscoveryCard
                key={profile.id}
                profile={profile}
                platformFilter={platformFilter}
                isFavorite={favoriteProfileIds.has(profile.id)}
                isMutating={mutatingProfileId === profile.id}
                isAnyMutating={Boolean(mutatingProfileId)}
                onOpenPublicProfile={openPublicProfile}
                onToggleFavorite={(profileId) => void handleToggleFavorite(profileId)}
              />
            ))
          : null}
      </div>

      {totalCount > 0 && !error ? (
        <div className="discovery-pagination">
          <button
            className="button button-secondary"
            type="button"
            disabled={page <= 1 || isSearching || isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            {t("pages.discovery.pagination.previous")}
          </button>
          <span className="discovery-pagination-info">
            {t("pages.discovery.pagination.pageInfo", { page, totalPages })}
          </span>
          <button
            className="button button-secondary"
            type="button"
            disabled={page >= totalPages || isSearching || isFetching}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            {t("pages.discovery.pagination.next")}
          </button>
        </div>
      ) : null}
    </section>
  );
}
