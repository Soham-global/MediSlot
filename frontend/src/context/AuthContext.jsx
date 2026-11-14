import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

function readStoredAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const storedUser = localStorage.getItem("user");

  if (!token || !role) {
    return { token: null, role: null, user: null };
  }

  try {
    return {
      token,
      role,
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  } catch {
    localStorage.removeItem("user");
    return { token, role, user: null };
  }
}

export function homePathForRole(role) {
  return role === "HOSPITAL_ADMIN" ? "/admin" : "/doctors";
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStoredAuth());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuth(readStoredAuth());
    setLoading(false);
  }, []);

  useEffect(() => {
    const syncAuth = (event) => {
      if (!event.key || ["token", "role", "user"].includes(event.key)) {
        setAuth(readStoredAuth());
      }
    };

    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const login = useCallback((token, role, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(user || null));
    setAuth({ token, role, user: user || null });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setAuth({ token: null, role: null, user: null });
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!auth.token || !auth.role) {
      return null;
    }

    const profile =
      auth.role === "HOSPITAL_ADMIN"
        ? await authApi.getAdminProfile()
        : await authApi.getProfile();

    localStorage.setItem("user", JSON.stringify(profile));
    setAuth((current) => ({ ...current, user: profile }));
    return profile;
  }, [auth.token, auth.role]);

  const value = useMemo(
    () => ({
      token: auth.token,
      role: auth.role,
      user: auth.user,
      isAuthenticated: Boolean(auth.token && auth.role),
      loading,
      login,
      logout,
      refreshProfile,
    }),
    [auth, loading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
