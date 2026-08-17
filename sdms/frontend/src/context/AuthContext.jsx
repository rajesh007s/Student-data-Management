import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('sdms_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sdms_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .getProfile()
      .then((res) => {
        setUser(res.data.data.user);
        localStorage.setItem('sdms_user', JSON.stringify(res.data.data.user));
      })
      .catch(() => {
        localStorage.removeItem('sdms_token');
        localStorage.removeItem('sdms_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login(email, password);
    const { user: u, token } = res.data.data;
    localStorage.setItem('sdms_token', token);
    localStorage.setItem('sdms_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sdms_token');
    localStorage.removeItem('sdms_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem('sdms_user', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
