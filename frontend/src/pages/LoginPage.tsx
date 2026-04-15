import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState((location.state as { message?: string } | null)?.message ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("common.feedback.unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="form-card">
      <div className="form-heading">
        <span className="eyebrow">{t("auth.login.eyebrow")}</span>
        <h2>{t("auth.login.title")}</h2>
        <p className="muted">{t("auth.login.description")}</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        {message ? <StatusMessage tone="success" message={message} /> : null}
        <label>
          <span>{t("auth.login.email")}</span>
          <input
            placeholder={t("auth.login.emailPlaceholder")}
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>
        <label>
          <span>{t("auth.login.password")}</span>
          <input
            placeholder={t("auth.login.passwordPlaceholder")}
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </label>
        {error ? <StatusMessage tone="error" message={error} /> : null}
        <button className="button button-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? t("auth.login.submitting") : t("auth.login.submit")}
        </button>
      </form>
      <p className="form-footer">
        {t("auth.login.footer")}{" "}
        <Link to="/register" className="form-footer-link">
          {t("auth.login.footerLink")}
        </Link>
      </p>
    </div>
  );
}
