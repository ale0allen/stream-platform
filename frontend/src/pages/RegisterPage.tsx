import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StatusMessage } from "../components/StatusMessage";
import { useAuth } from "../hooks/useAuth";

export function RegisterPage() {
  const { isAuthenticated, signUp } = useAuth();
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
      setError(submitError instanceof Error ? submitError.message : "Unable to create account");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="form-card">
      <div className="form-heading">
        <span className="eyebrow">Get started</span>
        <h2>Create your account</h2>
        <p className="muted">Set up the first account for the creator workspace and land directly in the app.</p>
      </div>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span>Display name</span>
          <input
            placeholder="Creator team"
            disabled={isSubmitting}
            value={form.displayName}
            onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
            required
          />
        </label>
        <label>
          <span>Username</span>
          <input
            placeholder="creatorteam"
            disabled={isSubmitting}
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            required
          />
        </label>
        <label>
          <span>Email</span>
          <input
            placeholder="you@company.com"
            disabled={isSubmitting}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            type="email"
            required
          />
        </label>
        <label>
          <span>Password</span>
          <input
            placeholder="Create a password"
            disabled={isSubmitting}
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            type="password"
            required
          />
        </label>
        {error ? <StatusMessage tone="error" message={error} /> : null}
        <button className="button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="form-footer">
        Already registered? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
