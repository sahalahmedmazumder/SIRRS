
import { useState, type FormEvent } from "react";
import { loginUser } from "../services/user_service";

interface LoginProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export default function Login({
  onSuccess,
  onRegisterClick,
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await loginUser({ email, password });

      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("user_role", response.user.role);
      localStorage.setItem("user", JSON.stringify(response.user));

      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-container login-page">
      <div className="login-decoration login-decoration-one" />
      <div className="login-decoration login-decoration-two" />

      <section className="auth-form login-card">
        <div className="login-brand">
          <div className="login-brand-logo">S</div>
          <span>SIRRS</span>
          <small>SMART ISSUE MANAGEMENT</small>
        </div>

        <div className="login-heading">
          <span className="login-eyebrow">WELCOME TO SIRRS</span>
          <h1>Welcome Back</h1>
          <p>
            Sign in to your account and take control of the
            issues that matter.
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="login-form-fields" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <span>→</span>}
          </button>
        </form>

        <div className="login-register">
          <span>Don't have an account?</span>
          <button
            type="button"
            className="auth-link"
            onClick={onRegisterClick}
          >
            Create an account
          </button>
        </div>

        <div className="login-footer">
          <span>© 2026 SIRRS</span>
          <span>Smart Issue Reporting and Resolution System</span>
        </div>
      </section>
    </main>
  );
}
