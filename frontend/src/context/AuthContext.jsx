import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { adminMe, employeeMe } from '../api/authApi';
import {
  clearStoredSession,
  ROLE_KEY,
  TOKEN_KEY,
  USER_KEY,
} from '../api/client';

const AuthContext = createContext(null);

const EMPTY_SESSION = {
  token: null,
  role: null,
  user: null,
};

const VALID_ROLES = ['EMPLOYEE', 'HOSPITAL_ADMIN'];

function readStoredUser() {
  try {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function readInitialSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const role = localStorage.getItem(ROLE_KEY);
  const user = readStoredUser();

  if (
    !token ||
    !VALID_ROLES.includes(role) ||
    !user ||
    typeof user !== 'object'
  ) {
    if (token || role || user) {
      clearStoredSession();
    }

    return EMPTY_SESSION;
  }

  return { token, role, user };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readInitialSession);

  const login = useCallback((role, response) => {
    const user =
      role === 'EMPLOYEE' ? response?.employee : response?.admin;

    if (!VALID_ROLES.includes(role) || !response?.token || !user) {
      throw new Error('The login response was missing a token or user.');
    }

    const nextSession = {
      token: response.token,
      role,
      user,
    };

    localStorage.setItem(TOKEN_KEY, nextSession.token);
    localStorage.setItem(ROLE_KEY, nextSession.role);
    localStorage.setItem(USER_KEY, JSON.stringify(nextSession.user));

    setSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(EMPTY_SESSION);
  }, []);

  useEffect(() => {
    if (!session.token || !session.role) {
      return undefined;
    }

    let cancelled = false;
    const loadProfile =
      session.role === 'HOSPITAL_ADMIN' ? adminMe : employeeMe;

    loadProfile()
      .then((user) => {
        if (cancelled || !user) {
          return;
        }

        setSession((current) => {
          if (current.token !== session.token) {
            return current;
          }

          localStorage.setItem(USER_KEY, JSON.stringify(user));
          return { ...current, user };
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [session.token, session.role]);

  const value = useMemo(
    () => ({
      token: session.token,
      role: session.role,
      user: session.user,
      isAuthenticated: Boolean(
        session.token && session.role && session.user
      ),
      login,
      logout,
    }),
    [session, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
