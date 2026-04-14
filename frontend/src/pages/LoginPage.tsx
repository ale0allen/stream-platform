import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(
    (location.state as { message?: string } | null)?.message ?? ""
  );
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
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="form-card">
      <div className="form-heading">
        <span className="eyebrow">Welcome back</span>
        <h2>Sign in to your workspace</h2>
        <p className="muted">Use your account to access creator profiles, favorites, and admin operations.</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        {message ? <StatusMessage tone="success" message={message} /> : null}
        <label>
          <span>Email</span>
          <input
            placeholder="you@company.com"
            disabled={isSubmitting}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            required
          />
        </label>
        <label>
          <span>Password</span>
          <input
            placeholder="Enter your password"
            disabled={isSubmitting}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
          />
        </label>
        {error ? <StatusMessage tone="error" message={error} /> : null}
        <button className="button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="form-footer">
        No account yet? <Link to="/register">Create one</Link>
      </p>
    </div>
  );
}
