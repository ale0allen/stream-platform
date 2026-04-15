import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const { isAuthenticated, signUp } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await signUp(form);
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("common.feedback.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="form-card">
      <div className="form-heading">
        <span className="eyebrow">{t("auth.register.eyebrow")}</span>
        <h2>{t("auth.register.title")}</h2>
        <p className="muted">{t("auth.register.description")}</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>{t("auth.register.displayName")}</span>
          <input
            placeholder={t("auth.register.displayNamePlaceholder")}
            disabled={isSubmitting}
            value={form.displayName}
            onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
            required
          />
        </label>
        <label>
          <span>{t("auth.register.username")}</span>
          <input
            placeholder={t("auth.register.usernamePlaceholder")}
            disabled={isSubmitting}
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            required
          />
        </label>
        <label>
          <span>{t("auth.register.email")}</span>
          <input
            placeholder={t("auth.register.emailPlaceholder")}
            disabled={isSubmitting}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            type="email"
            required
          />
        </label>
        <label>
          <span>{t("auth.register.password")}</span>
          <input
            placeholder={t("auth.register.passwordPlaceholder")}
            disabled={isSubmitting}
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            type="password"
            required
          />
        </label>
        {error ? <StatusMessage tone="error" message={error} /> : null}
        <button className="button button-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? t("auth.register.submitting") : t("auth.register.submit")}
        </button>
      </form>
      <p className="form-footer">
        {t("auth.register.footer")}{" "}
        <Link to="/login" className="form-footer-link">
          {t("auth.register.footerLink")}
        </Link>
      </p>
    </div>
  );
}
