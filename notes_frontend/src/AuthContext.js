import React, { createContext, useEffect, useState, useContext } from "react";

// PUBLIC_INTERFACE
export const AuthContext = createContext();

/**
 * AuthProvider wraps the app and manages authentication state, provides login/register/logout,
 * and persists token to localStorage.
 */
// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Optionally, decode token or validate with backend to set initial user details
    if (token) {
      setUser({ token }); // In real app, parse user info from token or a "me" endpoint
    } else {
      setUser(null);
    }
  }, [token]);

  // PUBLIC_INTERFACE
  const login = async (username, password) => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!resp.ok) {
        let msg = "Login failed";
        try {
          const data = await resp.json();
          msg += data?.detail ? `: ${data.detail}` : "";
        } catch (_) {/* ignore */}
        throw new Error(msg);
      }
      const data = await resp.json();
      if (data && data.token) {
        setToken(data.token);
        localStorage.setItem("authToken", data.token);
        setUser({ token: data.token, username }); // You may want to adjust this structure
      } else {
        throw new Error("Malformed response from backend");
      }
    } catch (err) {
      setError(err.message || "Unknown error");
      setUser(null);
      setToken(null);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const register = async (username, password, email) => {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });
      if (!resp.ok) {
        let msg = "Registration failed";
        try {
          const data = await resp.json();
          msg += data?.detail ? `: ${data.detail}` : "";
        } catch (_) {/* ignore */}
        throw new Error(msg);
      }
      // Registration succeeded. Now auto-login:
      await login(username, password);
    } catch (err) {
      setError(err.message || "Unknown error");
      setUser(null);
      setToken(null);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  // PUBLIC_INTERFACE
  const logout = async () => {
    setLoading(true);
    setError("");
    try {
      if (token) {
        await fetch("/api/auth/logout/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (_) {
      // Ignore network/logout errors; always clear client state
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    setLoading(false);
  };

  // PUBLIC_INTERFACE
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{
      user, token, loading, error, isAuthenticated, login, register, logout, setError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}
