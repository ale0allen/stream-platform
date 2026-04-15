import { useTranslation } from "react-i18next";
import { SectionHeader } from "../components/SectionHeader";
import { useAuth } from "../hooks/useAuth";
import { formatNumber } from "../utils/format";

export function HomePage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <section className="page">
      <SectionHeader
        eyebrow={t("pages.home.eyebrow")}
        title={t("pages.home.title")}
        description={t("pages.home.description")}
        badge={t("pages.home.badge")}
      />

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
