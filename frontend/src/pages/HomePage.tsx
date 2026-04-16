import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "../components/Loader";
import { SectionHeader } from "../components/SectionHeader";
import { StatusMessage } from "../components/StatusMessage";
import { CreatorDiscoveryCard } from "../components/CreatorDiscoveryCard";
import { useAuth } from "../hooks/useAuth";
import { getMyProfile } from "../modules/profile/profileService";
import { calculateProfileCompletion } from "../modules/profile/profileCompletion";
import { ProfileOnboardingCard } from "../components/ProfileOnboardingCard";
import { getCreatorMetrics } from "../modules/metrics/creatorMetricsService";
import { getDiscoveryHighlights } from "../modules/discovery/discoveryHighlightsService";
import { formatNumber } from "../utils/format";
import type { CreatorMetricsResponse, DiscoveryHighlightsResponse, Profile } from "../services/types";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const { user, token } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profileCompletion, setProfileCompletion] = useState<ReturnType<typeof calculateProfileCompletion> | null>(null);
  const [profileIsLoading, setProfileIsLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [metrics, setMetrics] = useState<CreatorMetricsResponse | null>(null);
  const [highlights, setHighlights] = useState<DiscoveryHighlightsResponse | null>(null);
  const [secondaryError, setSecondaryError] = useState("");

  useEffect(() => {
    if (!token) {
      setProfileIsLoading(false);
      return;
    }

    const authToken = token;

    let isCurrent = true;

    async function loadProfile() {
      try {
        setProfileIsLoading(true);
        setProfileError("");
        const myProfile = await getMyProfile(authToken);
        if (!isCurrent) return;
        setProfile(myProfile);
        setProfileCompletion(
          calculateProfileCompletion({
            displayName: myProfile.displayName ?? "",
            username: myProfile.username ?? "",
            bio: myProfile.bio ?? "",
            avatarUrl: myProfile.avatarUrl ?? null,
            streamAccounts: myProfile.streamAccounts ?? []
          })
        );
      } catch (e) {
        if (!isCurrent) return;
        setProfileError(e instanceof Error ? e.message : t("pages.home.onboarding.loadError"));
      } finally {
        if (!isCurrent) return;
        setProfileIsLoading(false);
      }
    }

    void loadProfile();

    return () => {
      isCurrent = false;
    };
  }, [t, token]);

  const isNewUser = useMemo(() => {
    if (!profileCompletion) return false;
    const missingCount = profileCompletion.totalCount - profileCompletion.completedCount;
    return profileCompletion.percent <= 20 && missingCount >= 3;
  }, [profileCompletion]);

  const shouldShowEcosystem = useMemo(() => {
    if (!profileCompletion) return false;
    return profileCompletion.percent >= 60;
  }, [profileCompletion]);

  useEffect(() => {
    if (!token || !shouldShowEcosystem) {
      return;
    }

    const authToken = token;
    let isCurrent = true;

    async function loadSecondary() {
      try {
        setSecondaryError("");
        const [metricsResult, highlightsResult] = await Promise.all([
          getCreatorMetrics(authToken),
          getDiscoveryHighlights(authToken, 6)
        ]);
        if (!isCurrent) return;
        setMetrics(metricsResult);
        setHighlights(highlightsResult);
      } catch (e) {
        if (!isCurrent) return;
        setMetrics(null);
        setHighlights(null);
        setSecondaryError(e instanceof Error ? e.message : t("pages.home.ecosystem.loadError"));
      }
    }

    void loadSecondary();

    return () => {
      isCurrent = false;
    };
  }, [shouldShowEcosystem, t, token]);

  function openPublicProfile(username: string) {
    navigate(`/u/${username}`);
  }

  return (
    <section className="page">
      <SectionHeader
        eyebrow={t("pages.home.eyebrow")}
        title={t("pages.home.title")}
        description={t("pages.home.description")}
        badge={t("pages.home.badge")}
      />

      {profileIsLoading ? <Loader compact label={t("pages.home.onboarding.loading")} /> : null}
      {!profileIsLoading && profileError ? <StatusMessage tone="error" message={profileError} /> : null}
      {!profileIsLoading && profile && profileCompletion ? (
        <ProfileOnboardingCard profile={profile} completion={profileCompletion} isNewUser={isNewUser} />
      ) : null}

      {!profileIsLoading && shouldShowEcosystem ? (
        <div className="section-block">
          <div className="section-block-copy">
            <strong>{t("pages.home.ecosystem.title")}</strong>
            <p className="muted">{t("pages.home.ecosystem.description")}</p>
          </div>

          {secondaryError ? <StatusMessage tone="error" message={secondaryError} /> : null}

          {metrics ? (
            <div className="stats-grid">
              <article className="card stat-card accent-card">
                <span className="stat-index">{formatNumber(1).padStart(2, "0")}</span>
                <strong className="metric-value">{metrics.totalCreators}</strong>
                <p className="muted">{t("pages.home.ecosystem.metrics.totalCreators")}</p>
              </article>
              <article className="card stat-card">
                <span className="stat-index">{formatNumber(2).padStart(2, "0")}</span>
                <strong className="metric-value">{metrics.completeProfiles}</strong>
                <p className="muted">{t("pages.home.ecosystem.metrics.completeProfiles")}</p>
              </article>
              <article className="card stat-card">
                <span className="stat-index">{formatNumber(3).padStart(2, "0")}</span>
                <strong className="metric-value">{metrics.linkedAccounts}</strong>
                <p className="muted">{t("pages.home.ecosystem.metrics.linkedAccounts")}</p>
              </article>
            </div>
          ) : null}

          {highlights?.featured?.length ? (
            <div className="section-block">
              <div className="section-block-copy">
                <strong>{t("pages.home.ecosystem.featuredTitle")}</strong>
                <p className="muted">{t("pages.home.ecosystem.featuredDescription")}</p>
              </div>
              <div className="card-grid discovery-grid discovery-highlights-grid">
                {highlights.featured.slice(0, 4).map((creator) => (
                  <CreatorDiscoveryCard
                    key={`home-featured-${creator.id}`}
                    profile={creator}
                    platformFilter="ALL"
                    isFavorite={false}
                    isMutating={false}
                    isAnyMutating={false}
                    onOpenPublicProfile={openPublicProfile}
                    onToggleFavorite={() => {}}
                  />
                ))}
              </div>
              <div className="card-actions">
                <button className="button button-secondary" type="button" onClick={() => navigate("/discovery")}>
                  {t("pages.home.ecosystem.actions.openDiscovery")}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="hero-panel card">
        <div className="hero-panel-main">
          <span className="eyebrow">{t("pages.home.heroEyebrow")}</span>
          <h3>{t("pages.home.heroTitle")}</h3>
          <p className="muted">{t("pages.home.heroDescription")}</p>
          <div className="hero-badges">
            <span className="hero-badge">{t("pages.home.heroPrimaryBadge")}</span>
            <span className="hero-badge">{t("pages.home.heroSecondaryBadge")}</span>
            <span className="hero-badge">{t("pages.home.heroTertiaryBadge")}</span>
          </div>
        </div>
        <div className="hero-metrics">
          <div className="hero-metric">
            <span className="metric-label">{t("pages.home.signedInAs")}</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="hero-metric">
            <span className="metric-label">{t("pages.home.roleLabel")}</span>
            <strong>{user?.role ? t(`common.role.${user.role}`) : ""}</strong>
          </div>
          <div className="hero-metric">
            <span className="metric-label">{t("pages.home.platformState")}</span>
            <strong>{t("pages.home.platformReady")}</strong>
          </div>
        </div>
      </div>

      <div className="section-block">
        <div className="section-block-copy">
          <strong>{t("pages.home.statsTitle")}</strong>
          <p className="muted">{t("pages.home.statsDescription")}</p>
        </div>

        <div className="stats-grid">
          <article className="card stat-card accent-card">
            <span className="stat-index">{formatNumber(1).padStart(2, "0")}</span>
            <strong>{t("pages.home.cards.profileOpsTitle")}</strong>
            <p className="muted">{t("pages.home.cards.profileOpsDescription")}</p>
          </article>
          <article className="card stat-card">
            <span className="stat-index">{formatNumber(2).padStart(2, "0")}</span>
            <strong>{t("pages.home.cards.discoveryTitle")}</strong>
            <p className="muted">{t("pages.home.cards.discoveryDescription")}</p>
          </article>
          <article className="card stat-card">
            <span className="stat-index">{formatNumber(3).padStart(2, "0")}</span>
            <strong>{t("pages.home.cards.platformTitle")}</strong>
            <p className="muted">{t("pages.home.cards.platformDescription")}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
