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
    <div className="auth-panel" style={{ maxWidth: 340, margin: "auto", marginTop: 28 }}>
      {mode === "login" ?
        (<form onSubmit={handleLogin}>
          <h2>Login</h2>
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
            />
          </label>
          <br />
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </label>
          <br />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          <button type="button" onClick={() => { setMode("register"); setError(""); }} style={{ marginLeft: 8 }}>
            Register
          </button>
          {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
        </form>)
        :
        (<form onSubmit={handleRegister}>
          <h2>Register</h2>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </label>
          <br />
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </label>
          <br />
          <label>
            Password:
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </label>
          <br />
          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
          <button type="button" onClick={() => { setMode("login"); setError(""); }} style={{ marginLeft: 8 }}>
            Back to Login
          </button>
          {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
        </form>)
      }
    </div>
  );
}
