import { Link, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className="auth-shell">
      <div className="auth-panel auth-panel-brand">
        <span className="eyebrow">{t("auth.hero.eyebrow")}</span>
        <h1>{t("auth.hero.title")}</h1>
        <p>{t("auth.hero.description")}</p>
        <div className="auth-feature-grid">
          <div className="auth-feature-card">
            <strong>{t("auth.hero.feature1Title")}</strong>
            <span>{t("auth.hero.feature1Description")}</span>
          </div>
          <div className="auth-feature-card">
            <strong>{t("auth.hero.feature2Title")}</strong>
            <span>{t("auth.hero.feature2Description")}</span>
          </div>
        </div>
      </div>
      <div className="auth-panel">
        <header className="auth-header">
          <Link to="/" className="brand auth-brand">
            <span className="brand-mark brand-mark-small">SP</span>
            <span className="brand-title">{t("common.brand")}</span>
          </Link>
        </header>
        <div className="auth-form-wrap">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
