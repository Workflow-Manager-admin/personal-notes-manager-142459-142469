import React, { useState } from "react";
import { useAuth } from "./AuthContext";

/**
 * Renders authentication forms: login, register, logout status.
 * Usage: place <Auth /> where relevant (e.g. at top of app or in dedicated page).
 */

// PUBLIC_INTERFACE
export default function Auth() {
  const { isAuthenticated, user, login, register, logout, loading, error, setError } = useAuth();
  const [mode, setMode] = useState("login"); // or "register"
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: ""
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear errors on typing
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(form.username, form.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await register(form.username, form.password, form.email);
  };

  if (isAuthenticated) {
    return (
      <div className="auth-panel">
        <div>
          You are logged in{user && user.username ? ` as ${user.username}` : ""}.
        </div>
        <button className="theme-toggle" style={{ marginTop: 12 }} onClick={logout} disabled={loading}>
          Log out
        </button>
      </div>
    );
  }

  return (
    <div className="auth-panel" style={{ maxWidth: 370, margin: "34px auto 28px auto", width:"100%" }}>
      {mode === "login" ? (
        <form onSubmit={handleLogin}>
          <h2 style={{ color: "var(--primary)", marginBottom: 13, marginTop: 0 }}>Login</h2>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoFocus
              required
              autoComplete="username"
              style={{width: "100%"}}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              style={{width: "100%"}}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="accent"
            style={{
              background: "var(--accent)",
              color: "var(--secondary)",
              fontWeight: 700,
              fontSize: "16px",
              marginTop: "14px"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); }}
            className="secondary"
            style={{
              marginLeft: 7,
              fontWeight: 500,
              fontSize: "16px",
              background:"none",
              borderColor:"var(--primary)",
              color:"var(--primary)"
            }}
          >
            Register
          </button>
          {error && (
            <div style={{ color: "#c62828", marginTop: 13, fontWeight: 500 }}>
              {error}
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <h2 style={{ color: "var(--primary)", marginBottom: 13, marginTop: 0 }}>Register</h2>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              style={{width: "100%"}}
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              style={{width: "100%"}}
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{width: "100%"}}
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="accent"
            style={{
              background: "var(--accent)",
              color: "var(--secondary)",
              fontWeight: 700,
              fontSize: "16px",
              marginTop: "14px"
            }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            className="secondary"
            style={{
              marginLeft: 7,
              fontWeight: 500,
              fontSize: "16px",
              background:"none",
              borderColor:"var(--primary)",
              color:"var(--primary)"
            }}
          >
            Back to Login
          </button>
          {error && (
            <div style={{ color: "#c62828", marginTop: 13, fontWeight: 500 }}>
              {error}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
